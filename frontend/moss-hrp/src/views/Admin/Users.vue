<template>
  <AdminLayout>
    <v-container fluid class="pa-0">
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h4 mb-2">{{ $t('admin.users') }}</h2>
          <p class="text-body-1 text-medium-emphasis">{{ $t('admin.usersSubtitle') }}</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="openCreateModal"
        >
          {{ $t('admin.createUser') }}
        </v-btn>
      </div>

      <!-- Search and Filters -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchText"
            prepend-inner-icon="mdi-magnify"
            :label="$t('common.search')"
            variant="outlined"
            density="compact"
            hide-details
            @input="searchUsers"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedRole"
            :items="roleOptions"
            :label="$t('admin.filterByRole')"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="filterUsers"
          />
        </v-col>
      </v-row>

      <!-- Users Table -->
      <v-card variant="outlined">
        <v-progress-linear v-if="loading" indeterminate color="primary" />

        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :loading="loading"
          :items-per-page="25"
          class="elevation-0"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                :image="getAvatarUrl(item.avatar)"
                color="primary"
                size="32"
                class="me-3"
              >
                <span v-if="!item.avatar" class="text-white text-body-2">
                  {{ getUserInitials(item.name || item.email) }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name || $t('admin.users.noName') }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #item.system_role="{ item }">
            <v-chip
              :color="getRoleColor(item.system_role)"
              size="small"
              variant="tonal"
            >
              {{ getRoleLabel(item.system_role) }}
            </v-chip>
          </template>

          <template #item.verified="{ item }">
            <v-chip
              :color="item.verified ? 'success' : 'warning'"
              size="small"
              variant="tonal"
            >
              {{ item.verified ? $t('common.verified') : $t('common.pending') }}
            </v-chip>
          </template>

          <template #item.created="{ item }">
            {{ formatDate(item.created) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="editUser(item)"
            />
            <v-btn
              icon="mdi-lock-reset"
              variant="text"
              size="small"
              @click="resetPassword(item)"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="deleteUser(item)"
            />
          </template>
        </v-data-table>
      </v-card>

      <!-- User Form Modal -->
      <v-dialog v-model="dialogVisible" max-width="600px" persistent>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-account</v-icon>
            {{ isEditing ? $t('admin.editUser') : $t('admin.createUser') }}
          </v-card-title>

          <v-card-text>
            <v-form ref="userForm" @submit.prevent="saveUser">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedUser.name"
                    :label="$t('common.name')"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedUser.email"
                    :label="$t('common.email')"
                    :rules="[rules.required, rules.email]"
                    variant="outlined"
                    density="compact"
                    type="email"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedUser.system_role"
                    :items="roleOptions"
                    :label="$t('admin.role')"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="!isEditing">
                  <v-text-field
                    v-model="editedUser.password"
                    :label="$t('common.password')"
                    :rules="[rules.required, rules.minLength]"
                    variant="outlined"
                    density="compact"
                    type="password"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="closeModal"
            >
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              :loading="saving"
              @click="saveUser"
            >
              {{ $t('common.save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation -->
      <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
          <v-card-title>{{ $t('admin.deleteUser') }}</v-card-title>
          <v-card-text>
            {{ $t('admin.deleteUserConfirm') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="deleteDialog = false">
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn color="error" @click="confirmDelete">
              {{ $t('common.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { pb } from '@/composables/usePocketbase'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth'

// Reactive state
const loading = ref(false)
const saving = ref(false)
const users = ref([])
const searchText = ref('')
const selectedRole = ref('')
const dialogVisible = ref(false)
const deleteDialog = ref(false)
const editedUser = ref({})
const userToDelete = ref(null)
const userForm = ref(null)
const authStore = useAuthStore()

const { t } = useI18n();

// Role options
const roleOptions = [
  { title: t('admin.roles.super_admin'), value: 'super_admin' },
  { title: t('admin.roles.administrator'), value: 'administrator' },
  { title: t('admin.roles.operations_hr'), value: 'operations_hr' },
  { title: t('admin.roles.finance'), value: 'finance' },
  { title: t('admin.roles.field_manager'), value: 'field_manager' },
  { title: t('admin.roles.employee'), value: 'employee' }
]

// Table headers
const headers = [
  { title: t('admin.users.user'), key: 'name', sortable: true },
  { title: t('admin.users.role'), key: 'system_role', sortable: true },
  { title: t('admin.users.status'), key: 'verified', sortable: true },
  { title: t('admin.users.created'), key: 'created', sortable: true },
  { title: t('admin.users.actions'), key: 'actions', sortable: false, align: 'end' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || t('common.validations.required'),
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || t('common.validations.email')
  },
  minLength: (value: string) => (value && value.length >= 8) || t('common.validations.minLength', { min: 8 })
}

// Computed
const isEditing = computed(() => !!editedUser.value.id)

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    )
  }

  if (selectedRole.value) {
    filtered = filtered.filter(user => user.system_role === selectedRole.value)
  }

  return filtered
})

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      console.error('User not authenticated')
      return
    }

    const records = await pb.collection('users').getFullList({
      sort: '-created',
      filter: 'system_role != "employee"'
    })
    users.value = records
    console.log(`Loaded ${records.length} users:`, records.map(u => ({name: u.name, email: u.email, role: u.system_role})))
  } catch (error) {
    console.error('Failed to load users:', error)
    if (error.status === 403) {
      console.error('Access denied - user may not have permission to view users')
    }
  } finally {
    loading.value = false
  }
}

const searchUsers = () => {
  // Filtering happens in computed property
}

const filterUsers = () => {
  // Filtering happens in computed property
}

const openCreateModal = () => {
  editedUser.value = {
    name: '',
    email: '',
    system_role: 'employee',
    password: ''
  }
  dialogVisible.value = true
}

const editUser = (user) => {
  editedUser.value = { ...user }
  dialogVisible.value = true
}

const closeModal = () => {
  dialogVisible.value = false
  editedUser.value = {}
}

const saveUser = async () => {
  if (!userForm.value) return

  const { valid } = await userForm.value.validate()
  if (!valid) return

  saving.value = true
  try {
    let newUser
    if (isEditing.value) {
      await pb.collection('users').update(editedUser.value.id, {
        name: editedUser.value.name,
        email: editedUser.value.email,
        system_role: editedUser.value.system_role
      })
    } else {
      newUser = await pb.collection('users').create({
        name: editedUser.value.name,
        email: editedUser.value.email,
        password: editedUser.value.password,
        passwordConfirm: editedUser.value.password,
        system_role: editedUser.value.system_role
      })

      // If creating an employee, also create employee record
      if (editedUser.value.system_role === 'employee') {
        await createEmployeeRecord(newUser)
      }
    }

    await loadUsers()
    closeModal()
  } catch (error) {
    console.error('Failed to save user:', error)
  } finally {
    saving.value = false
  }
}

// Create corresponding employee record for employee users
const createEmployeeRecord = async (user) => {
  try {
    // Generate unique employee ID
    const employeeId = `EMP${Date.now().toString().slice(-6)}`

    await pb.collection('employees').create({
      employee_id: employeeId,
      first_name: user.name.split(' ')[0] || user.name,
      last_name: user.name.split(' ').slice(1).join(' ') || 'Apellido',
      phone: '000-000-0000', // Required field - placeholder until employee completes profile
      email: user.email,
      user_id: user.id,
      status: 'pending_approval',
      system_role: 'employee',
      employment_type: 'employee'
    })
  } catch (error) {
    console.error('Failed to create employee record:', error)
  }
}

const deleteUser = (user) => {
  userToDelete.value = user
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await pb.collection('users').delete(userToDelete.value.id)
    await loadUsers()
    deleteDialog.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

const resetPassword = async (user) => {
  if (!confirm(t('admin.users.resetPasswordConfirmation', { name: user.name }))) {
    return
  }

  try {
    // Generate secure temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(2, 12)}!`

    // Update user password
    await pb.collection('users').update(user.id, {
      password: tempPassword,
      passwordConfirm: tempPassword
    })

    // Create a modal or better notification instead of alert
    const message = `${t('admin.users.passwordResetSuccess', { name: user.name })}\n\n${t('admin.users.temporaryPassword', { tempPassword })}\n\n⚠️ ${t('admin.users.passwordChangeWarning')}`

    // For now using alert, but could be replaced with a proper modal
    alert(message)

    // TODO: In production, this should:
    // 1. Send email to user with temporary password
    // 2. Force password change on next login
    // 3. Log the action in audit_logs
    console.log(`Password reset for user ${user.id} (${user.email})`)
  } catch (error) {
    console.error('Failed to reset password:', error)
    alert(t('admin.users.passwordResetError'))
  }
}

// Utility methods
const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  // Return avatar URL from Pocketbase
  return `http://localhost:8080/api/files/users/${avatar}`
}

const getUserInitials = (name) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
}

const getRoleColor = (role) => {
  const colors = {
    super_admin: 'purple',
    administrator: 'indigo',
    operations_hr: 'blue',
    finance: 'green',
    field_manager: 'orange',
    employee: 'grey'
  }
  return colors[role] || 'grey'
}

const getRoleLabel = (role) => {
  const option = roleOptions.find(opt => opt.value === role)
  return option?.title || role
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.v-data-table {
  background: transparent;
}
</style>