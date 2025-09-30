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
        <v-row>
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
                  <v-list-item-prepend>
                    <v-icon>mdi-download</v-icon>
                  </v-list-item-prepend>
                </v-list-item>
                <v-list-item @click="updateDocuments">
                  <v-list-item-title>Update W9/W4 Forms</v-list-item-title>
                  <v-list-item-prepend>
                    <v-icon>mdi-file-document</v-icon>
                  </v-list-item-prepend>
                </v-list-item>
                <v-list-item @click="reportIssue">
                  <v-list-item-title>Report Time Issue</v-list-item-title>
                  <v-list-item-prepend>
                    <v-icon>mdi-alert-circle</v-icon>
                  </v-list-item-prepend>
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
                  :items="timeEntries"
                  :items-per-page="10"
                >
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      text-color="white"
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
                <v-row>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-primary">{{ weekSummary.totalHours }}</div>
                      <div class="text-caption">Total Hours</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-success">{{ weekSummary.daysWorked }}</div>
                      <div class="text-caption">Days Worked</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-info">${{ weekSummary.estimatedPay }}</div>
                      <div class="text-caption">Estimated Pay</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-warning">{{ weekSummary.overtime }}</div>
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
import { ref, computed } from 'vue'
// TODO [JULES]: Import useEmployeeTimesheet composable (created by Qwen)
// import { useEmployeeTimesheet } from '@/composables/useEmployeeTimesheet'

// TODO [JULES]: Get authenticated employee from auth store
// import { storeToRefs } from 'pinia'
// import { useAuthStore } from '@/stores/auth'
// const { user } = storeToRefs(useAuthStore())

// TODO [JULES]: Replace with real employee data from Pocketbase
const employee = ref({
  fullName: 'Maria Rodriguez',
  initials: 'MR',
  position: 'Housekeeper',
  hotel: 'Hilton Downtown',
  employeeId: 'EMP001'
})

// TODO [JULES]: Replace with real data from useEmployeeTimesheet composable
// const { weekSummary, timeEntries, loading } = useEmployeeTimesheet(employee.value.employeeId)
const weekSummary = ref({
  totalHours: 0,
  daysWorked: 0,
  estimatedPay: 0,
  overtime: 0
})

const timeHeaders = [
  { title: 'Date', value: 'date' },
  { title: 'Clock In', value: 'clockIn' },
  { title: 'Clock Out', value: 'clockOut' },
  { title: 'Hours', value: 'hours' },
  { title: 'Status', value: 'status' }
]

// TODO [JULES]: Replace with real data from useEmployeeTimesheet composable
const timeEntries = ref([])

function getStatusColor(status) {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'grey'
  }
}

function downloadPaystub() {
  console.log('Download paystub')
}

function updateDocuments() {
  console.log('Update documents')
}

function reportIssue() {
  console.log('Report issue')
}

function logout() {
  console.log('Logout')
}
</script>
