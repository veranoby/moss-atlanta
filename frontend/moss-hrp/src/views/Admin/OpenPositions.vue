<template>
  <AdminLayout>
    <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4">Gestión de Posiciones Abiertas</h2>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus-circle-outline"
        @click="openCreateModal"
        elevation="2"
      >
        Crear Posición
      </v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <v-alert v-if="error" type="error" class="mb-4" :text="error.message"></v-alert>

    <v-row v-if="!loading && openPositions.length > 0">
      <v-col
        v-for="position in openPositions"
        :key="position.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="d-flex flex-column" height="100%" variant="outlined">
          <v-card-item>
            <v-card-title class="text-wrap">{{ position.position_name }}</v-card-title>
            <v-card-subtitle>{{ position.area }}</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <div><strong>Departamento:</strong> {{ position.department_name }}</div>
            <div><strong>Salario:</strong> ${{ position.salary_min }} - ${{ position.salary_max }}</div>
            <div><strong>Tipo:</strong> {{ position.posting_type === 'formal_corporate' ? 'Formal' : 'Informal' }}</div>
          </v-card-text>

          <v-spacer></v-spacer>

          <v-card-actions class="d-flex justify-space-between align-center">
             <v-chip :color="getStatusColor(position.status)" size="small" label>{{ position.status }}</v-chip>
            <div>
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditModal(position)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" @click="confirmDelete(position)"></v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="!loading && openPositions.length === 0" type="info" class="mt-4">
      No hay posiciones abiertas para mostrar. ¡Cree una nueva para comenzar!
    </v-alert>

    <FormModal
      v-model="dialogVisible"
      :title="modalTitle"
      :loading="isSaving"
      @save="savePosition"
    >
      <OpenPositionForm
        ref="positionForm"
        v-model="editedItem"
        :areas="formData.areas"
        :departments="formData.departments"
        :positions="formData.positions"
      />
    </FormModal>

    </v-container>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useOpenPositions } from '@/composables/useOpenPositions';
import AdminLayout from '@/layouts/AdminLayout.vue';
import FormModal from '@/components/FormModal.vue';
import OpenPositionForm from '@/components/forms/OpenPositionForm.vue';

// --- Composables and State ---
const {
  openPositions,
  loading,
  error,
  fetchOpenPositions,
  createOpenPosition,
  updateOpenPosition,
  deleteOpenPosition,
  fetchFormData,
} = useOpenPositions();

const dialogVisible = ref(false);
const isSaving = ref(false);
const editedItem = ref({});
const positionForm = ref(null); // Ref for the form component
const formData = ref({
  areas: [],
  departments: [],
  positions: [],
});

// --- Computed Properties ---
const isEditing = computed(() => !!editedItem.value.id);
const modalTitle = computed(() => isEditing.value ? 'Editar Posición Abierta' : 'Crear Nueva Posición');

// --- Methods ---
const loadInitialData = async () => {
  await fetchOpenPositions();
  formData.value = await fetchFormData();
};

const getStatusColor = (status) => {
  const colors = {
    open: 'success',
    filled: 'warning',
    closed: 'grey',
    on_hold: 'info',
  };
  return colors[status] || 'default';
};

const openCreateModal = () => {
  editedItem.value = {
    status: 'open',
    posting_type: 'informal_optimized',
    salary_min: 0,
    salary_max: 0,
    requirements: '',
  };
  dialogVisible.value = true;
};

const openEditModal = (item) => {
  editedItem.value = { ...item };
  dialogVisible.value = true;
};

const savePosition = async () => {
  if (!positionForm.value) return;
  const isValid = await positionForm.value.validate();
  if (!isValid) return;

  isSaving.value = true;
  try {
    const dataToSave = { ...editedItem.value };
    // Pocketbase expects null for empty relations, not empty strings
    if (!dataToSave.department) dataToSave.department = null;
    if (!dataToSave.position) dataToSave.position = null;

    if (isEditing.value) {
      await updateOpenPosition(dataToSave.id, dataToSave);
    } else {
      await createOpenPosition(dataToSave);
    }
    dialogVisible.value = false;
  } catch (err) {
    console.error('Failed to save position:', err);
    // Optionally, show an error message to the user
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (item) => {
  if (window.confirm(`¿Está seguro de que desea eliminar la posición "${item.position_name}" en ${item.area}?`)) {
    try {
      await deleteOpenPosition(item.id);
    } catch (err) {
      console.error('Failed to delete position:', err);
      // Optionally, show an error message
    }
  }
};

// --- Lifecycle Hooks ---
onMounted(loadInitialData);

</script>
