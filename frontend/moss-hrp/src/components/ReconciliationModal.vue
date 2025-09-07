<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar color="primary" dark>
        <v-btn icon dark @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Reconciliation for Period: {{ periodId }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn variant="text" @click="$emit('save')">
            Approve & Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-container fluid class="pa-0 main-content">
        <div v-if="loading" class="d-flex justify-center align-center fill-height">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </div>
        <v-row v-else no-gutters class="fill-height">
          <!-- Column 1: Hotel Report -->
          <v-col cols="12" md="4" class="column-border">
            <div class="column-header"><h3>Hotel Report</h3></div>
            <div class="column-content">
              <v-list density="compact">
                <v-list-item v-for="row in comparisonRows" :key="row.employeeId" :title="row.employeeName" :subtitle="`Hours: ${row.hotelHours}`"></v-list-item>
              </v-list>
            </div>
          </v-col>

          <!-- Column 2: MOSS Time -->
          <v-col cols="12" md="4" class="column-border">
            <div class="column-header"><h3>MOSS Time</h3></div>
            <div class="column-content">
              <v-list density="compact">
                <v-list-item v-for="row in comparisonRows" :key="row.employeeId" :title="row.employeeName" :subtitle="`Hours: ${row.mossHours}`"></v-list-item>
              </v-list>
            </div>
          </v-col>

          <!-- Column 3: Final Hours -->
          <v-col cols="12" md="4">
            <div class="column-header"><h3>Final Hours</h3></div>
            <div class="column-content">
              <v-list density="compact">
                <v-list-item v-for="row in comparisonRows" :key="row.employeeId" :title="row.employeeName" :subtitle="`Hours: ${row.finalHours}`"></v-list-item>
              </v-list>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { watch, computed } from 'vue';
import { useReconciliation } from '@/composables/useReconciliation.js';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  periodId: { type: String, default: null },
});

defineEmits(['update:modelValue', 'save']);

const { loading, activeReconciliation, loadReconciliationData } = useReconciliation();

// This computed property transforms the raw API data into a unified structure for the 3-column view.
const comparisonRows = computed(() => {
  if (!activeReconciliation.value || !activeReconciliation.value.expand?.line_items) {
    return [];
  }
  // This is a placeholder for the real, complex unification logic.
  // It assumes line_items have a structure that can be mapped.
  return activeReconciliation.value.expand.line_items.map(line => ({
    employeeId: line.employee,
    employeeName: line.expand?.employee?.name || 'Unknown Employee',
    hotelHours: line.hotel_hours || 0,
    mossHours: line.moss_hours || 0,
    finalHours: line.final_hours || line.moss_hours || line.hotel_hours || 0,
    discrepancy: (line.moss_hours || 0) - (line.hotel_hours || 0),
  }));
});

// When the modal is opened with a new periodId, fetch its data.
watch(() => props.periodId, (newId) => {
  if (newId && props.modelValue) {
    loadReconciliationData(newId);
  }
}, { immediate: true });

watch(() => props.modelValue, (isVisible) => {
  if (isVisible && props.periodId) {
    loadReconciliationData(props.periodId);
  }
});
</script>

<style scoped>
.main-content {
  height: calc(100vh - 64px);
}
.column-header {
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 2;
}
.column-border {
  border-right: 1px solid #e0e0e0;
}
.column-content {
  height: 100%;
  overflow-y: auto;
}
</style>
