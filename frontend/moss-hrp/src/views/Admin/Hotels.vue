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
      <v-toolbar-title>Hotels Management</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="addHotel">
        <v-icon left>mdi-plus</v-icon>
        Add Hotel
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                Hotels List
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search hotels"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>

              <v-data-table
                :headers="headers"
                :items="hotels"
                :search="search"
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="item.status === 'active' ? 'success' : 'grey'"
                    text-color="white"
                    small
                  >
                    {{ item.status }}
                  </v-chip>
                </template>

                <template v-slot:item.indicators="{ item }">
                  <div class="d-flex flex-column">
                    <v-chip size="x-small" color="success" class="mb-1">
                      Conciliado: {{ item.lastReconciled }}
                    </v-chip>
                    <v-chip size="x-small" color="warning">
                      App data: {{ item.lastAppData }}
                    </v-chip>
                  </div>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" @click="editHotel(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" @click="viewHotel(item)">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
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
const search = ref('')

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Code', value: 'code' },
  { title: 'Time System', value: 'timeSystem' },
  { title: 'Contact', value: 'contact' },
  { title: 'Status', value: 'status' },
  { title: 'Indicators', value: 'indicators' },
  { title: 'Actions', value: 'actions', sortable: false }
]

const hotels = ref([
  {
    id: 1,
    name: 'Hilton Downtown',
    code: 'HILTON_DT',
    timeSystem: 'workrecords',
    contact: 'John Manager',
    status: 'active',
    lastReconciled: '03/Aug',
    lastAppData: '05/Aug'
  },
  {
    id: 2,
    name: 'Marriott Buckhead',
    code: 'MARRIOTT_BH',
    timeSystem: 'homebase',
    contact: 'Sarah Johnson',
    status: 'active',
    lastReconciled: '02/Aug',
    lastAppData: '05/Aug'
  }
])

function addHotel() {
  console.log('Add new hotel')
}

function editHotel(hotel) {
  console.log('Edit hotel:', hotel.name)
}

function viewHotel(hotel) {
  console.log('View hotel:', hotel.name)
}
</script>
