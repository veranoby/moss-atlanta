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

const employee = ref({
  fullName: 'Maria Rodriguez',
  initials: 'MR',
  position: 'Housekeeper',
  hotel: 'Hilton Downtown',
  employeeId: 'EMP001'
})

const weekSummary = ref({
  totalHours: 38.5,
  daysWorked: 5,
  estimatedPay: 578,
  overtime: 2.5
})

const timeHeaders = [
  { title: 'Date', value: 'date' },
  { title: 'Clock In', value: 'clockIn' },
  { title: 'Clock Out', value: 'clockOut' },
  { title: 'Hours', value: 'hours' },
  { title: 'Status', value: 'status' }
]

const timeEntries = ref([
  { date: '2025-08-05', clockIn: '08:00', clockOut: '16:30', hours: 7.5, status: 'approved' },
  { date: '2025-08-04', clockIn: '08:15', clockOut: '16:45', hours: 7.5, status: 'approved' },
  { date: '2025-08-03', clockIn: '08:00', clockOut: '17:00', hours: 8.0, status: 'pending' },
  { date: '2025-08-02', clockIn: '08:00', clockOut: '16:30', hours: 7.5, status: 'approved' }
])

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
