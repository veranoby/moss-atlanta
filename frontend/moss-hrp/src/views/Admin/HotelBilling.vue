<template>
  <AdminLayout>
    <v-container fluid>
      <!-- Page Header -->
      <div class="mb-4">
        <h2 class="text-h4">{{ $t('admin.hotelBilling.title') }}</h2>
        <p class="text-medium-emphasis">{{ $t('admin.hotelBilling.subtitle') }}</p>
      </div>

      <!-- Hotel Selector -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <v-select
            v-model="selectedHotel"
            :items="hotels"
            item-title="name"
            item-value="id"
            :label="$t('admin.hotelBilling.selectHotel')"
            :rules="[v => !!v || $t('admin.hotelBilling.hotelRequired')]"
            required
            :hint="$t('admin.hotelBilling.selectHotel')"
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
          <v-card-title>{{ $t('admin.hotelBilling.monthlyBreakdown') }}</v-card-title>
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
          <v-card-title>{{ $t('admin.hotelBilling.weeklyPayrollDetail') }}</v-card-title>
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
          {{ $t('admin.hotelBilling.pleaseSelectHotel') }}
        </v-alert>

    </v-container>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useHotelBilling } from '@/composables/useHotelBilling';
import { pb } from '@/plugins/pocketbase';

const { t } = useI18n();

// Composable Usage
const { billingData, summary, loading, error, fetchHotelPayrollHistory, getYTDSummary, getMonthlyAggregation } = useHotelBilling();

// Local State
const hotels = ref([]);
const selectedHotel = ref(null);
const selectedYear = ref(new Date().getFullYear());
const monthlyBreakdown = ref([]);

// UI Data
const summaryCards = computed(() => [
  { title: t('admin.hotelBilling.ytdTotalHours'), value: summary.value.totalHours.toFixed(2), icon: 'mdi-clock' },
  { title: t('admin.hotelBilling.ytdTotalAmount'), value: formatCurrency(summary.value.totalAmount), icon: 'mdi-currency-usd' },
  { title: t('admin.hotelBilling.avgWeeklyHours'), value: summary.value.avgWeeklyHours.toFixed(2), icon: 'mdi-chart-line' },
  { title: t('admin.hotelBilling.periodCount'), value: summary.value.periodCount, icon: 'mdi-calendar' }
]);

const monthlyHeaders = [
  { title: t('admin.hotelBilling.month'), key: 'month' },
  { title: t('admin.hotelBilling.totalHours'), key: 'totalHours', align: 'end' },
  { title: t('admin.hotelBilling.totalAmount'), key: 'totalAmount', align: 'end' },
  { title: t('admin.hotelBilling.weekCount'), key: 'weekCount', align: 'end' }
];

const weeklyHeaders = [
  { title: t('admin.hotelBilling.weekStart'), key: 'week_start', sortable: true },
  { title: t('admin.hotelBilling.weekEnd'), key: 'week_end' },
  { title: t('admin.hotelBilling.totalHours'), key: 'total_hours', align: 'end' },
  { title: t('admin.hotelBilling.totalAmount'), key: 'total_amount', align: 'end' },
  { title: t('admin.hotelBilling.status'), key: 'status' }
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