<template>
  <v-form ref="form" @submit.prevent>
    <v-text-field
      v-model="editableItem.name"
      :rules="[rules.required]"
      label="Nombre del Puesto"
      required
      class="mb-2"
    ></v-text-field>

    <v-textarea
      v-model="editableItem.description"
      label="Descripción (Opcional)"
      rows="3"
    ></v-textarea>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ name: '', description: '' }),
  },
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
const editableItem = ref({ ...props.modelValue });

// Sync local state with parent's v-model
watch(() => props.modelValue, (newValue) => {
  editableItem.value = { ...newValue };
}, { deep: true, immediate: true });

watch(editableItem, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

const rules = {
  required: value => !!value || 'Este campo es requerido.',
};

// Expose the form's `validate` method
async function validate() {
  if (!form.value) return false;
  const result = await form.value.validate();
  return result.valid;
}

defineExpose({
  validate,
});
</script>
