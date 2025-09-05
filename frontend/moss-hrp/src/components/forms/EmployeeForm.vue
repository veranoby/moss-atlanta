<template>
  <v-form ref="form" @submit.prevent>
    <v-tabs v-model="tab" bg-color="primary" grow>
      <v-tab value="personal">Información Personal</v-tab>
      <v-tab value="employment">Detalles de Empleo</v-tab>
      <v-tab value="documents">Documentos</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="py-4">
      <!-- Personal Info Tab -->
      <v-window-item value="personal">
        <v-container fluid>
          <v-row>
            <v-col cols="12" sm="6"><v-text-field v-model="editableItem.first_name" :rules="[rules.required]" label="Nombres"></v-text-field></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="editableItem.last_name" :rules="[rules.required]" label="Apellidos"></v-text-field></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="editableItem.email" :rules="[rules.required, rules.email]" label="Email"></v-text-field></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="editableItem.phone" label="Teléfono"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="editableItem.address" label="Dirección"></v-text-field></v-col>
          </v-row>
        </v-container>
      </v-window-item>

      <!-- Employment Details Tab -->
      <v-window-item value="employment">
        <v-container fluid>
          <v-row>
            <v-col cols="12" sm="6"><v-text-field v-model="editableItem.employee_id" label="ID de Empleado"></v-text-field></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="editableItem.hire_date" label="Fecha de Contratación" type="date"></v-text-field></v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="editableItem.status" :items="['active', 'inactive', 'on_leave']" label="Estado"></v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-window-item>

      <!-- Documents Tab -->
      <v-window-item value="documents">
        <v-container fluid>
          <v-row>
            <v-col cols="12" sm="6"><v-checkbox v-model="editableItem.w9_completed" label="W-9 Completado"></v-checkbox></v-col>
            <v-col cols="12" sm="6"><v-checkbox v-model="editableItem.w4_completed" label="W-4 Completado"></v-checkbox></v-col>
            <v-col cols="12" sm="6"><v-checkbox v-model="editableItem.i9_completed" label="I-9 Completado"></v-checkbox></v-col>
          </v-row>
        </v-container>
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
const tab = ref('personal');
const editableItem = ref({ ...props.modelValue });

// Sync with parent v-model
watch(() => props.modelValue, (newValue) => {
  editableItem.value = { ...newValue };
}, { deep: true, immediate: true });

watch(editableItem, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

// Validation Rules
const rules = {
  required: v => !!v || 'Este campo es requerido.',
  email: v => /.+@.+\..+/.test(v) || 'Debe ser un email válido.',
};

// Expose validate method
async function validate() {
  if (!form.value) return false;
  const result = await form.value.validate();
  return result.valid;
}
defineExpose({ validate });
</script>
