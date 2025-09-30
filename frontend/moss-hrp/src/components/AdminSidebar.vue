<template>
  <v-navigation-drawer v-model="sidebarOpen" app permanent width="280">
    <!-- Sidebar Header -->
    <v-list-item class="pa-4">
      <div class="d-flex align-center">
        <v-icon size="32" color="primary" class="me-3">mdi-domain</v-icon>
        <div>
          <div class="text-h6 font-weight-bold">MOSS Admin</div>
          <div class="text-caption text-medium-emphasis">{{ $t('admin.managementPanel') }}</div>
        </div>
      </div>
    </v-list-item>

    <v-divider />

    <!-- Navigation Menu -->
    <v-list nav density="comfortable" class="pt-4">
      <!-- Dashboard -->
      <v-list-item
        :to="{ name: 'AdminDashboard' }"
        prepend-icon="mdi-view-dashboard"
        :title="$t('admin.dashboard')"
        value="dashboard"
        class="mb-1"
      />

      <!-- Master Data Section -->
      <v-list-subheader class="text-uppercase text-caption font-weight-bold mt-4">
        {{ $t('admin.masterData') }}
      </v-list-subheader>

      <v-list-item
        :to="{ name: 'AdminHotels' }"
        prepend-icon="mdi-domain"
        :title="$t('admin.hotels')"
        value="hotels"
        class="mb-1"
      />

      <v-list-item
        :to="{ name: 'AdminDepartments' }"
        prepend-icon="mdi-file-tree"
        :title="$t('admin.departments')"
        value="departments"
        class="mb-1"
      />

      <v-list-item
        :to="{ name: 'AdminPositions' }"
        prepend-icon="mdi-briefcase"
        :title="$t('admin.positions')"
        value="positions"
        class="mb-1"
      />

      <!-- Employee Management -->
      <v-list-subheader class="text-uppercase text-caption font-weight-bold mt-4">
        Employee Management
      </v-list-subheader>

      <v-list-item
        :to="{ name: 'AdminEmployees' }"
        prepend-icon="mdi-account-group"
        title="Employees"
        value="employees"
        class="mb-1"
      />

      <!-- Hiring Process -->
      <v-list-subheader class="text-uppercase text-caption font-weight-bold mt-4">
        Hiring Process
      </v-list-subheader>

      <v-list-item
        :to="{ name: 'AdminOpenPositions' }"
        prepend-icon="mdi-briefcase-plus"
        title="Open Positions"
        value="open-positions"
        class="mb-1"
      />

      <v-list-item
        :to="{ name: 'AdminApplications' }"
        prepend-icon="mdi-account-plus"
        :title="$t('admin.applications')"
        value="applications"
        class="mb-1"
      />

      <!-- Operations -->
      <v-list-subheader class="text-uppercase text-caption font-weight-bold mt-4">
        {{ $t('admin.operations') }}
      </v-list-subheader>

      <v-list-item
        :to="{ name: 'AdminReconciliation' }"
        prepend-icon="mdi-compare"
        :title="$t('admin.reconciliation')"
        value="reconciliation"
        class="mb-1"
      />

      <v-list-item
        :to="{ name: 'PayrollHistory' }"
        prepend-icon="mdi-history"
        title="Payroll History"
        value="payroll-history"
        class="mb-1"
      />

      <v-list-item
        :to="{ name: 'HotelBilling' }"
        prepend-icon="mdi-file-document-outline"
        title="Hotel Billing"
        value="hotel-billing"
        class="mb-1"
      />

      <v-list-item
        :to="{ name: 'ReconciliationArchive' }"
        prepend-icon="mdi-archive"
        title="Reconciliation Archive"
        value="reconciliation-archive"
        class="mb-1"
      />

      <!-- System -->
      <v-list-subheader class="text-uppercase text-caption font-weight-bold mt-4">
        {{ $t('admin.system') }}
      </v-list-subheader>

      <v-list-item
        v-if="authStore.hasRole('super_admin')"
        :to="{ name: 'AdminUsers' }"
        prepend-icon="mdi-account-multiple"
        :title="$t('admin.users')"
        value="users"
        class="mb-1"
      />

      <v-list-item
        :to="{ name: 'AdminSettings' }"
        prepend-icon="mdi-cog"
        :title="$t('admin.settings')"
        value="settings"
        class="mb-1"
      />
    </v-list>

    <!-- User Info at Bottom -->
    <template #append>
      <v-divider />
      <v-list-item class="pa-4">
        <div class="d-flex align-center">
          <v-avatar size="32" color="primary" class="me-3">
            <span class="text-white text-body-2">{{ userInitials }}</span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-body-2 font-weight-medium">{{ userName }}</div>
            <div class="text-caption text-medium-emphasis">{{ userRole }}</div>
          </div>
          <v-btn
            icon="mdi-logout"
            variant="text"
            size="small"
            @click="handleLogout"
            class="ms-2"
          />
        </div>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Props & Emits
interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Composables
const router = useRouter()
const authStore = useAuthStore()

// Computed
const sidebarOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.email || 'Admin User'
})

const userRole = computed(() => {
  const role = authStore.userRole
  if (role === 'super_admin') return 'Super Admin'
  if (role === 'admin') return 'Administrator'
  return role || 'User'
})

const userInitials = computed(() => {
  const name = userName.value
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
})

// Methods
const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.v-list-subheader {
  opacity: 0.7;
  font-size: 0.75rem;
}

.v-list-item {
  border-radius: 8px;
  margin: 0 12px;
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}
</style>