<template>
  <div class="open-positions-page">
    <!-- Header Section -->
    <section class="section" :style="{ background: '#f5f5f5' }">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h4 text-md-h3 font-weight-bold mb-4" style="color: #1A1A1A;">
              {{ $t('openPositions.title') }}
            </h1>
            <p class="text-subtitle-1" style="color: #424242;">
              {{ $t('openPositions.subtitle') }}
            </p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Main Content -->
    <v-container class="py-10">

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <v-alert v-if="error" type="error" class="mb-4" :text="error.message"></v-alert>

    <v-row v-if="!loading && openPositions.length > 0">
      <v-col
        v-for="position in openPositions"
        :key="position.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="d-flex flex-column h-100" variant="outlined">
          <v-card-item>
            <v-card-title class="text-wrap">{{ position.position_name }}</v-card-title>
            <v-card-subtitle>{{ position.area }}</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <div class="mb-2"><strong>{{ $t('openPositions.department') }}:</strong> {{ position.department_name }}</div>
            <div class="mb-2"><strong>{{ $t('openPositions.salary') }}:</strong> ${{ position.salary_min }} - ${{ position.salary_max }}</div>
            <div><strong>{{ $t('openPositions.type') }}:</strong> {{ position.posting_type === 'formal_corporate' ? $t('openPositions.formal') : $t('openPositions.informal') }}</div>
          </v-card-text>

          <v-spacer></v-spacer>

          <v-card-actions>
            <v-btn
              color="primary"
              variant="outlined"
              block
              @click="applyForPosition(position)"
            >
              {{ $t('openPositions.applyNow') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

      <v-alert v-if="!loading && openPositions.length === 0" type="info" class="mt-4">
        {{ $t('openPositions.noPositions') }}
      </v-alert>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { pb } from '@/composables/usePocketbase';

const router = useRouter();
const openPositions = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchOpenPositions = async () => {
  loading.value = true;
  error.value = null;
  try {
    const records = await pb.collection('open_positions').getFullList({
      sort: '-created',
      expand: 'department,position',
      filter: 'status = "open"', // Only show open positions
    });
    openPositions.value = records.map(record => ({
      ...record,
      department_name: record.expand?.department?.name || 'N/A',
      position_name: record.expand?.position?.name || 'N/A',
    }));
  } catch (e) {
    error.value = e;
    console.error('MOSS HRP Error: Failed to fetch open positions:', e);
  } finally {
    loading.value = false;
  }
};

const applyForPosition = (position) => {
  // For now, we'll just scroll to the apply section on the home page
  // In a more complex implementation, this could open a modal or navigate to an application form
  router.push({ name: 'Home', hash: '#apply' });
};

onMounted(() => {
  fetchOpenPositions();
});
</script>

<style scoped>
.section {
  padding: 64px 0;
}

@media (min-width: 960px) {
  .section {
    padding: 96px 0;
  }
}
</style>