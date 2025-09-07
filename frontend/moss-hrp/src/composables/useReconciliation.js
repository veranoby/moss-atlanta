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
   * Calculates discrepancies between hotel and MOSS data.
   * This is a placeholder for the complex comparison logic.
   */
  const discrepancies = computed(() => {
    if (!activeReconciliation.value) return [];
    console.log("Placeholder: Calculating discrepancies...");
    // Example: find employees in one list but not the other, or with different hours.
    return [];
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
  async function loadReconciliationData(periodId) {
    loading.value = true;
    activeReconciliation.value = null;
    try {
      // In a real scenario, this would be a complex query, likely to a single
      // 'reconciliations' collection record that has relations to the line items.
      console.log(`Placeholder: Fetching all data for period ${periodId}`);
      // Simulate fetching the structured data.
      const reconciliationRecord = await pb.collection('reconciliations').getFirstListItem(`payroll_period="${periodId}"`, {
        expand: 'line_items' // Assuming a structure like this
      });
      activeReconciliation.value = reconciliationRecord;
    } catch (error) {
      console.error(`Failed to fetch reconciliation for period ${periodId}:`, error);
    } finally {
      loading.value = false;
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
      console.log(`Placeholder: Saving final hours for ${reconciliationId}`, finalData);
      // This would update the 'final' column data and create audit logs.
      await pb.collection('reconciliations').update(reconciliationId, { final_data: finalData, status: 'approved' });
    } catch (error) {
      console.error(`Failed to save final hours for ${reconciliationId}:`, error);
      throw error; // Re-throw to be handled by the UI
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
    saveFinalHours,
  };
}
