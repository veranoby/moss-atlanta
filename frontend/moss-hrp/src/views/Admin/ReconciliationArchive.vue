<template>
  <AdminLayout>
    <v-container fluid>
      <!-- Page Header -->
      <div class="mb-4">
        <h2 class="text-h4">Reconciliation Archive</h2>
        <p class="text-medium-emphasis">Search completed reconciliations for audit and compliance</p>
      </div>

      <!-- Advanced Filters -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>Advanced Filters</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.hotel"
                :items="hotels"
                item-title="name"
                item-value="id"
                label="Hotel"
                clearable
                hide-details
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filters.dateFrom"
                label="Date From"
                type="date"
                hide-details
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filters.dateTo"
                label="Date To"
                type="date"
                hide-details
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.status"
                :items="['match', 'discrepancy', 'resolved']"
                label="Status"
                multiple
                clearable
                hide-details
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
               <v-select
                v-model="filters.discrepancyLevel"
                :items="['Exact Match (<1%)', 'Low (1-5%)', 'High (>5%)']"
                label="Discrepancy Level"
                clearable
                hide-details
                density="compact"
              ></v-select>
            </v-col>
          </v-row>
          <v-row dense class="mt-2">
             <v-col cols="12" class="d-flex justify-end">
                <v-btn @click="searchReconciliations" color="primary" class="mr-2">Search</v-btn>
                <v-btn @click="clearFilters" variant="outlined">Clear</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Error Alert -->
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Results Table -->
      <v-card variant="outlined">
        <v-data-table
          :headers="headers"
          :items="reconciliations"
          :loading="loading"
          items-per-page="50"
          item-value="id"
        >
          <template v-slot:item.discrepancy="{ item }">
             <span>{{ item.discrepancy ? (item.discrepancy * 100).toFixed(2) + '%' : '0.00%' }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetails(item)"></v-btn>
          </template>
        </v-data-table>
      </v-card>

    </v-container>
  </AdminLayout>

  <!-- Detail Modal -->
  <v-dialog v-model="detailDialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Reconciliation Details</span>
      </v-card-title>
      <v-card-text v-if="selectedReconciliation">
        <p><strong>ID:</strong> {{ selectedReconciliation.id }}</p>
        <p><strong>Date:</strong> {{ new Date(selectedReconciliation.date).toLocaleDateString() }}</p>
        <p><strong>Employee:</strong> {{ selectedReconciliation.expand?.employee?.first_name }} {{ selectedReconciliation.expand?.employee?.last_name }}</p>
        <p><strong>Hotel:</strong> {{ selectedReconciliation.expand?.hotel_report?.expand?.hotel?.name }}</p>
        <p><strong>Status:</strong> <v-chip size="small">{{ selectedReconciliation.status }}</v-chip></p>
        <p><strong>Hotel Hours:</strong> {{ selectedReconciliation.hotel_hours }}</p>
        <p><strong>App Hours:</strong> {{ selectedReconciliation.app_hours }}</p>
        <p><strong>Final Hours:</strong> {{ selectedReconciliation.final_hours }}</p>
        <p><strong>Approved By:</strong> {{ selectedReconciliation.expand?.approved_by?.name || 'N/A' }}</p>
        <v-divider class="my-2"></v-divider>
        <p class="font-weight-bold">Resolution Notes:</p>
        <p style="white-space: pre-wrap;">{{ selectedReconciliation.resolution_notes || 'No notes provided.' }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="detailDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { pb } from '@/plugins/pocketbase';

// Component-specific state
const reconciliations = ref([]);
const loading = ref(false);
const error = ref(null);
const hotels = ref([]);

const filters = ref({
  hotel: null,
  dateFrom: null,
  dateTo: null,
  status: ['resolved'],
  discrepancyLevel: null,
});

const headers = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Employee', key: 'expand.employee.first_name' },
  { title: 'Hotel Hours', key: 'hotel_hours', align: 'end' },
  { title: 'App Hours', key: 'app_hours', align: 'end' },
  { title: 'Final Hours', key: 'final_hours', align: 'end' },
  { title: 'Discrepancy', key: 'discrepancy', align: 'end' },
  { title: 'Status', key: 'status' },
  { title: 'Approved By', key: 'expand.approved_by.name' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const detailDialog = ref(false);
const selectedReconciliation = ref(null);

// Functions
async function loadHotels() {
  try {
    const hotelList = await pb.collection('hotels').getFullList({ sort: 'name' });
    hotels.value = hotelList;
  } catch (err) {
    console.error('Failed to load hotels:', err);
    error.value = 'Failed to load hotels for filtering.';
  }
}

function buildFilterString() {
  const filterParts = [];
  if (filters.value.hotel) {
    // Note: This filter depends on the expand and might be slow.
    // A better approach would be to denormalize hotel ID onto reconciliations if performance is an issue.
    filterParts.push(`hotel_report.hotel = "${filters.value.hotel}"`);
  }
  if (filters.value.dateFrom) {
    filterParts.push(`date >= "${filters.value.dateFrom} 00:00:00"`);
  }
  if (filters.value.dateTo) {
    filterParts.push(`date <= "${filters.value.dateTo} 23:59:59"`);
  }
  if (filters.value.status && filters.value.status.length > 0) {
    const statusFilter = filters.value.status.map(s => `status = "${s}"`).join(' || ');
    filterParts.push(`(${statusFilter})`);
  }
   if (filters.value.discrepancyLevel) {
      switch (filters.value.discrepancyLevel) {
          case 'Exact Match (<1%)':
              filterParts.push('discrepancy < 0.01');
              break;
          case 'Low (1-5%)':
              filterParts.push('(discrepancy >= 0.01 && discrepancy <= 0.05)');
              break;
          case 'High (>5%)':
              filterParts.push('discrepancy > 0.05');
              break;
      }
  }

  // Default to resolved status if no other status is selected
  if (!filters.value.status || filters.value.status.length === 0) {
      filterParts.push("status = 'resolved'");
  }

  return filterParts.join(' && ');
}

async function searchReconciliations() {
  loading.value = true;
  error.value = null;
  try {
    const filter = buildFilterString();
    const result = await pb.collection('reconciliations').getList(1, 50, {
      filter: filter,
      expand: 'hotel_report.hotel,employee,approved_by',
      sort: '-date',
    });
    reconciliations.value = result.items;
  } catch (err) {
    console.error('Failed to search reconciliations:', err);
    error.value = `Failed to search reconciliations: ${err.message}`;
    reconciliations.value = [];
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
    filters.value = {
        hotel: null,
        dateFrom: null,
        dateTo: null,
        status: ['resolved'],
        discrepancyLevel: null,
    };
    searchReconciliations();
}

function viewDetails(item) {
  selectedReconciliation.value = item;
  detailDialog.value = true;
}

onMounted(() => {
  loadHotels();
  searchReconciliations();
});
</script>

<style scoped>
/* Add any specific styles if needed */
</style>