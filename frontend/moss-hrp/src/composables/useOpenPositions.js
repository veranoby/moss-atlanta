import { ref, readonly } from 'vue';
import { pb } from './usePocketbase';

/**
 * Composable for managing open positions in the MOSS HRP system.
 * It provides functions for CRUD operations and for fetching related
 * data needed for forms, while respecting business rules like area privacy.
 */
export function useOpenPositions() {
  const openPositions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetches all open positions from Pocketbase.
   * It expands related department and position records for detailed display.
   * It assumes each `open_positions` record has an `area` text field.
   */
  const fetchOpenPositions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const records = await pb.collection('open_positions').getFullList({
        sort: '-created',
        expand: 'department,position',
      });
      openPositions.value = records.map(record => ({
        ...record,
        department_name: record.expand?.department?.name || 'N/A',
        position_name: record.expand?.position?.name || 'N/A',
      }));
    } catch (e) {
      error.value = e;
      console.error('MOSS HRP Error: Failed to fetch open positions:', e);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Creates a new open position.
   * @param {object} data - The data for the new position record.
   */
  const createOpenPosition = async (data) => {
    try {
      const record = await pb.collection('open_positions').create(data);
      await fetchOpenPositions(); // Refresh the list after creation
      return record;
    } catch (e) {
      console.error('MOSS HRP Error: Failed to create open position:', e);
      throw e; // Re-throw for the UI component to handle and display errors
    }
  };

  /**
   * Updates an existing open position.
   * @param {string} id - The ID of the position to update.
   * @param {object} data - The data to update.
   */
  const updateOpenPosition = async (id, data) => {
    try {
      const record = await pb.collection('open_positions').update(id, data);
      await fetchOpenPositions(); // Refresh the list after update
      return record;
    } catch (e) {
      console.error('MOSS HRP Error: Failed to update open position:', e);
      throw e;
    }
  };

  /**
   * Deletes an open position.
   * @param {string} id - The ID of the position to delete.
   */
  const deleteOpenPosition = async (id) => {
    try {
      await pb.collection('open_positions').delete(id);
      await fetchOpenPositions(); // Refresh the list after deletion
    } catch (e) {
      console.error('MOSS HRP Error: Failed to delete open position:', e);
      throw e;
    }
  };

  /**
   * Fetches auxiliary data needed for forms, such as areas, departments, and positions.
   * It derives a unique list of areas from the hotels collection to enforce privacy rules.
   */
  const fetchFormData = async () => {
    try {
      const [hotels, departments, positions] = await Promise.all([
        pb.collection('hotels').getFullList({ sort: 'name', fields: 'area' }),
        pb.collection('departments').getFullList({ sort: 'name' }),
        pb.collection('positions').getFullList({ sort: 'name' }),
      ]);

      // Create a unique list of areas from all hotels.
      // This ensures the form shows Areas, not specific hotels, per requirements.
      const areaNames = [...new Set(hotels.map(h => h.area).filter(Boolean))];
      const areas = areaNames.map(name => ({ id: name, name: name }));

      return { areas, departments, positions };
    } catch (e) {
      console.error('MOSS HRP Error: Failed to fetch form data:', e);
      return { areas: [], departments: [], positions: [] };
    }
  };

  return {
    openPositions: readonly(openPositions),
    loading: readonly(loading),
    error: readonly(error),
    fetchOpenPositions,
    createOpenPosition,
    updateOpenPosition,
    deleteOpenPosition,
    fetchFormData,
  };
}
