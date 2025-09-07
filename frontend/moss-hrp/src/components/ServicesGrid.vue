<template>
  <section id="services" class="section" style="background:#FFFFFF;">
    <v-container>
      <div class="text-center mb-10">
        <h2 class="text-h4 text-md-h3 font-weight-bold" style="color:#424242;">
          {{ $t('services.title') }}
        </h2>
      </div>

      <v-row  align="stretch">
        <v-col
          cols="12"
          sm="6"
          md="4"
          lg="3"
          v-for="(service, index) in services"
          :key="index"
        >
          <v-card
            variant="outlined"
            class="rounded-xl hover-scale"
            :elevation="0"
          >
            <v-card-text>
              <div
                class="w-12 h-12 rounded-lg d-flex align-center justify-center mb-4"
                style="background:#FFF9C4;"
              >
                <v-icon color="black" size="28">{{ service.icon }}</v-icon>
              </div>
              <h3 class="text-h6 font-weight-semibold" style="color:#424242;">
                {{ service.title }}
              </h3>
              <p class="mt-2" style="color:#757575;">{{ service.description }}</p>
              <p class="text-body-2 mt-1" style="color:#8D6E63;">{{ service.subtitle }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ✅ Computed services data
const services = computed(() => [
  {
    icon: 'mdi-broom',
    title: t('services.housekeeping.title'),
    description: t('services.housekeeping.description'),
    subtitle: t('services.housekeeping.subtitle')
  },
  {
    icon: 'mdi-silverware-fork-knife',
    title: t('services.fnb.title'),
    description: t('services.fnb.description'),
    subtitle: t('services.fnb.subtitle')
  },
  {
    icon: 'mdi-account-tie',
    title: t('services.frontdesk.title'),
    description: t('services.frontdesk.description'),
    subtitle: t('services.frontdesk.subtitle')
  },
  {
    icon: 'mdi-calendar-clock',
    title: t('services.events.title'),
    description: t('services.events.description'),
    subtitle: t('services.events.subtitle')
  }
])
</script>

<style scoped>
.section {
  padding: 64px 0;
}

@media (min-width: 960px) {
  .section {
    padding: 64px 0;
  }
}

.hover-scale {
  transition: transform .2s ease, box-shadow .2s ease;
}

.hover-scale:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}
</style>
