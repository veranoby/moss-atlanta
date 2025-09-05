<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <DataTable
          :headers="headers"
          :items="items"
          :loading="loading"
          :total-items="totalItems"
          @update:options="loadItems"
        >
          <template #title>
            <h2>Gestión de Departamentos</h2>
          </template>

          <template #actions>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
              Crear Nuevo Departamento
            </v-btn>
          </template>

          <template #[`item.hotel_name`]="{ item }">
            {{ item.expand?.hotel?.name || 'N/A' }}
          </template>

          <template #[`item.created`]="{ item }">
            {{ new Date(item.created).toLocaleDateString() }}
          </template>

          <template #[`item.actions`]="{ item }">
            <v-icon class="me-2" size="small" @click="openEditModal(item)">
              mdi-pencil
            </v-icon>
            <v-icon size="small" @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
        </DataTable>
      </v-col>
    </v-row>

    <FormModal
      v-model="dialogVisible"
      :title="modalTitle"
      :loading="isSaving"
      @save="saveItem"
    >
      <DepartmentForm ref="departmentForm" v-model="editedItem" />
    </FormModal>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { pb } from '@/composables/usePocketbase';
import DataTable from '@/components/DataTable.vue';
import FormModal from '@/components/FormModal.vue';
import DepartmentForm from '@/components/forms/DepartmentForm.vue';

// Data Table State
const items = ref([]);
const loading = ref(true);
const totalItems = ref(0);
let tableOptions = {};

// Modal and Form State
const dialogVisible = ref(false);
const isSaving = ref(false);
const editedItem = ref({});
const departmentForm = ref(null);
const isEditing = computed(() => !!editedItem.value.id);
const modalTitle = computed(() => isEditing.value ? 'Editar Departamento' : 'Crear Departamento');

const headers = [
  { title: 'Nombre del Departamento', key: 'name', align: 'start' },
  { title: 'Hotel', key: 'hotel_name', sortable: false },
  { title: 'Creado', key: 'created' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
];

async function loadItems(options) {
  loading.value = true;
  tableOptions = options;
  const { page, itemsPerPage, sortBy } = options;
  try {
    const sortOption = sortBy && sortBy.length ? `${sortBy[0].order === 'desc' ? '-' : '+'}${sortBy[0].key}` : '+name';
    const result = await pb.collection('departments').getList(page, itemsPerPage, {
      sort: sortOption,
      expand: 'hotel',
    });
    items.value = result.items;
    totalItems.value = result.totalItems;
  } catch (error) {
    console.error("Failed to load departments:", error);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  editedItem.value = { name: '', hotel: null, notes: '' };
  dialogVisible.value = true;
}

function openEditModal(item) {
  editedItem.value = { ...item };
  dialogVisible.value = true;
}

async function saveItem() {
  if (!departmentForm.value) return;
  const isValid = await departmentForm.value.validate();
  if (!isValid) return;

  isSaving.value = true;
  try {
    const dataToSave = { ...editedItem.value };
    delete dataToSave.expand;

    if (isEditing.value) {
      await pb.collection('departments').update(dataToSave.id, dataToSave);
    } else {
      await pb.collection('departments').create(dataToSave);
    }
    dialogVisible.value = false;
    await loadItems(tableOptions);
  } catch (error) {
    console.error('Failed to save department:', error);
  } finally {
    isSaving.value = false;
  }
}

async function deleteItem(item) {
  if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.name}"?`)) {
    loading.value = true;
    try {
      await pb.collection('departments').delete(item.id);
      await loadItems(tableOptions);
    } catch (error) {
      console.error('Failed to delete department:', error);
    } finally {
      loading.value = false;
    }
  }
}
</script>
