<template>
  <v-card>
    <v-card-title class="d-flex align-center pa-4">
      <slot name="title"></slot>
      <v-spacer></v-spacer>
      <slot name="actions"></slot>
    </v-card-title>

    <v-divider></v-divider>

    <v-data-table-server
      v-model="internalSelected"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page="options.itemsPerPage"
      :show-select="showSelect"
      @update:options="updateOptions"
      class="elevation-1"
    >
      <!-- Pass through all slots to the underlying data-table -->
      <!-- This allows for custom cell rendering, e.g., for action buttons -->
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  showSelect: {
    type: Boolean,
    default: false,
  },
  // v-model for selected items
  selected: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:options', 'update:selected']);

// Internal state for table options (page, itemsPerPage, sortBy)
const options = ref({});
// Internal state for selected rows to enable v-model binding
const internalSelected = ref(props.selected);

/**
 * Emits the updated options when the table's state changes.
 * @param {object} newOptions - The new options from v-data-table-server.
 */
function updateOptions(newOptions) {
  options.value = newOptions;
  emit('update:options', newOptions);
}

// Watch for changes in the internal selection and emit them to the parent
watch(internalSelected, (newVal) => {
  emit('update:selected', newVal);
});

// Watch for changes from the parent (e.g., clearing selection) and update internal state
watch(() => props.selected, (newVal) => {
  if (JSON.stringify(internalSelected.value) !== JSON.stringify(newVal)) {
    internalSelected.value = newVal;
  }
});
</script>
