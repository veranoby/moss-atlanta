<template>
  <AdminLayout>
    <v-container fluid>
      <!-- Page Header -->
      <div class="mb-4">
        <h2 class="text-h4">Hotel Billing & Financial Reports</h2>
        <p class="text-medium-emphasis">View financial summaries and export billing data</p>
      </div>

      <!-- Hotel Selector -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <v-select
            v-model="selectedHotel"
            :items="hotels"
            item-title="name"
            item-value="id"
            label="Select Hotel"
            :rules="[v => !!v || 'A hotel must be selected to view data']"
            required
            hint="Select a hotel to view financial data"
            persistent-hint
          ></v-select>
        </v-card-text>
      </v-card>

      <div v-if="selectedHotel">
        <!-- Summary Cards -->
        <v-row>
          <v-col cols="12" md="3" v-for="card in summaryCards" :key="card.title">
            <v-card>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-caption text-medium-emphasis">{{ card.title }}</div>
                  <div class="text-h5 font-weight-bold">{{ card.value }}</div>
                </div>
                <v-avatar :icon="card.icon" color="primary" size="40"></v-avatar>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Monthly Breakdown Table -->
        <v-card variant="outlined" class="mt-4">
          <v-card-title>Monthly Breakdown</v-card-title>
          <v-data-table
            :headers="monthlyHeaders"
            :items="monthlyBreakdown"
            :loading="loading"
          >
             <template v-slot:item.totalAmount="{ item }">
                {{ formatCurrency(item.totalAmount) }}
             </template>
          </v-data-table>
        </v-card>

        <!-- Weekly Payroll Detail Table -->
        <v-card variant="outlined" class="mt-4">
          <v-card-title>Weekly Payroll Detail</v-card-title>
          <v-data-table
            :headers="weeklyHeaders"
            :items="billingData"
            :loading="loading"
          >
             <template v-slot:item.total_amount="{ item }">
                {{ formatCurrency(item.total_amount) }}
             </template>
          </v-data-table>
        </v-card>
      </div>
       <v-alert v-else type="info" variant="tonal" class="mt-4">
          Please select a hotel to view the financial reports.
        </v-alert>

    </v-container>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useHotelBilling } from '@/composables/useHotelBilling';
import { pb } from '@/plugins/pocketbase';

// Composable Usage
const { billingData, summary, loading, error, fetchHotelPayrollHistory, getYTDSummary, getMonthlyAggregation } = useHotelBilling();

// Local State
const hotels = ref([]);
const selectedHotel = ref(null);
const selectedYear = ref(new Date().getFullYear());
const monthlyBreakdown = ref([]);

// UI Data
const summaryCards = computed(() => [
  { title: 'YTD Total Hours', value: summary.value.totalHours.toFixed(2), icon: 'mdi-clock' },
  { title: 'YTD Total Amount', value: formatCurrency(summary.value.totalAmount), icon: 'mdi-currency-usd' },
  { title: 'Avg Weekly Hours', value: summary.value.avgWeeklyHours.toFixed(2), icon: 'mdi-chart-line' },
  { title: 'Period Count', value: summary.value.periodCount, icon: 'mdi-calendar' }
]);

const monthlyHeaders = [
  { title: 'Month', key: 'month' },
  { title: 'Total Hours', key: 'totalHours', align: 'end' },
  { title: 'Total Amount', key: 'totalAmount', align: 'end' },
  { title: 'Week Count', key: 'weekCount', align: 'end' }
];

const weeklyHeaders = [
  { title: 'Week Start', key: 'week_start', sortable: true },
  { title: 'Week End', key: 'week_end' },
  { title: 'Total Hours', key: 'total_hours', align: 'end' },
  { title: 'Total Amount', key: 'total_amount', align: 'end' },
  { title: 'Status', key: 'status' }
];

// Functions
async function loadHotels() {
  try {
    hotels.value = await pb.collection('hotels').getFullList({ sort: 'name' });
  } catch (err) {
    console.error('Failed to load hotels:', err);
  }
}

function formatCurrency(value) {
  if (typeof value !== 'number') {
    return value;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// Watcher for hotel selection change
watch(selectedHotel, async (newHotelId) => {
  if (newHotelId) {
    await getYTDSummary(newHotelId, selectedYear.value);
    await fetchHotelPayrollHistory(newHotelId);
    monthlyBreakdown.value = getMonthlyAggregation(billingData.value);
  } else {
    // Clear data if no hotel is selected
    billingData.value = [];
    summary.value = { totalHours: 0, totalAmount: 0, avgWeeklyHours: 0, periodCount: 0 };
    monthlyBreakdown.value = [];
  }
});

// Lifecycle Hook
onMounted(() => {
  loadHotels();
});
</script>