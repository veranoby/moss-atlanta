<template>
  <AdminLayout>
    <v-container fluid class="pa-0">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 mb-2">{{ $t('admin.employees.title') }}</h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('admin.employees.subtitle') }}</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="openCreateModal"
      >
        {{ $t('admin.employees.createEmployee') }}
      </v-btn>
    </div>

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
      <v-btn prepend-icon="mdi-check-circle-outline">{{ $t('admin.employees.changeStatus') }}</v-btn>
      <v-btn prepend-icon="mdi-export">{{ $t('admin.employees.export') }}</v-btn>
    </BulkActionBar>

    <v-card variant="outlined">
      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

      <!-- Using v-data-table with pagination for better compatibility -->
      <v-data-table
        v-if="!loading && employees.length > 0"
        :items="employees"
        :headers="headers"
        class="elevation-0"
        :items-per-page="50"
        :items-per-page-options="[25, 50, 100, -1]"
        show-current-page
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
      </v-data-table>

      <!-- Fallback if no employees -->
      <div v-if="!loading && employees.length === 0" class="pa-4 text-center">
        <v-icon size="48" class="mb-2">mdi-account-off</v-icon>
        <div class="text-h6">{{ $t('admin.employees.noEmployeesFound') }}</div>
        <div class="text-body-2 text-medium-emphasis">{{ $t('admin.employees.noEmployeesDescription') }}</div>
      </div>
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
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { pb } from '@/composables/usePocketbase'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdvancedSearch from '@/components/AdvancedSearch.vue';
import BulkActionBar from '@/components/BulkActionBar.vue';
import VirtualScrollTable from '@/components/VirtualScrollTable.vue';
import FormModal from '@/components/FormModal.vue';
import EmployeeForm from '@/components/forms/EmployeeForm.vue';

const { t } = useI18n()

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
const modalTitle = computed(() => isEditing.value ? t('admin.employees.editEmployee') : t('admin.employees.createEmployee'));

const headers = [
  { title: t('admin.employees.name'), key: 'name', width: '30%' },
  { title: t('admin.employees.status'), key: 'status', width: '15%' },
  { title: t('admin.employees.hireDate'), key: 'hire_date', width: '25%' },
  { title: t('admin.employees.actions'), key: 'actions', width: '15%', align: 'end' },
];

// --- Data Loading ---
async function loadFilterData() {
  try {
    // Only load hotels for now - positions collection may not exist yet
    hotels.value = await pb.collection('hotels').getFullList({ sort: 'name' });

    // Temporary: Set empty positions array until collection is created
    positions.value = [];
  } catch (error) {
    console.error("Failed to load filter data:", error);
    // Set empty arrays on error to prevent component crashes
    hotels.value = [];
    positions.value = [];
  }
}

async function loadEmployees(filters = {}) {
  loading.value = true;
  try {
    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      console.error('User not authenticated')
      return
    }

    // Use the EXACT same pattern as Users.vue but with inverse filter
    // Users.vue: 'system_role != "employee"' (exclude employees)
    // Employees.vue: 'system_role = "employee"' (include only employees)

    const records = await pb.collection('users').getFullList({
      sort: '-created',
      filter: 'system_role = "employee"'
    })

    // Transform users to employee display format
    employees.value = records.map(user => ({
      id: user.id,
      first_name: user.name?.split(' ')[0] || user.name || 'Sin nombre',
      last_name: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || 'Sin email',
      status: user.verified ? 'active' : 'pending',
      hire_date: user.created,
      system_role: user.system_role,
      user_id: user.id
    }));

    console.log(`Loaded ${records.length} employees:`, records.map(u => ({name: u.name, email: u.email, role: u.system_role})))
  } catch (error) {
    console.error("Failed to load employees:", error);
    if (error.status === 403) {
      console.error('Access denied - user may not have permission to view employees')
    }
    employees.value = [];
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
      // Update user in users collection (same as Users.vue pattern)
      await pb.collection('users').update(dataToSave.id, {
        name: `${dataToSave.first_name} ${dataToSave.last_name}`,
        email: dataToSave.email,
        verified: dataToSave.status === 'active',
        system_role: 'employee'
      });
    } else {
      // Create user in users collection (same as Users.vue pattern)
      await pb.collection('users').create({
        name: `${dataToSave.first_name} ${dataToSave.last_name}`,
        email: dataToSave.email,
        password: 'TempPassword123!', // Temporary password
        passwordConfirm: 'TempPassword123!',
        system_role: 'employee',
        verified: dataToSave.status === 'active'
      });
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
  if (window.confirm(t('admin.employees.deleteConfirmation', { firstName: item.first_name, lastName: item.last_name }))) {
    loading.value = true;
    try {
      // Delete user from users collection (same as Users.vue pattern)
      await pb.collection('users').delete(item.id);
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
