<template>
  <section id="about" class="section" style="background:#F5F5F5;">
    <v-container>
      <div class="text-center mb-10">
        <h2 class="text-h4 text-md-h3 font-weight-bold" style="color:#424242;">
          {{ $t('about.title') }}
        </h2>
      </div>

      <v-row align="stretch">
        <v-col
          cols="12"
          sm="6"
          md="4"
          lg="3"
          v-for="(benefit, index) in benefits"
          :key="index"
        >
          <div class="text-center h-100 d-flex flex-column justify-space-between">
            <div
              class="w-16 h-16 rounded-circle d-flex align-center justify-center mx-auto mb-4"
              style="background:#FFF9C4;"
            >
              <v-icon color="black" size="34">{{ benefit.icon }}</v-icon>
            </div>
            <h3 class="text-h6 font-weight-semibold" style="color:#424242;">
              {{ benefit.title }}
            </h3>
            <p class="mt-2" style="color:#757575;">{{ benefit.description }}</p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ✅ Computed benefits data
const benefits = computed(() => [
  {
    icon: 'mdi-check-circle',
    title: t('about.reliable.title'),
    description: t('about.reliable.description')
  },
  {
    icon: 'mdi-school',
    title: t('about.trained.title'),
    description: t('about.trained.description')
  },
  {
    icon: 'mdi-clock-time-four',
    title: t('about.flexible.title'),
    description: t('about.flexible.description')
  },
  {
    icon: 'mdi-map-marker-radius',
    title: t('about.local.title'),
    description: t('about.local.description')
  }
])
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
