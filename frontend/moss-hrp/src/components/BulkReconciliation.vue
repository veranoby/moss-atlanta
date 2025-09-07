<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="bg-primary text-white">
      <v-icon start>mdi-checkbox-multiple-marked</v-icon>
      Bulk Reconciliation Actions
    </v-card-title>

    <v-card-text class="py-3">
      <v-row align="center" dense>
        <v-col cols="auto">
          <v-checkbox 
            v-model="selectAll" 
            :indeterminate="someSelected && !allSelected"
            @change="toggleSelectAll"
            hide-details
            density="compact"
          />
        </v-col>
        <v-col cols="auto">
          <span class="text-subtitle-2">
            {{ selectedCount }} of {{ totalItems }} selected
          </span>
        </v-col>
        <v-col cols="auto">
          <v-divider vertical class="mx-2" />
        </v-col>
        <v-col>
          <v-chip-group>
            <v-chip 
              :color="autoApprovalEligible > 0 ? 'success' : 'grey'" 
              size="small"
            >
              <v-icon start size="small">mdi-check-circle</v-icon>
              {{ autoApprovalEligible }} Auto-Eligible (<5% diff)
            </v-chip>
            <v-chip 
              :color="manualReviewRequired > 0 ? 'warning' : 'grey'" 
              size="small"
            >
              <v-icon start size="small">mdi-alert-circle</v-icon>
              {{ manualReviewRequired }} Manual Review (>5% diff)
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>

      <v-row class="mt-3" dense>
        <v-col cols="auto">
          <v-btn
            color="success"
            variant="flat"
            :disabled="autoApprovalEligible === 0"
            @click="bulkAutoApprove"
            :loading="processing"
          >
            <v-icon start>mdi-check-all</v-icon>
            Auto-Approve {{ autoApprovalEligible }} Items
          </v-btn>
        </v-col>
        
        <v-col cols="auto">
          <v-btn
            color="primary"
            variant="tonal"
            :disabled="selectedCount === 0"
            @click="acceptAllMossHours"
            :loading="processing"
          >
            <v-icon start>mdi-clock-check</v-icon>
            Use MOSS Hours for Selected
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn
            color="secondary"
            variant="tonal"
            :disabled="selectedCount === 0"
            @click="acceptAllHotelHours"
            :loading="processing"
          >
            <v-icon start>mdi-domain</v-icon>
            Use Hotel Hours for Selected
          </v-btn>
        </v-col>

        <v-spacer />

        <v-col cols="auto">
          <v-btn
            color="info"
            variant="outlined"
            @click="showBulkJustificationDialog = true"
            :disabled="manualReviewRequired === 0"
          >
            <v-icon start>mdi-text-box-edit</v-icon>
            Bulk Justify ({{ manualReviewRequired }})
          </v-btn>
        </v-col>
      </v-row>

      <!-- Progress indicator -->
      <v-progress-linear
        v-if="processing"
        indeterminate
        color="primary"
        class="mt-3"
      />

      <!-- Summary statistics -->
      <v-row class="mt-3" dense>
        <v-col cols="12">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="text-caption"
          >
            <strong>Bulk Operations Policy:</strong>
            • Items with <5% discrepancy can be auto-approved
            • Items with >5% discrepancy require manual justification
            • All actions are logged in the audit trail
            • Operations can be reversed before final submission
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Bulk Justification Dialog -->
    <v-dialog v-model="showBulkJustificationDialog" max-width="600px">
      <v-card>
        <v-card-title class="bg-warning text-white">
          <v-icon start>mdi-text-box-edit</v-icon>
          Bulk Justification Required
        </v-card-title>
        
        <v-card-text class="py-4">
          <p class="mb-3">
            You have <strong>{{ manualReviewRequired }} items</strong> with >5% discrepancy 
            that require justification for approval.
          </p>
          
          <v-textarea
            v-model="bulkJustification"
            label="Bulk Justification"
            placeholder="Provide a detailed explanation for the discrepancies (e.g., schedule changes, overtime, corrections...)"
            rows="4"
            variant="outlined"
            :rules="bulkJustificationRules"
          />

          <v-alert type="warning" variant="tonal" density="compact" class="mt-3">
            This justification will be applied to all selected items with >5% discrepancy
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn 
            color="grey" 
            variant="text" 
            @click="showBulkJustificationDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="warning" 
            variant="flat"
            :disabled="!isValidBulkJustification"
            @click="applyBulkJustification"
            :loading="processing"
          >
            Apply to {{ manualReviewRequired }} Items
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  selectedItems: { type: Array, required: true },
})

const emit = defineEmits([
  'update:selectedItems',
  'bulk-auto-approve',
  'bulk-accept-moss',
  'bulk-accept-hotel',
  'bulk-justify'
])

// Local state
const selectAll = ref(false)
const processing = ref(false)
const showBulkJustificationDialog = ref(false)
const bulkJustification = ref('')

// Computed properties
const selectedCount = computed(() => props.selectedItems.length)
const totalItems = computed(() => props.items.length)

const allSelected = computed(() => 
  totalItems.value > 0 && selectedCount.value === totalItems.value
)

const someSelected = computed(() => 
  selectedCount.value > 0 && selectedCount.value < totalItems.value
)

const autoApprovalEligible = computed(() => {
  return props.selectedItems.filter(id => {
    const item = props.items.find(i => i.employeeId === id)
    return item && item.discrepancyPercent <= 5
  }).length
})

const manualReviewRequired = computed(() => {
  return props.selectedItems.filter(id => {
    const item = props.items.find(i => i.employeeId === id)
    return item && item.discrepancyPercent > 5
  }).length
})

const isValidBulkJustification = computed(() => {
  return bulkJustification.value.trim().length >= 15
})

// Validation rules
const bulkJustificationRules = [
  v => !!v || 'Justification is required',
  v => (v && v.length >= 15) || 'Please provide a detailed explanation (minimum 15 characters)'
]

// Methods
function toggleSelectAll() {
  if (selectAll.value) {
    emit('update:selectedItems', props.items.map(item => item.employeeId))
  } else {
    emit('update:selectedItems', [])
  }
}

async function bulkAutoApprove() {
  if (autoApprovalEligible.value === 0) return
  
  processing.value = true
  try {
    const eligibleItems = props.selectedItems.filter(id => {
      const item = props.items.find(i => i.employeeId === id)
      return item && item.discrepancyPercent <= 5
    })
    
    await emit('bulk-auto-approve', eligibleItems)
  } finally {
    processing.value = false
  }
}

async function acceptAllMossHours() {
  if (selectedCount.value === 0) return
  
  processing.value = true
  try {
    await emit('bulk-accept-moss', props.selectedItems)
  } finally {
    processing.value = false
  }
}

async function acceptAllHotelHours() {
  if (selectedCount.value === 0) return
  
  processing.value = true
  try {
    await emit('bulk-accept-hotel', props.selectedItems)
  } finally {
    processing.value = false
  }
}

async function applyBulkJustification() {
  if (!isValidBulkJustification.value) return
  
  processing.value = true
  try {
    const itemsRequiringJustification = props.selectedItems.filter(id => {
      const item = props.items.find(i => i.employeeId === id)
      return item && item.discrepancyPercent > 5
    })
    
    await emit('bulk-justify', {
      items: itemsRequiringJustification,
      justification: bulkJustification.value
    })
    
    showBulkJustificationDialog.value = false
    bulkJustification.value = ''
  } finally {
    processing.value = false
  }
}

// Watchers
watch(() => props.selectedItems.length, (newCount) => {
  selectAll.value = newCount === totalItems.value && totalItems.value > 0
})
</script>

<style scoped>
.v-card-title {
  font-weight: 600;
}

.v-alert {
  font-size: 0.875rem;
}
</style>