import { ref } from 'vue';
import { pb } from '@/plugins/pocketbase';

/**
 * A Vue composable to manage individual employee timesheet aggregation and payroll history
 */
export function useEmployeeTimesheet() {
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch employee punch records for a date range
   * @param {string} employeeId - The ID of the employee
   * @param {Object} dateRange - Date range to fetch punches for
   * @param {string} dateRange.startDate - Start date in YYYY-MM-DD format
   * @param {string} dateRange.endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array<PunchRecord>>} - Promise resolving to array of punch records
   */
  async function fetchEmployeePunches(employeeId, dateRange = {}) {
    loading.value = true;
    error.value = null;
    
    try {
      // Validate required parameters
      if (!employeeId || !dateRange.startDate || !dateRange.endDate) {
        throw new Error('employeeId, startDate, and endDate are required');
      }
      
      // Ensure employeeId corresponds to an assignment for this employee
      const result = await pb.collection('punches').getList(1, 200, {
        filter: `assignment.employee='${employeeId}' && timestamp>='${dateRange.startDate}' && timestamp<='${dateRange.endDate}'`,
        expand: 'assignment.employee,assignment.hotel,assignment.position',
        sort: '+timestamp'
      });
      
      return result.items;
    } catch (err) {
      console.error(`Error fetching punches for employee ${employeeId}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Calculate daily hours from punch records following business logic
   * @param {Array} punches - Array of punch records sorted by timestamp
   * @returns {Array<{date, totalHours, details}>} - Array of daily hour calculations
   */
  async function calculateDailyHours(punches) {
    if (!Array.isArray(punches) || punches.length === 0) {
      return [];
    }

    // Group punches by work_date (CRITICAL: work_date = clock_in date, not punch timestamp)
    // We need to find the clock_in punch first to determine the work_date for all punches in that cycle
    const punchesByDate = {};

    // First pass: group by raw date to identify cycles
    const tempGrouping = {};
    for (const punch of punches) {
      const date = new Date(punch.timestamp);
      const dateKey = date.toISOString().split('T')[0];

      if (!tempGrouping[dateKey]) {
        tempGrouping[dateKey] = [];
      }
      tempGrouping[dateKey].push(punch);
    }

    // Second pass: identify work_date from clock_in punch
    // If clock_in exists, all punches in that cycle use clock_in date as work_date
    // Otherwise fallback to punch timestamp date
    for (const [dateKey, datePunches] of Object.entries(tempGrouping)) {
      const clockInPunch = datePunches.find(p => p.type === 'clock_in');
      const workDate = clockInPunch
        ? new Date(clockInPunch.timestamp).toISOString().split('T')[0]
        : dateKey;

      if (!punchesByDate[workDate]) {
        punchesByDate[workDate] = [];
      }
      punchesByDate[workDate].push(...datePunches);
    }
    
    const result = [];
    
    for (const [date, datePunches] of Object.entries(punchesByDate)) {
      // Sort punches by type to ensure proper sequence: clock_in, break_start, break_end, clock_out
      const sortedPunches = datePunches.sort((a, b) => {
        const order = { 'clock_in': 0, 'break_start': 1, 'break_end': 2, 'clock_out': 3 };
        return (order[a.type] || 99) - (order[b.type] || 99);
      });
      
      // Identify 4-punch sequence
      const punchTypes = sortedPunches.map(p => p.type);
      const clockIn = sortedPunches.find(p => p.type === 'clock_in');
      const breakStart = sortedPunches.find(p => p.type === 'break_start');
      const breakEnd = sortedPunches.find(p => p.type === 'break_end');
      const clockOut = sortedPunches.find(p => p.type === 'clock_out');
      
      let totalHours = 0;
      let details = {
        clockIn: clockIn ? clockIn.timestamp : null,
        breakStart: breakStart ? breakStart.timestamp : null,
        breakEnd: breakEnd ? breakEnd.timestamp : null,
        clockOut: clockOut ? clockOut.timestamp : null,
        hasCompleteSequence: !!(clockIn && breakStart && breakEnd && clockOut),
        hasGap: false
      };
      
      // Calculate total hours based on 4-punch sequence
      if (clockIn && breakStart && breakEnd && clockOut) {
        // (break_start - clock_in) + (clock_out - break_end) in hours
        const firstSegment = new Date(breakStart.timestamp) - new Date(clockIn.timestamp);
        const secondSegment = new Date(clockOut.timestamp) - new Date(breakEnd.timestamp);
        totalHours = (firstSegment + secondSegment) / (1000 * 60 * 60); // Convert ms to hours
      } else if (clockIn && clockOut) {
        // If we have clock_in and clock_out but missing break punches, calculate total time
        const totalTime = new Date(clockOut.timestamp) - new Date(clockIn.timestamp);
        // If break is expected but missing, we might need to subtract a default break time
        // For now, we'll calculate the full time but mark it as having incomplete punches
        totalHours = totalTime / (1000 * 60 * 60);
        details.hasGap = true;
      } else {
        // Incomplete data
        details.hasGap = true;
      }
      
      result.push({
        date,
        totalHours,
        details
      });
    }
    
    return result;
  }

  /**
   * Fetch employee's payroll history for a specific year
   * @param {string} employeeId - The ID of the employee
   * @param {number} year - The year to fetch payroll items for
   * @returns {Promise<Array<PayrollItemRecord>>} - Promise resolving to array of payroll item records
   */
  async function fetchEmployeePayrollHistory(employeeId, year) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!employeeId || !year) {
        throw new Error('employeeId and year are required');
      }
      
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const result = await pb.collection('payroll_items').getList(1, 500, {
        filter: `assignment.employee='${employeeId}' && payroll.week_start>='${startDate}' && payroll.week_start<='${endDate}'`,
        expand: 'payroll.hotel,assignment.position',
        sort: '-payroll.week_start'
      });
      
      return result.items;
    } catch (err) {
      console.error(`Error fetching payroll history for employee ${employeeId} in year ${year}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Calculate weekly summary for an employee
   * @param {string} employeeId - The ID of the employee
   * @param {string} weekStart - Start of the week in YYYY-MM-DD format
   * @returns {Promise<{totalHours, daysWorked, estimatedPay, overtimeHours}>} - Weekly summary
   */
  async function getWeeklySummary(employeeId, weekStart) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!employeeId || !weekStart) {
        throw new Error('employeeId and weekStart are required');
      }
      
      // Calculate week end (6 days after start)
      const weekStartObj = new Date(weekStart);
      const weekEndObj = new Date(weekStartObj);
      weekEndObj.setDate(weekStartObj.getDate() + 6);
      const weekEnd = weekEndObj.toISOString().split('T')[0];
      
      // Fetch punches for the week
      const punches = await fetchEmployeePunches(employeeId, {
        startDate: weekStart,
        endDate: weekEnd
      });
      
      // Calculate daily hours
      const dailyHours = await calculateDailyHours(punches);
      
      // Sum total hours
      let totalHours = 0;
      let daysWorked = 0;
      
      for (const day of dailyHours) {
        totalHours += day.totalHours;
        if (day.totalHours > 0) {
          daysWorked++;
        }
      }
      
      // Find employee's hourly rate from their assignment
      let hourlyRate = 0;
      if (punches.length > 0) {
        // Get the assignment information from the first punch
        const firstPunch = punches[0];
        if (firstPunch.expand && firstPunch.expand.assignment) {
          hourlyRate = firstPunch.expand.assignment.hourly_rate || 0;
        }
      }
      
      // Calculate estimated pay
      const estimatedPay = totalHours * hourlyRate;
      
      // Calculate overtime (hours > 40 in a week)
      const overtimeHours = totalHours > 40 ? totalHours - 40 : 0;
      
      return {
        totalHours,
        daysWorked,
        estimatedPay,
        overtimeHours
      };
    } catch (err) {
      console.error(`Error calculating weekly summary for employee ${employeeId} for week starting ${weekStart}:`, err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    fetchEmployeePunches,
    calculateDailyHours,
    fetchEmployeePayrollHistory,
    getWeeklySummary
  };
}

export default useEmployeeTimesheet;