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
            <h2>Gestión de Hoteles</h2>
          </template>

          <template #actions>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
              Crear Nuevo Hotel
            </v-btn>
          </template>

          <template #[`item.legal_entity_name`]="{ item }">
            {{ item.expand?.legal_entity?.name || 'N/A' }}
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
      <HotelForm ref="hotelForm" v-model="editedItem" />
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
import HotelForm from '@/components/forms/HotelForm.vue';

// Data Table State
const items = ref([]);
const loading = ref(true);
const totalItems = ref(0);
let tableOptions = {};

// Modal and Form State
const dialogVisible = ref(false);
const isSaving = ref(false);
const editedItem = ref({});
const hotelForm = ref(null);
const isEditing = computed(() => !!editedItem.value.id);
const modalTitle = computed(() => isEditing.value ? 'Editar Hotel' : 'Crear Hotel');

const headers = [
  { title: 'Nombre del Hotel', key: 'name', align: 'start' },
  { title: 'Dirección', key: 'address', sortable: false },
  { title: 'Entidad Legal', key: 'legal_entity_name', sortable: false },
  { title: 'Creado', key: 'created' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
];

async function loadItems(options) {
  loading.value = true;
  tableOptions = options;
  const { page, itemsPerPage, sortBy } = options;
  try {
    const sortOption = sortBy && sortBy.length ? `${sortBy[0].order === 'desc' ? '-' : '+'}${sortBy[0].key}` : '+name';
    const result = await pb.collection('hotels').getList(page, itemsPerPage, {
      sort: sortOption,
      expand: 'legal_entity',
    });
    items.value = result.items;
    totalItems.value = result.totalItems;
  } catch (error) {
    console.error("Failed to load hotels:", error);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  editedItem.value = { name: '', address: '', legal_entity: null, notes: '' };
  dialogVisible.value = true;
}

function openEditModal(item) {
  editedItem.value = { ...item };
  dialogVisible.value = true;
}

async function saveItem() {
  if (!hotelForm.value) return;
  const isValid = await hotelForm.value.validate();
  if (!isValid) return;

  isSaving.value = true;
  try {
    const dataToSave = { ...editedItem.value };
    // Ensure expand object is not sent back to PocketBase
    delete dataToSave.expand;

    if (isEditing.value) {
      await pb.collection('hotels').update(dataToSave.id, dataToSave);
    } else {
      await pb.collection('hotels').create(dataToSave);
    }
    dialogVisible.value = false;
    await loadItems(tableOptions);
  } catch (error) {
    console.error('Failed to save hotel:', error);
  } finally {
    isSaving.value = false;
  }
}

async function deleteItem(item) {
  if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.name}"?`)) {
    loading.value = true;
    try {
      await pb.collection('hotels').delete(item.id);
      await loadItems(tableOptions);
    } catch (error) {
      console.error('Failed to delete hotel:', error);
    } finally {
      loading.value = false;
    }
  }
}
</script>
