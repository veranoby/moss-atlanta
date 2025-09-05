<template>
  <section id="apply" class="section" :style="{ background: '#FFF9C4' }">
    <v-container>
      <v-row  align="center" justify="space-between">
        <v-col cols="12" sm="6" md="6">
          <h3 class="text-h5 text-md-h4 font-weight-bold" style="color:#1A1A1A;">
            {{ $t('cta.employee.title') }}
          </h3>
          <v-btn
            color="white"
            class="text-black mt-4 px-8 "
            rounded="lg"
            size="large"
            elevation="2"
            @click="scrollToSection('contact')"
          >
            {{ $t('cta.employee.button') }}
          </v-btn>
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <h3 class="text-h5 text-md-h4 font-weight-bold" style="color:#1A1A1A;">
            {{ $t('cta.employer.title') }}
          </h3>
          <v-btn
            color="white"
            class="text-black mt-4 px-8 "
            rounded="lg"
            size="large"
            elevation="2"
            @click="scrollToSection('contact')"
          >
            {{ $t('cta.employer.button') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
// ✅ Methods
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
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
