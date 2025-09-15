<template>
  <AdminLayout>
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
            <h2>Entidades Legales</h2>
          </template>

          <template #actions>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
              Crear Nueva
            </v-btn>
          </template>

          <template #[`item.created`]="{ item }">
            {{ new Date(item.created).toLocaleDateString() }}
          </template>

          <template #[`item.updated`]="{ item }">
            {{ new Date(item.updated).toLocaleDateString() }}
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
      <LegalEntityForm ref="legalEntityForm" v-model="editedItem" />
    </FormModal>
    </v-container>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { pb } from '@/composables/usePocketbase';
import AdminLayout from '@/layouts/AdminLayout.vue';
import DataTable from '@/components/DataTable.vue';
import FormModal from '@/components/FormModal.vue';
import LegalEntityForm from '@/components/forms/LegalEntityForm.vue';

// Data Table State
const items = ref([]);
const loading = ref(true);
const totalItems = ref(0);
let tableOptions = {}; // To store current table options for reloading

// Modal and Form State
const dialogVisible = ref(false);
const isSaving = ref(false);
const editedItem = ref({});
const legalEntityForm = ref(null); // Ref to the form component
const isEditing = computed(() => !!editedItem.value.id);
const modalTitle = computed(() => isEditing.value ? 'Editar Entidad Legal' : 'Crear Entidad Legal');

const headers = [
  { title: 'Nombre', key: 'name', align: 'start' },
  { title: 'Tax ID', key: 'tax_id', sortable: false },
  { title: 'Creado', key: 'created' },
  { title: 'Actualizado', key: 'updated' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
];

async function loadItems(options) {
  loading.value = true;
  tableOptions = options; // Save options for reload
  const { page, itemsPerPage, sortBy } = options;
  try {
    const sortOption = sortBy && sortBy.length ? `${sortBy[0].order === 'desc' ? '-' : '+'}${sortBy[0].key}` : '+name';
    const result = await pb.collection('legal_entities').getList(page, itemsPerPage, { sort: sortOption });
    items.value = result.items;
    totalItems.value = result.totalItems;
  } catch (error) {
    console.error("Failed to load legal entities:", error);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  editedItem.value = { name: '', tax_id: '', code: '', notes: '' };
  dialogVisible.value = true;
}

function openEditModal(item) {
  editedItem.value = { ...item };
  dialogVisible.value = true;
}

async function saveItem() {
  if (!legalEntityForm.value) return;

  const isValid = await legalEntityForm.value.validate();
  if (!isValid) return;

  isSaving.value = true;
  try {
    if (isEditing.value) {
      await pb.collection('legal_entities').update(editedItem.value.id, editedItem.value);
    } else {
      await pb.collection('legal_entities').create(editedItem.value);
    }
    dialogVisible.value = false;
    await loadItems(tableOptions); // Reload data
  } catch (error) {
    console.error('Failed to save item:', error);
  } finally {
    isSaving.value = false;
  }
}

async function deleteItem(item) {
  // A simple confirmation dialog. A custom component would be better for UX.
  if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.name}"?`)) {
    loading.value = true;
    try {
      await pb.collection('legal_entities').delete(item.id);
      await loadItems(tableOptions); // Reload data
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      loading.value = false;
    }
  }
}
</script>
