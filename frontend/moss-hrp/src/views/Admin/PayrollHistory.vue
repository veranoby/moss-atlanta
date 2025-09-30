<template>
  <AdminLayout>
    <v-container fluid>
      <!-- Page Header -->
      <div class="mb-4">
        <h2 class="text-h4">Payroll History</h2>
        <p class="text-medium-emphasis">View and export completed payroll periods</p>
      </div>

      <!-- Filters Panel -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>Filters</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedHotel"
                :items="hotels"
                item-title="name"
                item-value="id"
                label="Filter by Hotel"
                clearable
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="dateRange.startDate"
                label="Week Start - From"
                type="date"
                density="compact"
                hint="YYYY-MM-DD format"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="dateRange.endDate"
                label="Week Start - To"
                type="date"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2" class="d-flex align-center">
              <v-btn @click="applyFilters" color="primary" class="mr-2">Apply</v-btn>
              <v-btn @click="clearFilters" variant="outlined">Clear</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Error Alert -->
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Data Table -->
      <v-card variant="outlined">
        <v-data-table
          :headers="headers"
          :items="payrollHistory"
          :loading="loading"
          :items-per-page="50"
          :sort-by="[{ key: 'week_start', order: 'desc' }]"
          item-value="id"
        >
          <template v-slot:item.total_amount="{ item }">
            {{ formatCurrency(item.total_amount) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetails(item)"></v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </AdminLayout>

  <!-- Detail Modal -->
  <v-dialog v-model="detailDialog" max-width="1000px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Payroll Details</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" @click="detailDialog = false"></v-btn>
      </v-card-title>
      <v-card-text v-if="selectedPayroll">
        <p><strong>Hotel:</strong> {{ selectedPayroll.expand.hotel.name }}</p>
        <p><strong>Period:</strong> {{ selectedPayroll.week_start }} to {{ selectedPayroll.week_end }}</p>
        <v-data-table
          :headers="detailHeaders"
          :items="payrollItems"
          :loading="detailsLoading"
          class="mt-4"
        >
          <template v-slot:item.gross_pay="{ item }">
            {{ formatCurrency(item.gross_pay) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { usePayrollHistory } from '@/composables/usePayrollHistory';
import { pb } from '@/plugins/pocketbase';

// Composable usage
const { payrollHistory, loading, error, fetchPayrollHistory, fetchPayrollDetails } = usePayrollHistory();

// Local State
const hotels = ref([]);
const selectedHotel = ref(null);
const dateRange = ref({ startDate: null, endDate: null });
const detailDialog = ref(false);
const selectedPayroll = ref(null);
const payrollItems = ref([]);
const detailsLoading = ref(false);

// Table Headers
const headers = [
  { title: 'Hotel', key: 'expand.hotel.name', sortable: true },
  { title: 'Week Start', key: 'week_start', sortable: true },
  { title: 'Week End', key: 'week_end', sortable: true },
  { title: 'Total Hours', key: 'total_hours', align: 'end' },
  { title: 'Total Amount', key: 'total_amount', align: 'end' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'QB Batch ID', key: 'quickbooks_batch_id' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const detailHeaders = [
  { title: 'Employee', key: 'expand.assignment.expand.employee.first_name' },
  { title: 'Position', key: 'expand.assignment.expand.position.title' },
  { title: 'Hours', key: 'hours_worked', align: 'end' },
  { title: 'Rate', key: 'hourly_rate', align: 'end' },
  { title: 'Gross Pay', key: 'gross_pay', align: 'end' }
];

// Functions
async function loadHotels() {
  try {
    hotels.value = await pb.collection('hotels').getFullList({ sort: 'name' });
  } catch (err) {
    console.error('Failed to load hotels:', err);
  }
}

function applyFilters() {
  const filters = {
    hotel: selectedHotel.value,
    startDate: dateRange.value.startDate,
    endDate: dateRange.value.endDate,
  };
  fetchPayrollHistory(filters);
}

function clearFilters() {
  selectedHotel.value = null;
  dateRange.value = { startDate: null, endDate: null };
  fetchPayrollHistory();
}

async function viewDetails(payroll) {
  selectedPayroll.value = payroll;
  detailDialog.value = true;
  detailsLoading.value = true;
  try {
    const items = await fetchPayrollDetails(payroll.id);
    payrollItems.value = items;
  } catch (err) {
    console.error('Failed to fetch payroll details:', err);
    // You could show an error in the modal here
  } finally {
    detailsLoading.value = false;
  }
}

function formatCurrency(value) {
  if (typeof value !== 'number') {
    return value;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// Lifecycle Hook
onMounted(() => {
  loadHotels();
  fetchPayrollHistory();
});
</script>