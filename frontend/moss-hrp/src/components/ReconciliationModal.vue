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
        <!-- Bulk Actions Bar -->
        <v-card v-if="comparisonRows.length > 0" flat class="mb-2">
          <v-card-text class="py-2">
            <v-row align="center">
              <v-col cols="auto">
                <v-checkbox 
                  v-model="selectAll" 
                  :indeterminate="someSelected && !allSelected"
                  @change="toggleSelectAll"
                  hide-details
                  density="compact"
                />
                <span class="ml-2">Select All</span>
              </v-col>
              <v-col cols="auto" v-if="selectedRows.length > 0">
                <v-btn 
                  color="success" 
                  variant="tonal" 
                  size="small"
                  :disabled="!canBulkApprove"
                  @click="bulkApprove"
                >
                  Bulk Approve {{ eligibleForBulkApproval }} items (<5% diff)
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-row v-else no-gutters class="fill-height">
          <!-- Column 1: Hotel Report -->
          <v-col cols="12" md="4" class="column-border">
            <div class="column-header hotel-header">
              <h3>Hotel Report</h3>
              <v-chip size="small" color="primary">Source: AI Extracted</v-chip>
            </div>
            <v-virtual-scroll
              :items="comparisonRows"
              :item-height="80"
              height="calc(100vh - 200px)"
              class="column-content"
            >
              <template v-slot:default="{ item: row }">
                <v-card :class="getRowClass(row)" class="ma-1 pa-2">
                  <v-row align="center" no-gutters>
                    <v-col cols="auto">
                      <v-checkbox
                        v-model="selectedRows"
                        :value="row.employeeId"
                        hide-details
                        density="compact"
                      />
                    </v-col>
                    <v-col>
                      <div class="employee-info">
                        <div class="font-weight-medium">{{ row.employeeName }}</div>
                        <div class="text-caption text-medium-emphasis">{{ row.hotelHours }}h</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </template>
            </v-virtual-scroll>
          </v-col>

          <!-- Column 2: MOSS Time -->
          <v-col cols="12" md="4" class="column-border">
            <div class="column-header moss-header">
              <h3>MOSS Time</h3>
              <v-chip size="small" color="secondary">Source: Mobile App</v-chip>
            </div>
            <v-virtual-scroll
              :items="comparisonRows"
              :item-height="80"
              height="calc(100vh - 200px)"
              class="column-content"
            >
              <template v-slot:default="{ item: row }">
                <v-card :class="getRowClass(row)" class="ma-1 pa-2">
                  <div class="employee-info">
                    <div class="font-weight-medium">{{ row.employeeName }}</div>
                    <div class="text-caption text-medium-emphasis">{{ row.mossHours }}h</div>
                    <v-chip
                      v-if="row.discrepancy !== 0"
                      :color="getDiscrepancyColor(row.discrepancyPercent)"
                      size="x-small"
                      class="mt-1"
                    >
                      {{ row.discrepancyPercent.toFixed(1) }}% diff
                    </v-chip>
                  </div>
                </v-card>
              </template>
            </v-virtual-scroll>
          </v-col>

          <!-- Column 3: Final Hours -->
          <v-col cols="12" md="4">
            <div class="column-header final-header">
              <h3>Final Hours</h3>
              <v-chip size="small" color="success">Reconciled</v-chip>
            </div>
            <v-virtual-scroll
              :items="comparisonRows"
              :item-height="80"
              height="calc(100vh - 200px)"
              class="column-content"
            >
              <template v-slot:default="{ item: row }">
                <v-card :class="getRowClass(row)" class="ma-1 pa-2">
                  <div class="employee-info">
                    <div class="font-weight-medium">{{ row.employeeName }}</div>
                    <div class="text-caption text-medium-emphasis">
                      <v-text-field
                        v-model.number="row.finalHours"
                        type="number"
                        step="0.5"
                        min="0"
                        density="compact"
                        hide-details
                        suffix="h"
                        class="final-hours-input"
                      />
                    </div>
                    <v-textarea
                      v-if="row.discrepancyPercent > 5"
                      v-model="row.justification"
                      placeholder="Justification required for >5% changes"
                      rows="2"
                      density="compact"
                      hide-details
                      class="mt-2"
                      :rules="[(v) => !!v || 'Justification required for >5% changes']"
                    />
                  </div>
                </v-card>
              </template>
            </v-virtual-scroll>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { watch, computed, ref } from 'vue';
import { useReconciliation } from '@/composables/useReconciliation.js';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  periodId: { type: String, default: null },
});

defineEmits(['update:modelValue', 'save']);

const { loading, activeReconciliation, loadReconciliationData } = useReconciliation();

// Selection state for bulk operations
const selectedRows = ref([]);
const selectAll = ref(false);

// Enhanced comparison data with discrepancy calculations
const comparisonRows = computed(() => {
  if (!activeReconciliation.value || !activeReconciliation.value.expand?.line_items) {
    return [];
  }
  
  return activeReconciliation.value.expand.line_items.map(line => {
    const hotelHours = line.hotel_hours || 0;
    const mossHours = line.moss_hours || 0;
    const discrepancy = mossHours - hotelHours;
    const discrepancyPercent = hotelHours > 0 ? Math.abs(discrepancy / hotelHours) * 100 : 0;
    
    return {
      employeeId: line.employee,
      employeeName: line.expand?.employee?.name || 'Unknown Employee',
      hotelHours,
      mossHours,
      finalHours: line.final_hours || mossHours,
      discrepancy,
      discrepancyPercent,
      justification: line.justification || '',
      isApproved: line.is_approved || false,
    };
  });
});

// Bulk operation computed properties
const allSelected = computed(() => 
  comparisonRows.value.length > 0 && selectedRows.value.length === comparisonRows.value.length
);

const someSelected = computed(() => 
  selectedRows.value.length > 0 && selectedRows.value.length < comparisonRows.value.length
);

const eligibleForBulkApproval = computed(() => {
  return selectedRows.value.filter(employeeId => {
    const row = comparisonRows.value.find(r => r.employeeId === employeeId);
    return row && row.discrepancyPercent <= 5;
  }).length;
});

const canBulkApprove = computed(() => eligibleForBulkApproval.value > 0);

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

// Helper functions for UI styling and logic
function getRowClass(row) {
  if (row.discrepancyPercent > 5) return 'high-discrepancy';
  if (row.discrepancyPercent > 0) return 'low-discrepancy';
  return 'no-discrepancy';
}

function getDiscrepancyColor(percent) {
  if (percent > 5) return 'error';
  if (percent > 0) return 'warning';
  return 'success';
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedRows.value = comparisonRows.value.map(row => row.employeeId);
  } else {
    selectedRows.value = [];
  }
}

function bulkApprove() {
  selectedRows.value.forEach(employeeId => {
    const row = comparisonRows.value.find(r => r.employeeId === employeeId);
    if (row && row.discrepancyPercent <= 5) {
      row.isApproved = true;
      row.finalHours = row.mossHours; // Auto-approve MOSS hours for <5%
    }
  });
  selectedRows.value = [];
  selectAll.value = false;
}
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

.hotel-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.moss-header {
  background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
  color: white;
}

.final-header {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  color: white;
}

.employee-row {
  transition: all 0.2s ease;
}

.high-discrepancy {
  border-left: 4px solid #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.low-discrepancy {
  border-left: 4px solid #ff9800;
  background-color: rgba(255, 152, 0, 0.05);
}

.no-discrepancy {
  border-left: 4px solid #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.final-hours-input .v-input__control {
  min-height: 32px !important;
}

.employee-info {
  width: 100%;
}
</style>
