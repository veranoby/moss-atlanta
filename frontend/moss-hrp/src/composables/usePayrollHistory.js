import { ref, computed } from 'vue';
import { pb } from '@/plugins/pocketbase';

/**
 * A Vue composable to manage the business logic for historical payroll data.
 * Provides functions to query payroll data for completed periods.
 */
export function usePayrollHistory() {
  const payrollHistory = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const filters = ref({
    hotel: null,
    startDate: null,
    endDate: null,
    status: ['approved', 'sent_to_quickbooks', 'paid']
  });

  /**
   * Fetch historical payroll records with optional filters
   * @param {Object} filterParams - Filters for the query
   * @param {string} [filterParams.hotel] - Filter by hotel ID
   * @param {string} [filterParams.startDate] - Filter by start date (YYYY-MM-DD)
   * @param {string} [filterParams.endDate] - Filter by end date (YYYY-MM-DD)
   * @param {Array<string>} [filterParams.status] - Filter by status values
   * @returns {Promise<Array<PayrollRecord>>} - Promise resolving to array of payroll records
   */
  async function fetchPayrollHistory(filterParams = {}) {
    loading.value = true;
    error.value = null;
    
    try {
      // Build filter string combining default filter with user filters
      const filterParts = [];

      // Status filter: use user-provided status OR default to completed statuses
      if (filterParams.status && Array.isArray(filterParams.status) && filterParams.status.length > 0) {
        const statusFilters = filterParams.status.map(s => `status='${s}'`).join(' || ');
        filterParts.push(`(${statusFilters})`);
      } else {
        // Default filter: only completed payrolls
        filterParts.push(`(status='approved' || status='sent_to_quickbooks' || status='paid')`);
      }

      // Add user filters if provided
      if (filterParams.hotel) {
        filterParts.push(`hotel='${filterParams.hotel}'`);
      }

      if (filterParams.startDate) {
        filterParts.push(`week_start>='${filterParams.startDate}'`);
      }

      if (filterParams.endDate) {
        filterParts.push(`week_end<='${filterParams.endDate}'`);
      }

      const combinedFilter = filterParts.join(' && ');

      const result = await pb.collection('payroll').getList(1, 50, {
        filter: combinedFilter,
        expand: 'hotel,approved_by',
        fields: 'id,hotel,week_start,week_end,total_hours,total_amount,status,quickbooks_batch_id,generated_at',
        sort: '-week_start',
        page: 1,
        perPage: 50
      });
      
      payrollHistory.value = result.items;
      return result.items;
    } catch (err) {
      console.error('Error fetching payroll history:', err);
      error.value = err;
      payrollHistory.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch specific payroll with all payroll_items
   * @param {string} payrollId - The ID of the payroll record
   * @returns {Promise<{payroll: Object, items: Array}>} - Promise resolving to payroll and its items
   */
  async function fetchPayrollDetails(payrollId) {
    loading.value = true;
    error.value = null;
    
    try {
      // Get payroll record
      const payroll = await pb.collection('payroll').getOne(payrollId, {
        expand: 'hotel,approved_by'
      });
      
      // Get associated payroll items
      const itemsResult = await pb.collection('payroll_items').getList(1, 200, {
        filter: `payroll='${payrollId}'`,
        expand: 'assignment.employee,assignment.position'
      });
      
      return {
        payroll,
        items: itemsResult.items
      };
    } catch (err) {
      console.error(`Error fetching payroll details for ${payrollId}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Calculate YTD aggregated stats for a hotel
   * @param {string} hotelId - The ID of the hotel
   * @param {number} year - The year to calculate for
   * @returns {Promise<{totalHours, totalAmount, avgWeekly, periodCount}>} - Aggregated stats
   */
  async function getPayrollSummary(hotelId, year) {
    loading.value = true;
    error.value = null;
    
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const result = await pb.collection('payroll').getList(1, 500, {
        filter: `hotel='${hotelId}' && week_start>='${startDate}' && week_end<='${endDate}' && status!='draft'`,
        expand: 'hotel',
        fields: 'total_hours,total_amount,week_start,week_end,status',
        sort: '+week_start'
      });
      
      // Aggregate in JavaScript (NOT database)
      let totalHours = 0;
      let totalAmount = 0;
      let periodCount = 0;
      
      result.items.forEach(record => {
        if (record.total_hours) totalHours += parseFloat(record.total_hours);
        if (record.total_amount) totalAmount += parseFloat(record.total_amount);
        periodCount++;
      });
      
      const avgWeekly = periodCount > 0 ? totalAmount / periodCount : 0;
      
      return {
        totalHours,
        totalAmount,
        avgWeekly,
        periodCount
      };
    } catch (err) {
      console.error(`Error calculating payroll summary for hotel ${hotelId} in year ${year}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    payrollHistory,
    loading,
    error,
    filters,
    fetchPayrollHistory,
    fetchPayrollDetails,
    getPayrollSummary
  };
}

export default usePayrollHistory;