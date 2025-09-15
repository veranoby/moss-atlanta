<template>
  <div class="contact-page">
    <!-- Header similar to other sections in Home.vue -->
    <section class="section" :style="{ background: '#f5f5f5' }">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h4 text-md-h3 font-weight-bold mb-4" style="color: #1A1A1A;">
              {{ $t('contact.title') }}
            </h1>
            <p class="text-subtitle-1" style="color: #424242;">
              {{ $t('contact.subtitle') }}
            </p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Contact Information -->
    <v-container class="py-10">
      <v-row justify="center">
        <!-- Email Card -->
        <v-col cols="12" md="4" class="d-flex">
          <v-card variant="outlined" class="contact-card flex-grow-1">
            <v-card-item class="text-center">
              <v-icon size="x-large" color="primary" class="mb-2">mdi-email</v-icon>
              <v-card-title class="font-weight-bold">{{ $t('contact.email') }}</v-card-title>
            </v-card-item>
            <v-card-text class="text-center">
              <p class="mb-2">{{ $t('contact.emailDescription') }}</p>
              <a href="mailto:careers@mossatlanta.com" class="text-primary text-decoration-none text-h6">
                careers@mossatlanta.com
              </a>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Phone Card -->
        <v-col cols="12" md="4" class="d-flex">
          <v-card variant="outlined" class="contact-card flex-grow-1">
            <v-card-item class="text-center">
              <v-icon size="x-large" color="primary" class="mb-2">mdi-phone</v-icon>
              <v-card-title class="font-weight-bold">{{ $t('contact.phone') }}</v-card-title>
            </v-card-item>
            <v-card-text class="text-center">
              <p class="mb-2">{{ $t('contact.phoneDescription') }}</p>
              <a href="tel:+16787794753" class="text-primary text-decoration-none text-h6">
                +1 (678) 779-4753
              </a>
              <div class="mt-2">
                <v-btn
                  variant="text"
                  icon="mdi-whatsapp"
                  :href="'https://wa.me/16787794753'"
                  target="_blank"
                  color="success"
                  size="large"
                ></v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Office Card -->
        <v-col cols="12" md="4" class="d-flex">
          <v-card variant="outlined" class="contact-card flex-grow-1">
            <v-card-item class="text-center">
              <v-icon size="x-large" color="primary" class="mb-2">mdi-map-marker</v-icon>
              <v-card-title class="font-weight-bold">{{ $t('contact.office') }}</v-card-title>
            </v-card-item>
            <v-card-text class="text-center">
              <p>MOSS Atlanta Staffing Services</p>
              <p>Atlanta, GA</p>
              <p>Estados Unidos</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Business Hours -->
      <v-row justify="center" class="mt-10">
        <v-col cols="12" md="8">
          <v-card variant="outlined">
            <v-card-item class="text-center">
              <v-icon size="x-large" color="primary" class="mb-2">mdi-clock</v-icon>
              <v-card-title class="font-weight-bold">{{ $t('contact.hours') }}</v-card-title>
            </v-card-item>
            <v-card-text class="text-center">
              <p class="text-h6"><strong>{{ $t('contact.weekdays') }}:</strong> 9:00 AM - 6:00 PM (EST)</p>
              <p class="text-h6"><strong>{{ $t('contact.weekends') }}:</strong> {{ $t('contact.closed') }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
// This is a simple static page, so no complex logic is needed
</script>

<style scoped>
/* Add specific styles for this view to match Home.vue */
.contact-page {
  background-color: #ffffff;
}

.section {
  padding: 64px 0;
}

@media (min-width: 960px) {
  .section {
    padding: 96px 0;
  }
}

.contact-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>