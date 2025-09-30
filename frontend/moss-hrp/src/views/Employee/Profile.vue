<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-toolbar-title>MOSS Atlanta - Employee Portal</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <div v-if="loading" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p>Loading your profile...</p>
        </div>
        <div v-else-if="error">
            <v-alert type="error" variant="tonal">{{ error }}</v-alert>
        </div>
        <v-row v-else-if="employee">
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>My Profile</v-card-title>
              <v-card-text>
                <div class="text-center mb-4">
                  <v-avatar size="80" color="primary">
                    <span class="text-h4 text-white">{{ employee.initials }}</span>
                  </v-avatar>
                </div>
                <div class="text-center">
                  <div class="text-h6">{{ employee.fullName }}</div>
                  <div class="text-subtitle-1 text-grey">{{ employee.position }}</div>
                  <div class="text-subtitle-2 text-grey">{{ employee.hotel }}</div>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="mt-4">
              <v-card-title>Quick Actions</v-card-title>
              <v-list>
                <v-list-item @click="downloadPaystub">
                  <v-list-item-title>Download Latest Paystub</v-list-item-title>
                   <template v-slot:prepend>
                    <v-icon>mdi-download</v-icon>
                  </template>
                </v-list-item>
                <v-list-item @click="updateDocuments">
                  <v-list-item-title>Update W9/W4 Forms</v-list-item-title>
                   <template v-slot:prepend>
                    <v-icon>mdi-file-document</v-icon>
                  </template>
                </v-list-item>
                <v-list-item @click="reportIssue">
                  <v-list-item-title>Report Time Issue</v-list-item-title>
                   <template v-slot:prepend>
                    <v-icon>mdi-alert-circle</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-card>
              <v-card-title>Recent Time Entries</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="timeHeaders"
                  :items="timesheetData"
                  :items-per-page="10"
                  :loading="loading"
                >
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      small
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>

            <v-card class="mt-4">
              <v-card-title>This Week Summary</v-card-title>
              <v-card-text>
                 <div v-if="loading" class="text-center">
                    <v-progress-circular indeterminate></v-progress-circular>
                 </div>
                 <v-row v-else>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-primary">{{ weeklySummary.totalHours.toFixed(2) }}</div>
                      <div class="text-caption">Total Hours</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-success">{{ weeklySummary.daysWorked }}</div>
                      <div class="text-caption">Days Worked</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-info">{{ formatCurrency(weeklySummary.estimatedPay) }}</div>
                      <div class="text-caption">Estimated Pay</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-warning">{{ weeklySummary.overtimeHours.toFixed(2) }}</div>
                      <div class="text-caption">Overtime Hours</div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useEmployeeTimesheet } from '@/composables/useEmployeeTimesheet';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

// Get authenticated employee from Pinia auth store
const authStore = useAuthStore();
const { user: authUser } = storeToRefs(authStore);

// Use the composable
const { timesheetData, weeklySummary, loading, error, fetchEmployeePunches, getWeeklySummary } = useEmployeeTimesheet();

const employee = computed(() => {
    if (!authUser.value) return null;
    return {
        id: authUser.value.record.id,
        employeeId: authUser.value.record.employee_id,
        fullName: authUser.value.record.name,
        initials: (authUser.value.record.name || '').split(' ').map(n => n[0]).join(''),
        // Assuming position and hotel are expanded on the user record
        position: authUser.value.record.expand?.assignments?.[0]?.expand?.position?.title || 'N/A',
        hotel: authUser.value.record.expand?.assignments?.[0]?.expand?.hotel?.name || 'N/A',
    };
});

const timeHeaders = [
  { title: 'Date', key: 'work_date' },
  { title: 'Clock In', key: 'clock_in_time' },
  { title: 'Clock Out', key: 'clock_out_time' },
  { title: 'Hours', key: 'total_hours', align: 'end' },
  { title: 'Status', key: 'status' }
];

function getStatusColor(status) {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    default: return 'grey';
  }
}

function formatCurrency(value) {
    if (typeof value !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function downloadPaystub() {
  console.log('Download paystub action triggered');
}

function updateDocuments() {
  console.log('Update documents action triggered');
}

function reportIssue() {
  console.log('Report issue action triggered');
}

function logout() {
  authStore.logout();
  // Typically you would redirect to the login page here
}

onMounted(async () => {
  if (employee.value?.employeeId) {
    const today = new Date();
    const last30Days = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];

    await fetchEmployeePunches(employee.value.employeeId, { from: last30Days });

    // Calculate current week start
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const currentWeekStart = new Date(d.setDate(diff)).toISOString().split('T')[0];

    await getWeeklySummary(employee.value.employeeId, currentWeekStart);
  } else {
      error.value = "Could not identify the logged-in employee. Please log in again.";
  }
});
</script>