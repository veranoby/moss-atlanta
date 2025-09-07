import { ref, computed } from 'vue';
import { pb } from '@/composables/usePocketbase';

/**
 * A Vue composable to manage the business logic for the payroll reconciliation process.
 */
export function useReconciliation() {
  const loading = ref(false);
  const payrollPeriods = ref([]);
  const activeReconciliation = ref(null); // Holds the full data for the 3-column modal

  /**
   * Calculates and categorizes discrepancies between hotel and MOSS data.
   */
  const discrepancies = computed(() => {
    if (!activeReconciliation.value || !activeReconciliation.value.expand?.line_items) {
      return { high: [], low: [], none: [] };
    }
    
    const high = [];
    const low = [];
    const none = [];
    
    activeReconciliation.value.expand.line_items.forEach(line => {
      const hotelHours = line.hotel_hours || 0;
      const mossHours = line.moss_hours || 0;
      const discrepancyPercent = hotelHours > 0 ? Math.abs((mossHours - hotelHours) / hotelHours) * 100 : 0;
      
      const discrepancyData = {
        employeeId: line.employee,
        employeeName: line.expand?.employee?.name || 'Unknown',
        hotelHours,
        mossHours,
        discrepancyPercent,
        discrepancy: mossHours - hotelHours,
      };
      
      if (discrepancyPercent > 5) {
        high.push(discrepancyData);
      } else if (discrepancyPercent > 0) {
        low.push(discrepancyData);
      } else {
        none.push(discrepancyData);
      }
    });
    
    return { high, low, none };
  });

  /**
   * Fetches the list of payroll periods from PocketBase.
   * @param {object} [filters={}] - Optional filters (e.g., by hotel).
   */
  async function fetchPayrollPeriods(filters = {}) {
    loading.value = true;
    try {
      const filterParts = Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}="${value}"`);

      const pbFilter = filterParts.join(' && ');

      const result = await pb.collection('payroll_periods').getFullList({
        filter: pbFilter,
        sort: '-start_date',
        expand: 'hotel,reconciliation_status', // Assuming relations exist
      });
      payrollPeriods.value = result;
    } catch (error) {
      console.error("Failed to fetch payroll periods:", error);
      payrollPeriods.value = []; // Reset on error
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetches the detailed data needed for the 3-column reconciliation modal.
   * @param {string} periodId - The ID of the payroll_period record.
   */
  /**
   * Performance-optimized reconciliation data loading with caching
   */
  const reconciliationCache = new Map();
  
  async function loadReconciliationData(periodId) {
    // Check cache first for performance
    const cacheKey = `reconciliation_${periodId}`;
    if (reconciliationCache.has(cacheKey)) {
      activeReconciliation.value = reconciliationCache.get(cacheKey);
      return;
    }
    
    loading.value = true;
    activeReconciliation.value = null;
    
    try {
      // Performance: Use Promise.all for parallel data fetching
      const [reconciliationRecord, lineItems] = await Promise.all([
        pb.collection('reconciliations').getFirstListItem(`payroll_period="${periodId}"`, {
          fields: 'id,payroll_period,status,created,updated',
        }),
        pb.collection('reconciliation_line_items').getFullList({
          filter: `reconciliation="${periodId}"`,
          expand: 'employee',
          fields: 'id,employee,hotel_hours,moss_hours,final_hours,justification,is_approved,expand.employee.name',
          sort: 'expand.employee.name', // Sort by employee name for consistent ordering
        })
      ]);
      
      // Combine the data efficiently
      const combinedData = {
        ...reconciliationRecord,
        expand: {
          line_items: lineItems
        }
      };
      
      activeReconciliation.value = combinedData;
      
      // Cache for 5 minutes to improve performance
      reconciliationCache.set(cacheKey, combinedData);
      setTimeout(() => {
        reconciliationCache.delete(cacheKey);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error(`Failed to fetch reconciliation for period ${periodId}:`, error);
      activeReconciliation.value = null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Bulk approve items with discrepancy <5%.
   * @param {Array} employeeIds - Array of employee IDs to approve.
   */
  async function bulkApprove(employeeIds) {
    loading.value = true;
    try {
      const approvedItems = [];
      
      for (const employeeId of employeeIds) {
        const lineItem = activeReconciliation.value.expand.line_items.find(
          item => item.employee === employeeId
        );
        
        if (lineItem) {
          const discrepancyPercent = lineItem.hotel_hours > 0 
            ? Math.abs((lineItem.moss_hours - lineItem.hotel_hours) / lineItem.hotel_hours) * 100 
            : 0;
          
          if (discrepancyPercent <= 5) {
            approvedItems.push({
              employee_id: employeeId,
              final_hours: lineItem.moss_hours,
              is_approved: true,
              approved_at: new Date().toISOString(),
              approval_reason: 'bulk_auto_approved_under_5_percent',
            });
          }
        }
      }
      
      // Update the reconciliation record
      await pb.collection('reconciliations').update(activeReconciliation.value.id, {
        bulk_approved_items: approvedItems,
        status: 'in_progress'
      });
      
      // Create audit log entries
      for (const item of approvedItems) {
        await createAuditLog('bulk_approved', {
          employee_id: item.employee_id,
          final_hours: item.final_hours,
          approval_reason: item.approval_reason,
        });
      }
      
      // Refresh the reconciliation data
      await loadReconciliationData(activeReconciliation.value.id);
      
      return { success: true, approvedCount: approvedItems.length };
    } catch (error) {
      console.error('Bulk approval failed:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Saves individual reconciliation with justification.
   * @param {object} data - Reconciliation data with justification.
   */
  async function saveReconciliationItem(data) {
    loading.value = true;
    try {
      const { employeeId, finalHours, justification, discrepancyPercent } = data;
      
      // Update the line item
      await pb.collection('reconciliation_line_items').update(employeeId, {
        final_hours: finalHours,
        justification,
        is_approved: true,
        approved_at: new Date().toISOString(),
      });
      
      // Create audit log
      await createAuditLog('hours_approved', {
        employee_id: employeeId,
        final_hours: finalHours,
        justification: discrepancyPercent > 5 ? justification : null,
        discrepancy_percent: discrepancyPercent,
      });
      
      // Refresh data
      await loadReconciliationData(activeReconciliation.value.id);
      
      return { success: true };
    } catch (error) {
      console.error('Save reconciliation item failed:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Creates an audit log entry.
   * @param {string} action - The action performed.
   * @param {object} details - Action details.
   */
  async function createAuditLog(action, details) {
    try {
      await pb.collection('audit_logs').create({
        reconciliation_id: activeReconciliation.value.id,
        action,
        details: JSON.stringify(details),
        employee_id: details.employee_id || null,
        user: pb.authStore.model?.id,
        created: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw here - audit logging shouldn't break the main flow
    }
  }

  /**
   * Saves the final, approved hours for a reconciliation.
   * @param {string} reconciliationId - The ID of the reconciliation record.
   * @param {object} finalData - The final, approved data.
   */
  async function saveFinalHours(reconciliationId, finalData) {
    loading.value = true;
    try {
      await pb.collection('reconciliations').update(reconciliationId, { 
        final_data: finalData, 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: pb.authStore.model?.id,
      });
      
      // Create final audit log
      await createAuditLog('reconciliation_completed', {
        reconciliation_id: reconciliationId,
        total_employees: Object.keys(finalData).length,
      });
      
    } catch (error) {
      console.error(`Failed to save final hours for ${reconciliationId}:`, error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    payrollPeriods,
    activeReconciliation,
    discrepancies,
    fetchPayrollPeriods,
    loadReconciliationData,
    bulkApprove,
    saveReconciliationItem,
    createAuditLog,
    saveFinalHours,
  };
}
