<template>
  <v-form ref="form" @submit.prevent>
    <v-text-field
      v-model="editableItem.name"
      :rules="[rules.required]"
      label="Nombre de la Entidad Legal"
      required
      class="mb-2"
    ></v-text-field>

    <v-text-field
      v-model="editableItem.tax_id"
      :rules="[rules.required]"
      label="Tax ID"
      required
      class="mb-2"
    ></v-text-field>

    <v-text-field
      v-model="editableItem.code"
      label="Código Interno (Opcional)"
      class="mb-2"
    ></v-text-field>

    <v-textarea
      v-model="editableItem.notes"
      label="Notas (Opcional)"
      rows="3"
    ></v-textarea>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  // Use v-model for two-way binding of the item being edited.
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ name: '', tax_id: '', code: '', notes: '' }),
  },
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
// Create a local, editable copy to avoid directly mutating the prop.
const editableItem = ref({ ...props.modelValue });

// When the parent changes the item (e.g., opening modal for a new item),
// update the local copy.
watch(() => props.modelValue, (newValue) => {
  editableItem.value = { ...newValue };
}, { deep: true, immediate: true });

// When the user types in the form, update the parent's state.
watch(editableItem, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

// Basic validation rules.
const rules = {
  required: value => !!value || 'Este campo es requerido.',
};

// Expose the form's `validate` method to the parent component.
// This allows the parent to trigger validation before saving.
async function validate() {
  if (!form.value) return false;
  const result = await form.value.validate();
  return result.valid;
}

defineExpose({
  validate,
});
</script>
