<template>
  <v-form ref="form" @submit.prevent>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="editablePosition.area"
            :items="areas"
            item-title="name"
            item-value="id"
            label="Área de la Posición"
            :rules="[rules.required]"
            required
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="editablePosition.department"
            :items="departments"
            item-title="name"
            item-value="id"
            label="Departamento"
            :rules="[rules.required]"
            required
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="editablePosition.position"
            :items="positions"
            item-title="name"
            item-value="id"
            label="Posición"
            :rules="[rules.required]"
            required
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="editablePosition.salary_min"
            label="Salario Mínimo"
            type="number"
            prefix="$"
            :rules="[rules.required, rules.positiveNumber]"
            variant="outlined"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="editablePosition.salary_max"
            label="Salario Máximo"
            type="number"
            prefix="$"
            :rules="[rules.required, rules.positiveNumber, rules.salaryMax]"
            variant="outlined"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="editablePosition.requirements"
            label="Requisitos y Calificaciones"
            placeholder="Listar cada requisito en una nueva línea..."
            rows="4"
            variant="outlined"
            density="compact"
          ></v-textarea>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="editablePosition.status"
            :items="statusOptions"
            label="Estado"
            :rules="[rules.required]"
            required
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
           <v-select
            v-model="editablePosition.posting_type"
            :items="postingTypeOptions"
            label="Tipo de Publicación"
            :rules="[rules.required]"
            required
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  areas: {
    type: Array,
    default: () => []
  },
  departments: {
    type: Array,
    default: () => []
  },
  positions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);

// Use a local ref to avoid directly mutating the prop, which is an anti-pattern in Vue.
const editablePosition = ref({});

// When the modelValue prop changes (e.g., when opening the dialog for a new or different item),
// update the local ref to reflect the new state.
watch(() => props.modelValue, (newValue) => {
  editablePosition.value = { ...newValue };
}, { immediate: true, deep: true });

// When the local editablePosition changes (e.g., user types in a field),
// emit an 'update:modelValue' event. This makes v-model work on the parent component.
watch(editablePosition, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });


const statusOptions = ['open', 'filled', 'closed', 'on_hold'];
const postingTypeOptions = [
    { title: 'Informal (Optimizado para WhatsApp)', value: 'informal_optimized'},
    { title: 'Formal (Corporativo)', value: 'formal_corporate'}
];

const rules = {
  required: value => !!value || 'Este campo es requerido.',
  positiveNumber: value => value > 0 || 'Debe ser un número positivo.',
  salaryMax: value => {
    const min = parseFloat(editablePosition.value.salary_min);
    const max = parseFloat(value);
    if (isNaN(min) || isNaN(max)) return true; // Don't validate if one of the inputs isn't a number yet
    return max > min || 'El salario máximo debe ser mayor que el mínimo.';
  }
};

// The 'validate' function is exposed to the parent component.
// This allows the parent (e.g., a modal) to trigger form validation before proceeding with an action like saving.
const validate = async () => {
  if (!form.value) return false;
  const { valid } = await form.value.validate();
  return valid;
};

defineExpose({
  validate
});
</script>
