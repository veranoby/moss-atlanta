<template>
  <v-form ref="form" @submit.prevent>
    <v-text-field
      v-model="editableItem.name"
      :rules="[rules.required]"
      label="Nombre del Departamento"
      required
      class="mb-2"
    ></v-text-field>

    <v-select
      v-model="editableItem.hotel"
      :items="hotels"
      item-title="name"
      item-value="id"
      :rules="[rules.required]"
      label="Hotel"
      :loading="loadingHotels"
      required
      class="mb-2"
    ></v-select>

    <v-textarea
      v-model="editableItem.notes"
      label="Notas (Opcional)"
      rows="3"
    ></v-textarea>
  </v-form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { pb } from '@/composables/usePocketbase';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ name: '', hotel: null, notes: '' }),
  },
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
const editableItem = ref({ ...props.modelValue });
const hotels = ref([]);
const loadingHotels = ref(false);

/**
 * Fetches the list of hotels to populate the dropdown.
 */
async function fetchHotels() {
  loadingHotels.value = true;
  try {
    const records = await pb.collection('hotels').getFullList({ sort: 'name' });
    hotels.value = records;
  } catch (error) {
    console.error("Failed to fetch hotels:", error);
  } finally {
    loadingHotels.value = false;
  }
}

onMounted(fetchHotels);

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
