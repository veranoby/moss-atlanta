<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="closeDialog"
    persistent
    max-width="600px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <!-- The parent component injects the form fields here -->
          <slot></slot>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
          Cancel
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          :loading="loading"
          @click="saveForm"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  // Used with v-model to control the dialog's visibility from the parent.
  modelValue: {
    type: Boolean,
    required: true,
  },
  // The title displayed in the modal's header.
  title: {
    type: String,
    required: true,
  },
  // Shows a loading spinner on the "Save" button, controlled by the parent.
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue', // Required for v-model
  'save',              // Emitted when the save button is clicked
  'close',             // Emitted when the dialog is closed
]);

/**
 * Closes the dialog and emits events to the parent.
 */
function closeDialog() {
  emit('update:modelValue', false);
  emit('close');
}

/**
 * Emits the 'save' event to notify the parent to handle form submission.
 */
function saveForm() {
  emit('save');
}
</script>
