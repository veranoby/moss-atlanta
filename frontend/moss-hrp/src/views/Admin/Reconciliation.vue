<template>
  <AdminLayout>
    <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4">Dashboard de Reconciliación</h2>
    </div>

    <v-card variant="outlined" class="mb-4">
      <v-card-title>Filtros</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.hotel"
              :items="hotels"
              item-title="name"
              item-value="id"
              label="Filtrar por Hotel"
              clearable
              hide-details
              density="compact"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <PayrollPeriodsList
      :filters="filters"
      @open="handleOpenReconciliation"
    />

    <ReconciliationModal
      v-model="isModalOpen"
      :period-id="selectedPeriodId"
      @save="handleSaveReconciliation"
    />
    </v-container>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { pb } from '@/composables/usePocketbase';
import { useSSE } from '@/composables/useSSE';
import AdminLayout from '@/layouts/AdminLayout.vue';
import PayrollPeriodsList from '@/components/PayrollPeriodsList.vue';
import ReconciliationModal from '@/components/ReconciliationModal.vue';

const filters = ref({ hotel: null });
const hotels = ref([]);
const isModalOpen = ref(false);
const selectedPeriodId = ref(null);

// SSE connection for real-time updates
const sseUrl = 'http://localhost:8080/api/sse/reconciliation'
const { status: sseStatus, connect: connectSSE, close: closeSSE, addEventListener } = useSSE(sseUrl)

async function loadHotelsForFilter() {
  try {
    hotels.value = await pb.collection('hotels').getFullList({ sort: 'name' });
  } catch (error) {
    console.error("Failed to load hotels for filter:", error);
  }
}

/**
 * Opens the reconciliation modal with the data for the selected period.
 * @param {string} periodId - The ID of the payroll period to open.
 */
function handleOpenReconciliation(periodId) {
  selectedPeriodId.value = periodId;
  isModalOpen.value = true;
}

/**
 * Handles the save event from the modal.
 */
function handleSaveReconciliation() {
  console.log("Placeholder: Save action triggered from modal.");
  // This would typically involve calling the save method from the useReconciliation composable
  // and then refreshing the list.
  isModalOpen.value = false;
}

onMounted(async () => {
  await loadHotelsForFilter()
  
  // Set up SSE listeners for real-time updates
  addEventListener('hotel_report_processed', (data) => {
    console.log('Hotel report processed:', data)
    // Trigger refresh of payroll periods list
    // The PayrollPeriodsList component should handle this automatically
  })
  
  addEventListener('reconciliation_status_changed', (data) => {
    console.log('Reconciliation status changed:', data)
    // Update UI to reflect status changes
  })
  
  // Connect to SSE
  connectSSE()
})

onUnmounted(() => {
  closeSSE()
})
</script>
