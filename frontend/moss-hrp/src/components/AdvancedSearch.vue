<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.searchText"
            label="Buscar por Nombre, Email, ID..."
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="filters.status"
            :items="statuses"
            label="Estado"
            clearable
            hide-details
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.hotel"
            :items="hotels"
            item-title="name"
            item-value="id"
            label="Hotel"
            clearable
            hide-details
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.position"
            :items="positions"
            item-title="name"
            item-value="id"
            label="Puesto"
            clearable
            hide-details
            density="compact"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-spacer></v-spacer>
      <v-btn size="small" @click="clearFilters">Limpiar Filtros</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

// The component accepts lists for dropdowns as props.
const props = defineProps({
  hotels: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] },
  statuses: { type: Array, default: () => ['active', 'inactive', 'on_leave'] },
});

const emit = defineEmits(['update']);

// A single reactive object holds the state of all filters.
const filters = ref({
  searchText: '',
  status: null,
  hotel: null,
  position: null,
});

let debounceTimer = null;

// Watch the entire filters object. When any part changes,
// wait 300ms before emitting the cleaned-up filter data.
watch(filters, (newFilters) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // Create a clean copy without null or empty string values.
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([, value]) => value !== null && value !== '')
    );
    emit('update', cleanFilters);
  }, 300); // 300ms debounce delay
}, { deep: true });

/**
 * Resets all filters to their default state.
 * The watch effect will automatically emit the update.
 */
function clearFilters() {
  filters.value = {
    searchText: '',
    status: null,
    hotel: null,
    position: null,
  };
}
</script>
