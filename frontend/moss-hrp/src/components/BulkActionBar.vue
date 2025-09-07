<template>
  <v-fade-transition>
    <v-toolbar v-if="selectedCount > 0" color="grey-lighten-4" density="compact" class="bulk-action-bar">
      <v-toolbar-title class="text-subtitle-1">
        {{ selectedCount }} {{ selectedCount === 1 ? 'item' : 'items' }} selected
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Slot for custom actions -->
      <slot>
        <!-- Default actions can be defined here if needed, but slot is more flexible -->
      </slot>

      <v-divider vertical class="mx-2"></v-divider>

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn icon v-bind="props" @click="$emit('clear-selection')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <span>Clear selection</span>
      </v-tooltip>
    </v-toolbar>
  </v-fade-transition>
</template>

<script setup>
defineProps({
  /**
   * The number of items currently selected. The bar is only visible if this is > 0.
   */
  selectedCount: {
    type: Number,
    required: true,
  },
});

defineEmits([
  /**
   * Emitted when the user clicks the clear selection button.
   */
  'clear-selection'
]);
</script>

<style scoped>
.bulk-action-bar {
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
</style>
