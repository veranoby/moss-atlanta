<template>
  <!-- Header -->
  <v-app-bar elevation="0" color="surface" class="border-b">
    <v-container>
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div class="text-h5 font-weight-bold" style="color:#424242">MOSS</div>
          <div class="ms-2 text-body-2" style="color:#757575">Atlanta Staffing Services</div>
        </div>

        <div class="d-none d-md-flex align-center" style="gap: 24px;">
          <a href="#services" class="text-body-2 nav-link">{{ $t('nav.services') }}</a>
          <a href="#about" class="text-body-2 nav-link">{{ $t('nav.about') }}</a>
          <a href="#contact" class="text-body-2 nav-link">{{ $t('nav.contact') }}</a>
        </div>

        <div class="d-flex align-center" style="gap: 12px;">
          <LanguageSwitch />
          <v-btn
            color="accent"
            class="text-black"
            rounded="lg"
            elevation="1"
            @click="scrollToSection('apply')"
          >
            {{ $t('nav.apply') }}
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-app-bar>

  <v-main>
    <!-- ✅ Lazy loaded components with Suspense -->
    <Suspense>
      <template #default>
        <div>
          <HeroSection />
          <ServicesGrid />
          <AboutSection />
          <CallToAction />
        </div>
      </template>
      <template #fallback>
        <div class="d-flex justify-center align-center" style="height: 400px;">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
        </div>
      </template>
    </Suspense>

    <!-- Footer -->
    <footer id="contact" style="background:#424242; color:#FFFFFF;">
      <v-container class="py-10">
        <v-row class="ga-6">
          <v-col cols="12" md="4">
            <div class="text-h6 font-weight-bold mb-2">MOSS</div>
            <div class="mb-2" style="color:#E0E0E0;">Atlanta Staffing Services</div>
            <div style="color:#E0E0E0;">Professional hotel staffing solutions for the Atlanta metro area.</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="text-subtitle-1 font-weight-semibold mb-3">{{ $t('footer.contact.title') }}</div>
            <div style="color:#E0E0E0;">{{ $t('footer.contact.phone') }}</div>
            <div style="color:#E0E0E0;">{{ $t('footer.contact.email') }}</div>
            <div style="color:#E0E0E0;">{{ $t('footer.contact.location') }}</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="text-subtitle-1 font-weight-semibold mb-3">{{ $t('footer.legal.title') }}</div>
            <div class="d-flex flex-column">
              <a href="#" class="footer-link">{{ $t('footer.legal.privacy') }}</a>
              <a href="#" class="footer-link">{{ $t('footer.legal.terms') }}</a>
            </div>
          </v-col>
        </v-row>

        <div class="text-center mt-8" style="color:#E0E0E0; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 16px;">
          © 2024 MOSS Atlanta Staffing Services. {{ $t('footer.rights') }}
        </div>
      </v-container>
    </footer>
  </v-main>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'

// ✅ Lazy load components with loading and error handling
const HeroSection = defineAsyncComponent({
  loader: () => import('@/components/HeroSection.vue'),
  loadingComponent: {
    template: `
      <div class="d-flex justify-center align-center" style="height: 400px;">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>
    `
  },
  errorComponent: {
    template: `
      <div class="d-flex justify-center align-center" style="height: 400px;">
        <v-alert type="error" text="Error loading Hero Section" />
      </div>
    `
  },
  delay: 200,
  timeout: 3000
})

const ServicesGrid = defineAsyncComponent({
  loader: () => import('@/components/ServicesGrid.vue'),
  loadingComponent: {
    template: `
      <div class="d-flex justify-center align-center" style="height: 300px;">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>
    `
  },
  delay: 200,
  timeout: 3000
})

const AboutSection = defineAsyncComponent({
  loader: () => import('@/components/AboutSection.vue'),
  loadingComponent: {
    template: `
      <div class="d-flex justify-center align-center" style="height: 300px;">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>
    `
  },
  delay: 200,
  timeout: 3000
})

const CallToAction = defineAsyncComponent({
  loader: () => import('@/components/CallToAction.vue'),
  loadingComponent: {
    template: `
      <div class="d-flex justify-center align-center" style="height: 200px;">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>
    `
  },
  delay: 200,
  timeout: 3000
})

const LanguageSwitch = defineAsyncComponent({
  loader: () => import('@/components/LanguageSwitch.vue'),
  delay: 100,
  timeout: 2000
})

// ✅ TypeScript types
type Locale = 'en' | 'es'

// ✅ Vue 3 Composition API
const { locale } = useI18n()

// ✅ Reactive state
const currentLang = ref<Locale>('en')

// ✅ Provide current language to child components
provide('currentLang', currentLang)

// ✅ Methods
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// ✅ Lifecycle hooks
onMounted(() => {
  // ✅ Initialize locale from localStorage
  const savedLocale = localStorage.getItem('app-locale') as Locale
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
    currentLang.value = savedLocale
    locale.value = savedLocale
  } else {
    currentLang.value = 'en'
    locale.value = 'en'
  }
})
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.nav-link {
  color:#424242;
  text-decoration:none;
  transition: color .2s ease;
}

.nav-link:hover {
  color:#1a1a1a;
}

.footer-link {
  color:#E0E0E0;
  text-decoration:none;
  margin: 6px 0;
  transition: color .2s ease;
}

.footer-link:hover {
  color:#FFFFFF;
}
</style>
