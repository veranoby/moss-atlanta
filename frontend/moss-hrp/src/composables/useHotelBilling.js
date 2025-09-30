import { ref } from 'vue';
import { pb } from '@/plugins/pocketbase';

/**
 * A Vue composable to manage hotel-specific financial reporting and billing data aggregation
 */
export function useHotelBilling() {
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch hotel's payroll history for a date range
   * @param {string} hotelId - The ID of the hotel
   * @param {Object} dateRange - Date range to fetch payroll for
   * @param {string} dateRange.startDate - Start date in YYYY-MM-DD format
   * @param {string} dateRange.endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array<PayrollRecord>>} - Promise resolving to array of payroll records
   */
  async function fetchHotelPayrollHistory(hotelId, dateRange = {}) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!hotelId) {
        throw new Error('hotelId is required');
      }
      
      // Build filter string
      let filter = `hotel='${hotelId}'`;
      
      if (dateRange.startDate) {
        filter += ` && week_start>='${dateRange.startDate}'`;
      }
      
      if (dateRange.endDate) {
        filter += ` && week_end<='${dateRange.endDate}'`;
      }
      
      // Add status filter to exclude draft payrolls
      filter += ` && status!='draft'`;
      
      const result = await pb.collection('payroll').getList(1, 500, {
        filter,
        expand: 'hotel,approved_by',
        sort: '-week_start'
      });
      
      return result.items;
    } catch (err) {
      console.error(`Error fetching payroll history for hotel ${hotelId}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get monthly aggregation for a hotel
   * @param {string} hotelId - The ID of the hotel
   * @param {number} year - The year to calculate for
   * @param {number} month - The month to calculate for (1-12)
   * @returns {Promise<{totalHours, totalAmount, weekCount, avgWeeklyHours}>} - Aggregated stats for the month
   */
  async function getMonthlyAggregation(hotelId, year, month) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!hotelId || !year || !month) {
        throw new Error('hotelId, year, and month are required');
      }
      
      // Calculate start and end dates for the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      
      // Calculate end date of the month
      const nextMonth = new Date(year, month, 1);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthEnd = new Date(nextMonth - 1);
      const endDate = monthEnd.toISOString().split('T')[0];
      
      const result = await pb.collection('payroll').getList(1, 500, {
        filter: `hotel='${hotelId}' && week_start>='${startDate}' && week_end<='${endDate}' && status!='draft'`,
        fields: 'total_hours,total_amount,week_start,week_end',
        sort: '+week_start'
      });
      
      // Aggregate in JavaScript after fetching (NOT in database)
      let totalHours = 0;
      let totalAmount = 0;
      let weekCount = 0;
      
      for (const record of result.items) {
        totalHours += parseFloat(record.total_hours) || 0;
        totalAmount += parseFloat(record.total_amount) || 0;
        weekCount++;
      }
      
      const avgWeeklyHours = weekCount > 0 ? totalHours / weekCount : 0;
      
      return {
        totalHours,
        totalAmount,
        weekCount,
        avgWeeklyHours
      };
    } catch (err) {
      console.error(`Error calculating monthly aggregation for hotel ${hotelId} in ${year}-${month}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get YTD summary for a hotel
   * @param {string} hotelId - The ID of the hotel
   * @param {number} year - The year to calculate for
   * @returns {Promise<{totalHours, totalAmount, monthlyBreakdown}>} - YTD summary
   */
  async function getYTDSummary(hotelId, year) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!hotelId || !year) {
        throw new Error('hotelId and year are required');
      }
      
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const result = await pb.collection('payroll').getList(1, 500, {
        filter: `hotel='${hotelId}' && week_start>='${startDate}' && week_end<='${endDate}' && status!='draft'`,
        fields: 'total_hours,total_amount,week_start,week_end',
        sort: '+week_start'
      });
      
      // Initialize monthly breakdown
      const monthlyBreakdown = {
        1: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        2: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        3: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        4: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        5: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        6: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        7: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        8: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        9: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        10: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        11: { totalHours: 0, totalAmount: 0, weekCount: 0 },
        12: { totalHours: 0, totalAmount: 0, weekCount: 0 }
      };
      
      // Aggregate data month by month
      let totalHours = 0;
      let totalAmount = 0;
      
      for (const record of result.items) {
        // Determine month from week_start
        const month = parseInt(record.week_start.split('-')[1]);
        
        if (month >= 1 && month <= 12) {
          monthlyBreakdown[month].totalHours += parseFloat(record.total_hours) || 0;
          monthlyBreakdown[month].totalAmount += parseFloat(record.total_amount) || 0;
          monthlyBreakdown[month].weekCount += 1;
        }
        
        totalHours += parseFloat(record.total_hours) || 0;
        totalAmount += parseFloat(record.total_amount) || 0;
      }
      
      return {
        totalHours,
        totalAmount,
        monthlyBreakdown
      };
    } catch (err) {
      console.error(`Error calculating YTD summary for hotel ${hotelId} in year ${year}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    fetchHotelPayrollHistory,
    getMonthlyAggregation,
    getYTDSummary
  };
}

export default useHotelBilling;