<template>
  <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4">Configuración de la Aplicación</h2>
    </div>

    <v-row v-if="loading">
      <v-col class="text-center">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="(group, category) in groupedSettings" :key="category" cols="12" md="6">
        <v-card>
          <v-card-title class="text-capitalize">{{ category.replace(/_/g, ' ') }}</v-card-title>
          <v-divider></v-divider>
          <v-list lines="three" density="compact">
            <div v-for="(setting, index) in group" :key="setting.id">
              <v-list-item :title="setting.key">
                <v-list-item-subtitle class="wrap-text">{{ setting.description }}</v-list-item-subtitle>

                <template #append>
                  <v-btn density="comfortable" icon="mdi-pencil" variant="text" @click="openEditModal(setting)"></v-btn>
                </template>
              </v-list-item>
              <v-divider v-if="index < group.length - 1"></v-divider>
            </div>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <FormModal
      v-if="editedItem"
      v-model="dialogVisible"
      :title="`Edit Setting: ${editedItem.key}`"
      :loading="isSaving"
      @save="saveItem"
    >
      <SettingForm ref="settingForm" v-model="editedItem" />
    </FormModal>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { pb } from '@/composables/usePocketbase';
import FormModal from '@/components/FormModal.vue';
import SettingForm from '@/components/forms/SettingForm.vue';

const settings = ref([]);
const loading = ref(true);

const dialogVisible = ref(false);
const isSaving = ref(false);
const editedItem = ref(null);
const settingForm = ref(null);

const groupedSettings = computed(() => {
  return settings.value.reduce((acc, setting) => {
    const category = setting.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {});
});

async function loadSettings() {
  loading.value = true;
  try {
    const records = await pb.collection('app_settings').getFullList({ sort: '+key' });
    settings.value = records;
  } catch (error) {
    console.error("Failed to load settings:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadSettings);

function openEditModal(setting) {
  editedItem.value = { ...setting };
  dialogVisible.value = true;
}

async function saveItem() {
  if (!settingForm.value) return;
  const isValid = await settingForm.value.validate();
  if (!isValid) return;

  isSaving.value = true;
  try {
    // Only the 'value' field should be updated.
    const dataToUpdate = { value: editedItem.value.value };
    await pb.collection('app_settings').update(editedItem.value.id, dataToUpdate);
    dialogVisible.value = false;
    await loadSettings(); // Reload settings to show the new value
  } catch (error) {
    console.error('Failed to save setting:', error);
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.wrap-text {
  white-space: normal;
  word-break: break-word;
}
</style>
