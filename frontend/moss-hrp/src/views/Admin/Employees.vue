<template>
  <v-container fluid>
    <h2 class="text-h4 mb-4">Gestión de Empleados</h2>

    <AdvancedSearch
      :hotels="hotels"
      :positions="positions"
      @update="onFiltersUpdate"
    />

    <BulkActionBar
      :selected-count="selected.length"
      @clear-selection="selected = []"
      class="mb-4"
    >
      <v-btn prepend-icon="mdi-check-circle-outline">Cambiar Estado</v-btn>
      <v-btn prepend-icon="mdi-export">Exportar</v-btn>
    </BulkActionBar>

    <v-card variant="outlined">
      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
      <VirtualScrollTable
        v-if="!loading"
        :items="employees"
        :headers="headers"
        :item-height="55"
        style="height: 65vh;"
      >
        <template #item.name="{ item }">
          <div>
            <strong>{{ item.first_name }} {{ item.last_name }}</strong>
          </div>
          <div>
            <small class="text-grey">{{ item.email }}</small>
          </div>
        </template>
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'active' ? 'success' : 'grey'" size="small">{{ item.status }}</v-chip>
        </template>
        <template #item.hire_date="{ item }">
          {{ item.hire_date ? new Date(item.hire_date).toLocaleDateString() : 'N/A' }}
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditModal(item)"></v-btn>
          <v-btn icon="mdi-delete" variant="text" size="small" @click="deleteEmployee(item)"></v-btn>
        </template>
      </VirtualScrollTable>
    </v-card>

    <FormModal
      v-model="dialogVisible"
      :title="modalTitle"
      :loading="isSaving"
      @save="saveEmployee"
    >
      <EmployeeForm ref="employeeForm" v-model="editedItem" />
    </FormModal>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { pb } from '@/composables/usePocketbase';
import AdvancedSearch from '@/components/AdvancedSearch.vue';
import BulkActionBar from '@/components/BulkActionBar.vue';
import VirtualScrollTable from '@/components/VirtualScrollTable.vue';
import FormModal from '@/components/FormModal.vue';
import EmployeeForm from '@/components/forms/EmployeeForm.vue';

// State
const employees = ref([]);
const hotels = ref([]);
const positions = ref([]);
const selected = ref([]);
const loading = ref(true);
const isSaving = ref(false);
const dialogVisible = ref(false);
const editedItem = ref({});
const employeeForm = ref(null);

const isEditing = computed(() => !!editedItem.value.id);
const modalTitle = computed(() => isEditing.value ? 'Editar Empleado' : 'Crear Empleado');

const headers = [
  { title: 'Nombre', key: 'name', width: '30%' },
  { title: 'Estado', key: 'status', width: '15%' },
  { title: 'Fecha de Contratación', key: 'hire_date', width: '25%' },
  { title: 'Acciones', key: 'actions', width: '15%', align: 'end' },
];

// --- Data Loading ---
async function loadFilterData() {
  try {
    [hotels.value, positions.value] = await Promise.all([
      pb.collection('hotels').getFullList({ sort: 'name' }),
      pb.collection('positions').getFullList({ sort: 'name' }),
    ]);
  } catch (error) {
    console.error("Failed to load filter data:", error);
  }
}

async function loadEmployees(filters = {}) {
  loading.value = true;
  try {
    const filterParts = [];
    if (filters.searchText) {
      const text = filters.searchText.replace(/"/g, '\\"');
      filterParts.push(`(first_name~"${text}" || last_name~"${text}" || email~"${text}" || employee_id~"${text}")`);
    }
    if (filters.status) filterParts.push(`status="${filters.status}"`);

    const pbFilter = filterParts.join(' && ');
    const result = await pb.collection('employees').getFullList(500, { filter: pbFilter, sort: '+last_name,+first_name' });
    employees.value = result;
  } catch (error) {
    console.error("Failed to load employees:", error);
  } finally {
    loading.value = false;
  }
}

function onFiltersUpdate(newFilters) {
  loadEmployees(newFilters);
}

// --- CRUD Logic ---
function openCreateModal() {
  editedItem.value = { status: 'active', w9_completed: false, w4_completed: false, i9_completed: false };
  dialogVisible.value = true;
}

function openEditModal(item) {
  editedItem.value = { ...item };
  dialogVisible.value = true;
}

async function saveEmployee() {
  if (!employeeForm.value) return;
  const isValid = await employeeForm.value.validate();
  if (!isValid) return;

  isSaving.value = true;
  try {
    const dataToSave = { ...editedItem.value };
    if (isEditing.value) {
      await pb.collection('employees').update(dataToSave.id, dataToSave);
    } else {
      await pb.collection('employees').create(dataToSave);
    }
    dialogVisible.value = false;
    await loadEmployees();
  } catch (error) {
    console.error('Failed to save employee:', error);
  } finally {
    isSaving.value = false;
  }
}

async function deleteEmployee(item) {
  if (window.confirm(`Are you sure you want to delete ${item.first_name} ${item.last_name}?`)) {
    loading.value = true;
    try {
      await pb.collection('employees').delete(item.id);
      await loadEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
    } finally {
      loading.value = false;
    }
  }
}

onMounted(() => {
  loadFilterData();
  loadEmployees();
});
</script>
