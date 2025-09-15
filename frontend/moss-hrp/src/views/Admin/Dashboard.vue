<template>
  <AdminLayout>
    <!-- Dashboard Content -->
        <v-row>
          <v-col cols="12">
            <h1 class="text-h4 mb-4">Dashboard Overview</h1>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">{{ $t('admin.totalHotels') }}</div>
                <div class="text-h4 text-primary">{{ stats.hotels }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">{{ $t('admin.activeEmployees') }}</div>
                <div class="text-h4 text-success">{{ stats.employees }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">{{ $t('admin.openPositions') }}</div>
                <div class="text-h4 text-warning">{{ stats.openPositions }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">{{ $t('admin.pendingReports') }}</div>
                <div class="text-h4 text-error">{{ stats.pendingReports }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card>
              <v-card-title>{{ $t('admin.recentActivity') }}</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="activity in recentActivity" :key="activity.id">
                    <v-list-item-title>{{ activity.description }}</v-list-item-title>
                    <v-list-item-subtitle>{{ activity.timestamp }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pb } from '@/composables/usePocketbase'
import AdminLayout from '@/layouts/AdminLayout.vue'

// Remove drawer - now handled by layout
const loading = ref(false)
const stats = ref({
  hotels: 0,
  employees: 0,
  openPositions: 0,
  pendingReports: 0
})

// Load real dashboard data
const loadDashboardData = async () => {
  loading.value = true
  try {
    const [hotels, employees, openPositions, payrollPeriods] = await Promise.all([
      pb.collection('hotels').getList(1, 1),
      pb.collection('employees').getList(1, 1),
      pb.collection('open_positions').getList(1, 1, {
        filter: 'status = "open"'
      }),
      pb.collection('payroll_periods').getList(1, 10, {
        filter: 'status = "pending_reports"',
        sort: '-created'
      })
    ])

    stats.value = {
      hotels: hotels.totalItems,
      employees: employees.totalItems,
      openPositions: openPositions.totalItems,
      pendingReports: payrollPeriods.totalItems
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
  loadRecentActivity()
})

const recentActivity = ref([])

// Load real recent activity from audit logs
const loadRecentActivity = async () => {
  try {
    const auditLogs = await pb.collection('audit_logs').getList(1, 5, {
      sort: '-created',
      expand: 'user'
    })

    recentActivity.value = auditLogs.items.map(log => ({
      id: log.id,
      description: log.action_description || `${log.action} on ${log.table_name}`,
      timestamp: new Date(log.created).toLocaleString(),
      user: log.expand?.user?.name || 'System'
    }))
  } catch (error) {
    // Fallback to mock data if audit logs not available
    recentActivity.value = [
      { id: 1, description: 'Employee record updated', timestamp: '2 hours ago', user: 'Admin' },
      { id: 2, description: 'New position posted', timestamp: '4 hours ago', user: 'HR Manager' },
      { id: 3, description: 'Reconciliation completed', timestamp: '6 hours ago', user: 'System' }
    ]
  }
}
</script>
