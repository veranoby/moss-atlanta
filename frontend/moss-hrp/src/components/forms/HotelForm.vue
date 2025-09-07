<template>
  <v-form ref="form" @submit.prevent>
    <v-text-field
      v-model="editableItem.name"
      :rules="[rules.required]"
      label="Nombre del Hotel"
      required
      class="mb-2"
    ></v-text-field>

    <v-text-field
      v-model="editableItem.address"
      label="Dirección (Opcional)"
      class="mb-2"
    ></v-text-field>

    <v-select
      v-model="editableItem.legal_entity"
      :items="legalEntities"
      item-title="name"
      item-value="id"
      :rules="[rules.required]"
      label="Entidad Legal"
      :loading="loadingEntities"
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
    default: () => ({ name: '', address: '', legal_entity: null, notes: '' }),
  },
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
const editableItem = ref({ ...props.modelValue });
const legalEntities = ref([]);
const loadingEntities = ref(false);

/**
 * Fetches the list of legal entities to populate the dropdown.
 */
async function fetchLegalEntities() {
  loadingEntities.value = true;
  try {
    // getFullList is suitable here as the number of legal entities is expected to be manageable.
    const records = await pb.collection('legal_entities').getFullList({ sort: 'name' });
    legalEntities.value = records;
  } catch (error) {
    console.error("Failed to fetch legal entities:", error);
    // Optionally, show an error to the user
  } finally {
    loadingEntities.value = false;
  }
}

onMounted(fetchLegalEntities);

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
