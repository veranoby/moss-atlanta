import { ref, readonly } from 'vue';
import { pb } from './usePocketbase';

/**
 * Composable for managing the complete hiring workflow in MOSS HRP system.
 * Handles applications, candidate management, and the hiring process.
 */
export function useHiringWorkflow() {
  const applications = ref([]);
  const candidates = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Application status workflow: applied → reviewed → interviewed → hired/rejected
   */
  const applicationStatuses = [
    { value: 'applied', title: 'Aplicado', color: 'blue' },
    { value: 'reviewed', title: 'Revisado', color: 'orange' },
    { value: 'interviewed', title: 'Entrevistado', color: 'purple' },
    { value: 'hired', title: 'Contratado', color: 'green' },
    { value: 'rejected', title: 'Rechazado', color: 'red' }
  ];

  /**
   * Fetches all applications with expanded relationships
   */
  const fetchApplications = async () => {
    loading.value = true;
    error.value = null;
    try {
      const records = await pb.collection('applications').getFullList({
        sort: '-created',
        expand: 'open_position,open_position.position,open_position.department',
      });
      
      applications.value = records.map(record => ({
        ...record,
        position_name: record.expand?.open_position?.expand?.position?.name || 'N/A',
        department_name: record.expand?.open_position?.expand?.department?.name || 'N/A',
        area: record.expand?.open_position?.area || 'N/A',
        salary_range: record.expand?.open_position ? 
          `$${record.expand.open_position.salary_min} - $${record.expand.open_position.salary_max}` : 'N/A'
      }));
      
      return applications.value;
    } catch (e) {
      error.value = e;
      console.error('MOSS HRP Error: Failed to fetch applications:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetches applications grouped by open position
   */
  const fetchApplicationsByPosition = async () => {
    const apps = await fetchApplications();
    const grouped = {};
    
    apps.forEach(app => {
      const positionId = app.open_position;
      if (!grouped[positionId]) {
        grouped[positionId] = {
          position_name: app.position_name,
          department_name: app.department_name,
          area: app.area,
          salary_range: app.salary_range,
          applications: []
        };
      }
      grouped[positionId].applications.push(app);
    });
    
    return grouped;
  };

  /**
   * Updates application status with audit trail
   */
  const updateApplicationStatus = async (applicationId, newStatus, notes = '') => {
    try {
      const updateData = {
        status: newStatus,
        status_notes: notes,
        reviewed_at: new Date().toISOString()
      };

      const record = await pb.collection('applications').update(applicationId, updateData);
      
      // Create audit log entry
      await pb.collection('audit_logs').create({
        table_name: 'applications',
        record_id: applicationId,
        action: 'status_change',
        changes: { status: newStatus },
        notes: notes,
        user_id: pb.authStore.model?.id
      });

      await fetchApplications(); // Refresh list
      return record;
    } catch (e) {
      console.error('MOSS HRP Error: Failed to update application status:', e);
      throw e;
    }
  };

  /**
   * Bulk update multiple applications status
   */
  const bulkUpdateApplications = async (applicationIds, newStatus, notes = '') => {
    try {
      const promises = applicationIds.map(id => 
        updateApplicationStatus(id, newStatus, notes)
      );
      
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.error('MOSS HRP Error: Failed to bulk update applications:', e);
      throw e;
    }
  };

  /**
   * Hire candidate - creates employee record and updates application
   */
  const hireCandidate = async (applicationId, employeeData) => {
    try {
      // Start transaction-like operations
      const application = applications.value.find(app => app.id === applicationId);
      if (!application) throw new Error('Application not found');

      // Create employee record with application data
      const newEmployeeData = {
        first_name: application.candidate_first_name,
        last_name: application.candidate_last_name,
        email: application.candidate_email,
        phone: application.candidate_phone,
        hired_date: new Date().toISOString().split('T')[0],
        status: 'active',
        ...employeeData // Additional data from hiring form
      };

      const employeeRecord = await pb.collection('employees').create(newEmployeeData);

      // Update application status to hired
      await updateApplicationStatus(applicationId, 'hired', 
        `Hired as employee ID: ${employeeRecord.id}`);

      // Update open position status if this fills the position
      if (employeeData.fills_position) {
        await pb.collection('open_positions').update(application.open_position, {
          status: 'filled',
          filled_date: new Date().toISOString()
        });
      }

      return employeeRecord;
    } catch (e) {
      console.error('MOSS HRP Error: Failed to hire candidate:', e);
      throw e;
    }
  };

  /**
   * Reject candidate with reason
   */
  const rejectCandidate = async (applicationId, reason = '') => {
    try {
      await updateApplicationStatus(applicationId, 'rejected', reason);
      return true;
    } catch (e) {
      console.error('MOSS HRP Error: Failed to reject candidate:', e);
      throw e;
    }
  };

  /**
   * Get candidate profile with all application history
   */
  const getCandidateProfile = async (candidateEmail) => {
    try {
      const candidateApplications = await pb.collection('applications').getFullList({
        filter: `candidate_email = "${candidateEmail}"`,
        expand: 'open_position,open_position.position,open_position.department',
        sort: '-created'
      });

      if (candidateApplications.length === 0) return null;

      const candidate = {
        email: candidateEmail,
        first_name: candidateApplications[0].candidate_first_name,
        last_name: candidateApplications[0].candidate_last_name,
        phone: candidateApplications[0].candidate_phone,
        applications: candidateApplications.map(app => ({
          ...app,
          position_name: app.expand?.open_position?.expand?.position?.name || 'N/A',
          department_name: app.expand?.open_position?.expand?.department?.name || 'N/A',
          area: app.expand?.open_position?.area || 'N/A'
        }))
      };

      return candidate;
    } catch (e) {
      console.error('MOSS HRP Error: Failed to get candidate profile:', e);
      throw e;
    }
  };

  /**
   * Search and filter applications
   */
  const searchApplications = (searchTerm, statusFilter = null) => {
    let filtered = applications.value;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.candidate_first_name?.toLowerCase().includes(term) ||
        app.candidate_last_name?.toLowerCase().includes(term) ||
        app.candidate_email?.toLowerCase().includes(term) ||
        app.position_name?.toLowerCase().includes(term) ||
        app.area?.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    return filtered;
  };

  /**
   * Get application statistics
   */
  const getApplicationStats = () => {
    const stats = {
      total: applications.value.length,
      by_status: {}
    };

    applicationStatuses.forEach(status => {
      stats.by_status[status.value] = applications.value.filter(
        app => app.status === status.value
      ).length;
    });

    return stats;
  };

  return {
    // State
    applications: readonly(applications),
    candidates: readonly(candidates),
    loading: readonly(loading),
    error: readonly(error),
    
    // Constants
    applicationStatuses,
    
    // Methods
    fetchApplications,
    fetchApplicationsByPosition,
    updateApplicationStatus,
    bulkUpdateApplications,
    hireCandidate,
    rejectCandidate,
    getCandidateProfile,
    searchApplications,
    getApplicationStats
  };
}