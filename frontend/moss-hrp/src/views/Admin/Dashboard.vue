<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item title="Dashboard" prepend-icon="mdi-view-dashboard" to="/admin"></v-list-item>
        <v-list-item title="Hotels" prepend-icon="mdi-domain" to="/admin/hotels"></v-list-item>
        <v-list-item title="Employees" prepend-icon="mdi-account-group" to="/admin/employees"></v-list-item>
        <v-list-item title="Open Positions" prepend-icon="mdi-briefcase" to="/admin/positions"></v-list-item>
        <v-list-item title="Reconciliation" prepend-icon="mdi-compare" to="/admin/reconciliation"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>MOSS Atlanta - Admin Panel</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>mdi-home</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <h1 class="text-h4 mb-4">Dashboard Overview</h1>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">Total Hotels</div>
                <div class="text-h4 text-primary">{{ stats.hotels }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">Active Employees</div>
                <div class="text-h4 text-success">{{ stats.employees }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">Open Positions</div>
                <div class="text-h4 text-warning">{{ stats.openPositions }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">Pending Reports</div>
                <div class="text-h4 text-error">{{ stats.pendingReports }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card>
              <v-card-title>Recent Activity</v-card-title>
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
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)

const stats = ref({
  hotels: 23,
  employees: 387,
  openPositions: 12,
  pendingReports: 5
})

const recentActivity = ref([
  { id: 1, description: 'New employee hired: Maria Rodriguez', timestamp: '2 hours ago' },
  { id: 2, description: 'Hotel report processed: Hilton Downtown', timestamp: '4 hours ago' },
  { id: 3, description: 'Open position filled: Housekeeper at Marriott', timestamp: '1 day ago' }
])
</script>
