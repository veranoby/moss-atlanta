<template>
  <DataTable
    :headers="headers"
    :items="payrollPeriods"
    :loading="loading"
    :total-items="totalItems"
    @update:options="handleOptionsUpdate"
  >
    <template #[`item.hotel`]="{ item }">
      {{ item.expand?.hotel?.name || 'N/A' }}
    </template>
    <template #[`item.start_date`]="{ item }">
      {{ new Date(item.start_date).toLocaleDateString() }}
    </template>
    <template #[`item.end_date`]="{ item }">
      {{ new Date(item.end_date).toLocaleDateString() }}
    </template>
    <template #[`item.status`]="{ item }">
      <v-chip :color="statusColor(item.expand?.reconciliation_status?.name)" size="small">
        {{ item.expand?.reconciliation_status?.name || 'Unknown' }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-btn size="small" @click="$emit('open', item.id)">
        Reconcile
      </v-btn>
    </template>
  </DataTable>
</template>

<script setup>
import { ref, watch } from 'vue';
import DataTable from '@/components/DataTable.vue';
// Note: This component is currently not using the useReconciliation composable
// to allow for more direct control over the data fetching options.
// This could be refactored to use the composable later.
import { pb } from '@/composables/usePocketbase.js';

const props = defineProps({
  filters: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['open']);

const payrollPeriods = ref([]);
const loading = ref(true);
const totalItems = ref(0);

const headers = [
  { title: 'Hotel', key: 'hotel', sortable: false },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const statusColor = (status) => {
  const colors = {
    'pending': 'blue',
    'in_progress': 'orange',
    'completed': 'success',
    'error': 'error',
  };
  return colors[status] || 'grey';
};

async function fetchData(options) {
  loading.value = true;
  const { page, itemsPerPage, sortBy } = options;
  try {
    const filterParts = Object.entries(props.filters)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}="${value}"`);

    const pbFilter = filterParts.join(' && ');
    const sortOption = sortBy && sortBy.length ? `${sortBy[0].order === 'desc' ? '-' : '+'}${sortBy[0].key}` : '-start_date';

    const result = await pb.collection('payroll_periods').getList(page, itemsPerPage, {
      filter: pbFilter,
      sort: sortOption,
      expand: 'hotel,reconciliation_status',
    });

    payrollPeriods.value = result.items;
    totalItems.value = result.totalItems;
  } catch (error) {
    console.error("Failed to fetch payroll periods:", error);
    payrollPeriods.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
}

function handleOptionsUpdate(options) {
  fetchData(options);
}

// When filters change, refetch data with the first page
watch(() => props.filters, () => {
  fetchData({ page: 1, itemsPerPage: 10, sortBy: [{ key: 'start_date', order: 'desc'}] });
}, { deep: true });
</script>
