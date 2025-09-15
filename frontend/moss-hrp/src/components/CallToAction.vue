<template>
  <section id="apply" class="section bg-primary-lighten-1">
    <v-container>
      <v-row  align="center" justify="space-between">
        <v-col cols="12" sm="6" md="6">
          <h3 class="text-h5 text-md-h4 font-weight-bold" style="color:#1A1A1A;">
            {{ $t('cta.employee.title') }}
          </h3>
          <v-btn
            :to="{ name: 'OpenPositions' }"
            color="white"
            class="text-black mt-4 px-8 "
            rounded="lg"
            size="large"
            elevation="2"
          >
            {{ $t('cta.employee.button') }}
          </v-btn>
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <h3 class="text-h5 text-md-h4 font-weight-bold" style="color:#1A1A1A;">
            {{ $t('cta.employer.title') }}
          </h3>
          <v-btn
            :to="{ name: 'Contact' }"
            color="white"
            class="text-black mt-4 px-8 "
            rounded="lg"
            size="large"
            elevation="2"
          >
            {{ $t('cta.employer.button') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
// No methods needed as we're using router-links now
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
