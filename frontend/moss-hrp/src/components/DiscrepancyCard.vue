<template>
  <v-card :class="discrepancyClass" class="mb-2" elevation="2">
    <v-card-title class="py-2">
      <v-row align="center" no-gutters>
        <v-col>
          <span class="text-subtitle-1 font-weight-bold">{{ employee.name }}</span>
        </v-col>
        <v-col cols="auto">
          <v-chip 
            :color="discrepancyColor" 
            size="small"
            class="font-weight-bold"
          >
            {{ discrepancyPercent.toFixed(1) }}% diff
          </v-chip>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text class="py-2">
      <v-row dense>
        <v-col cols="4">
          <div class="text-center">
            <div class="text-caption text-medium-emphasis">Hotel Hours</div>
            <div class="text-h6 hotel-hours">{{ hotelHours }}h</div>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="text-center">
            <div class="text-caption text-medium-emphasis">MOSS Hours</div>
            <div class="text-h6 moss-hours">{{ mossHours }}h</div>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="text-center">
            <div class="text-caption text-medium-emphasis">Final Hours</div>
            <v-text-field
              v-model.number="finalHours"
              type="number"
              step="0.5"
              min="0"
              density="compact"
              hide-details
              suffix="h"
              class="final-hours-input text-center"
              @input="$emit('update:finalHours', finalHours)"
            />
          </div>
        </v-col>
      </v-row>

      <!-- Justification for >5% changes -->
      <v-row v-if="discrepancyPercent > 5" class="mt-2">
        <v-col cols="12">
          <v-textarea
            v-model="justification"
            label="Justification Required (>5% change)"
            placeholder="Please explain the reason for this discrepancy..."
            rows="2"
            density="compact"
            variant="outlined"
            :rules="justificationRules"
            @input="$emit('update:justification', justification)"
          />
        </v-col>
      </v-row>

      <!-- Action buttons -->
      <v-row class="mt-2" dense>
        <v-col cols="auto">
          <v-btn
            color="success"
            size="small"
            variant="tonal"
            :disabled="!canApprove"
            @click="approve"
          >
            <v-icon start>mdi-check</v-icon>
            Approve
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
            color="primary"
            size="small"
            variant="tonal"
            @click="useMossHours"
          >
            Use MOSS Hours
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
            color="secondary"
            size="small"
            variant="tonal"
            @click="useHotelHours"
          >
            Use Hotel Hours
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  employee: { type: Object, required: true },
  hotelHours: { type: Number, required: true },
  mossHours: { type: Number, required: true },
  initialFinalHours: { type: Number, required: true },
  initialJustification: { type: String, default: '' },
})

const emit = defineEmits(['update:finalHours', 'update:justification', 'approve'])

const finalHours = ref(props.initialFinalHours)
const justification = ref(props.initialJustification)

// Computed properties
const discrepancyPercent = computed(() => {
  if (props.hotelHours === 0) return 0
  return Math.abs((props.mossHours - props.hotelHours) / props.hotelHours) * 100
})

const discrepancyColor = computed(() => {
  if (discrepancyPercent.value > 5) return 'error'
  if (discrepancyPercent.value > 0) return 'warning'
  return 'success'
})

const discrepancyClass = computed(() => {
  if (discrepancyPercent.value > 5) return 'high-discrepancy'
  if (discrepancyPercent.value > 0) return 'low-discrepancy'
  return 'no-discrepancy'
})

const canApprove = computed(() => {
  if (discrepancyPercent.value <= 5) return true
  return justification.value.trim().length >= 10 // Require meaningful justification
})

// Validation rules
const justificationRules = [
  v => !!v || 'Justification is required for changes >5%',
  v => (v && v.length >= 10) || 'Please provide a detailed explanation (minimum 10 characters)'
]

// Methods
function approve() {
  if (canApprove.value) {
    emit('approve', {
      employeeId: props.employee.id,
      finalHours: finalHours.value,
      justification: justification.value,
      discrepancyPercent: discrepancyPercent.value
    })
  }
}

function useMossHours() {
  finalHours.value = props.mossHours
  emit('update:finalHours', finalHours.value)
}

function useHotelHours() {
  finalHours.value = props.hotelHours
  emit('update:finalHours', finalHours.value)
}

// Watch for prop changes
watch(() => props.initialFinalHours, (newVal) => {
  finalHours.value = newVal
})

watch(() => props.initialJustification, (newVal) => {
  justification.value = newVal
})
</script>

<style scoped>
.high-discrepancy {
  border-left: 6px solid #f44336;
  background-color: rgba(244, 67, 54, 0.03);
}

.low-discrepancy {
  border-left: 6px solid #ff9800;
  background-color: rgba(255, 152, 0, 0.03);
}

.no-discrepancy {
  border-left: 6px solid #4caf50;
  background-color: rgba(76, 175, 80, 0.03);
}

.hotel-hours {
  color: #1976d2;
  font-weight: 600;
}

.moss-hours {
  color: #7b1fa2;
  font-weight: 600;
}

.final-hours-input :deep(.v-input__control) {
  min-height: 40px;
}

.final-hours-input :deep(.v-field__input) {
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}
</style>