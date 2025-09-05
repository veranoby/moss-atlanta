<template>
  <v-form ref="form" @submit.prevent>
    <v-text-field
      :model-value="modelValue.key"
      label="Key"
      readonly
      variant="filled"
      class="mb-2"
    ></v-text-field>

    <p class="text-subtitle-2 mb-2">Value</p>
    <v-textarea
      v-model="editableValue"
      :rules="[rules.required, rules.isJson]"
      auto-grow
      rows="5"
      variant="outlined"
      placeholder='Enter a valid JSON value, e.g., "some string", 42, true, or {"foo": "bar"}'
    ></v-textarea>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ key: '', value: null }),
  },
});

const emit = defineEmits(['update:modelValue']);

const form = ref(null);
// The 'value' field of a setting can be any JSON type.
// We stringify it for reliable editing in a textarea.
const editableValue = ref('');

function updateEditableValue(source) {
  try {
    editableValue.value = JSON.stringify(source, null, 2);
  } catch (e) {
    editableValue.value = String(source);
  }
}

// Watch for parent changes and update the local textarea value
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.value !== undefined) {
    updateEditableValue(newValue.value);
  }
}, { deep: true, immediate: true });

// When the user edits the textarea, try to parse it and emit the update.
watch(editableValue, (newVal) => {
  try {
    const parsedValue = JSON.parse(newVal);
    // Avoid emitting an update if the parsed value is the same as the prop's value
    if (JSON.stringify(parsedValue) !== JSON.stringify(props.modelValue.value)) {
      emit('update:modelValue', { ...props.modelValue, value: parsedValue });
    }
  } catch (e) {
    // Invalid JSON. The validation rule will show the error to the user.
    // We don't emit an update for invalid JSON.
  }
});

const rules = {
  required: v => !!v || 'Value is required.',
  isJson: v => {
    try {
      JSON.parse(v);
      return true;
    } catch (e) {
      return `Invalid JSON format: ${e.message}`;
    }
  },
};

async function validate() {
  if (!form.value) return false;
  const result = await form.value.validate();
  return result.valid;
}

defineExpose({
  validate,
});
</script>
