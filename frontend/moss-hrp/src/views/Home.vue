<template>
  <v-app>
    <div class="min-h-screen bg-white text-[#424242]">
      <!-- Header -->
      <header class="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
        <v-container class="py-0">
          <div class="flex items-center justify-between h-16">
            <a class="flex items-center gap-2" href="#">
              <div
                aria-hidden="true"
                class="h-8 w-8 rounded-sm"
                style="background-color:#FFF9C4;"
              />
              <span class="text-sm sm:text-base font-semibold tracking-wide">
                MOSS Atlanta Staffing Services
              </span>
            </a>

            <nav class="hidden sm:flex items-center gap-6 text-sm">
              <a class="hover:text-black transition" href="#services">
                {{ $t('nav.services') }}
              </a>
              <a class="hover:text-black transition" href="#why">
                {{ $t('nav.why') }}
              </a>
              <a class="hover:text-black transition" href="#contact">
                {{ $t('nav.contact') }}
              </a>
            </nav>

            <div class="flex items-center gap-2">
              <div class="text-xs sm:text-sm flex items-center rounded-md border border-gray-200">
                <v-btn
                  aria-label="English"
                  class="px-2 py-1 min-h-0 h-auto"
                  :class="isEN ? 'font-semibold text-gray-900' : 'text-gray-500'"
                  density="comfortable"
                  variant="text"
                  @click="setLocale('en')"
                >
                  EN
                </v-btn>
                <span class="text-gray-300 select-none">|</span>
                <v-btn
                  aria-label="Español"
                  class="px-2 py-1 min-h-0 h-auto"
                  :class="isES ? 'font-semibold text-gray-900' : 'text-gray-500'"
                  density="comfortable"
                  variant="text"
                  @click="setLocale('es')"
                >
                  ES
                </v-btn>
              </div>
              <v-btn
                class="hidden sm:inline-flex border border-gray-300 hover:bg-[#F5F5F5] transition"
                :href="'#apply'"
                variant="text"
              >
                {{ $t('nav.apply') }}
              </v-btn>
            </div>
          </div>
        </v-container>
      </header>

      <!-- Main Content -->
      <transition mode="out-in" name="fade">
        <main :key="currentLocale">
          <!-- Hero Section -->
          <section class="bg-[#F5F5F5]">
            <v-container>
              <v-row
                :class="'py-14 sm:py-20'"
                align="center"
                class="items-center"
              >
                <v-col cols="12" lg="6">
                  <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-black">
                    {{ $t('hero.headline') }}
                  </h1>
                  <p class="mt-4 text-base sm:text-lg">
                    {{ $t('hero.subtitle') }}
                  </p>
                  <div class="mt-8 flex flex-col sm:flex-row gap-3">
                    <v-btn
                      class="font-semibold text-[#424242] border border-yellow-100 hover:shadow transition"
                      :href="'#apply'"
                      size="large"
                      style="background-color:#FFF9C4;"
                    >
                      {{ $t('hero.applyNow') }}
                    </v-btn>
                    <v-btn
                      class="font-semibold border border-gray-300 hover:bg-white hover:shadow-sm transition"
                      :href="'#contact'"
                      size="large"
                      variant="text"
                    >
                      {{ $t('hero.partner') }}
                    </v-btn>
                  </div>
                </v-col>

                <v-col cols="12" lg="6">
                  <v-card class="overflow-hidden border border-gray-200 bg-white">
                    <div class="aspect-[16/10] w-full bg-gradient-to-br from-[#F5F5F5] to-white flex items-center justify-center">
                      <div class="text-center px-6">
                        <div class="mx-auto mb-3 h-10 w-10 rounded-md" style="background-color:#FFF9C4;" />
                        <p class="text-sm text-gray-500">
                          {{ $t('hero.imageCaption') }}
                        </p>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </section>

          <!-- Services Section -->
          <section id="services" class="py-16 sm:py-20">
            <v-container>
              <header class="mb-10">
                <h2 class="text-2xl sm:text-3xl font-bold text-black">
                  {{ $t('services.title') }}
                </h2>
                <p class="mt-2 text-gray-600">
                  {{ $t('services.subtitle') }}
                </p>
              </header>

              <v-row class="gap-0" dense>
                <v-col class="mb-6" cols="12" lg="3" sm="6">
                  <v-card
                    class="h-full rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm transition"
                    elevation="0"
                  >
                    <h3 class="text-lg font-semibold text-black">
                      {{ $t('services.items.housekeeping.title') }}
                    </h3>
                    <p class="mt-2 text-sm text-gray-600">
                      {{ $t('services.items.housekeeping.roles') }}
                    </p>
                    <p class="mt-4 text-sm italic text-gray-700">
                      "{{ $t('services.items.housekeeping.note') }}"
                    </p>
                  </v-card>
                </v-col>

                <v-col class="mb-6" cols="12" lg="3" sm="6">
                  <v-card
                    class="h-full rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm transition"
                    elevation="0"
                  >
                    <h3 class="text-lg font-semibold text-black">
                      {{ $t('services.items.fnb.title') }}
                    </h3>
                    <p class="mt-2 text-sm text-gray-600">
                      {{ $t('services.items.fnb.roles') }}
                    </p>
                    <p class="mt-4 text-sm italic text-gray-700">
                      "{{ $t('services.items.fnb.note') }}"
                    </p>
                  </v-card>
                </v-col>

                <v-col class="mb-6" cols="12" lg="3" sm="6">
                  <v-card
                    class="h-full rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm transition"
                    elevation="0"
                  >
                    <h3 class="text-lg font-semibold text-black">
                      {{ $t('services.items.frontdesk.title') }}
                    </h3>
                    <p class="mt-2 text-sm text-gray-600">
                      {{ $t('services.items.frontdesk.roles') }}
                    </p>
                    <p class="mt-4 text-sm italic text-gray-700">
                      "{{ $t('services.items.frontdesk.note') }}"
                    </p>
                  </v-card>
                </v-col>

                <v-col class="mb-6" cols="12" lg="3" sm="6">
                  <v-card
                    class="h-full rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm transition"
                    elevation="0"
                  >
                    <h3 class="text-lg font-semibold text-black">
                      {{ $t('services.items.events.title') }}
                    </h3>
                    <p class="mt-2 text-sm text-gray-600">
                      {{ $t('services.items.events.roles') }}
                    </p>
                    <p class="mt-4 text-sm italic text-gray-700">
                      "{{ $t('services.items.events.note') }}"
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </section>

          <!-- Why Choose MOSS Section -->
          <section id="why" class="bg-[#F5F5F5] py-16 sm:py-20">
            <v-container>
              <header class="mb-10">
                <h2 class="text-2xl sm:text-3xl font-bold text-black">
                  {{ $t('why.title') }}
                </h2>
              </header>

              <v-row dense>
                <v-col class="mb-6" cols="12" md="6">
                  <v-card
                    class="rounded-lg border border-gray-200 bg-white p-6"
                    elevation="0"
                  >
                    <h3 class="font-semibold text-black">
                      {{ $t('why.items.reliable.title') }}
                    </h3>
                    <p class="mt-2 text-gray-700">
                      {{ $t('why.items.reliable.desc') }}
                    </p>
                  </v-card>
                </v-col>
                <v-col class="mb-6" cols="12" md="6">
                  <v-card
                    class="rounded-lg border border-gray-200 bg-white p-6"
                    elevation="0"
                  >
                    <h3 class="font-semibold text-black">
                      {{ $t('why.items.trained.title') }}
                    </h3>
                    <p class="mt-2 text-gray-700">
                      {{ $t('why.items.trained.desc') }}
                    </p>
                  </v-card>
                </v-col>
                <v-col class="mb-6" cols="12" md="6">
                  <v-card
                    class="rounded-lg border border-gray-200 bg-white p-6"
                    elevation="0"
                  >
                    <h3 class="font-semibold text-black">
                      {{ $t('why.items.flexible.title') }}
                    </h3>
                    <p class="mt-2 text-gray-700">
                      {{ $t('why.items.flexible.desc') }}
                    </p>
                  </v-card>
                </v-col>
                <v-col class="mb-6" cols="12" md="6">
                  <v-card
                    class="rounded-lg border border-gray-200 bg-white p-6"
                    elevation="0"
                  >
                    <h3 class="font-semibold text-black">
                      {{ $t('why.items.local.title') }}
                    </h3>
                    <p class="mt-2 text-gray-700">
                      {{ $t('why.items.local.desc') }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </section>

          <!-- Apply Section -->
          <section id="apply" class="py-16 sm:py-20">
            <v-container>
              <v-row dense>
                <v-col class="mb-6" cols="12" md="6">
                  <v-card
                    class="rounded-lg border border-gray-200 bg-white p-8"
                    elevation="0"
                  >
                    <h3 class="text-xl sm:text-2xl font-bold text-black">
                      {{ $t('cta.joinTitle') }}
                    </h3>
                    <p class="mt-2 text-gray-700">
                      {{ $t('cta.joinDesc') }}
                    </p>
                    <v-btn
                      class="mt-6 font-semibold text-[#424242] border border-yellow-100 hover:shadow transition"
                      :href="'#contact'"
                      size="large"
                      style="background-color:#FFF9C4;"
                    >
                      {{ $t('cta.applyToday') }}
                    </v-btn>
                  </v-card>
                </v-col>

                <v-col class="mb-6" cols="12" md="6">
                  <v-card
                    class="rounded-lg border border-gray-200 bg-white p-8"
                    elevation="0"
                  >
                    <h3 class="text-xl sm:text-2xl font-bold text-black">
                      {{ $t('cta.staffingTitle') }}
                    </h3>
                    <p class="mt-2 text-gray-700">
                      {{ $t('cta.staffingDesc') }}
                    </p>
                    <v-btn
                      class="mt-6 font-semibold border border-gray-300 hover:bg-[#F5F5F5] transition"
                      :href="'#contact'"
                      size="large"
                      variant="text"
                    >
                      {{ $t('cta.contactUs') }}
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </section>

          <!-- Footer -->
          <footer id="contact" class="border-t border-gray-200 bg-white">
            <v-container class="py-12">
              <v-row>
                <v-col class="mb-8" cols="12" lg="3" sm="6">
                  <h4 class="font-semibold text-black">
                    {{ $t('footer.contact.title') }}
                  </h4>
                  <ul class="mt-3 space-y-1 text-sm">
                    <li>
                      <a class="hover:text-black transition" href="tel:+1404XXXXXXX">
                        (404) XXX-XXXX
                      </a>
                    </li>
                    <li>
                      <a class="hover:text-black transition" href="mailto:careers@mossatlanta.com">
                        careers@mossatlanta.com
                      </a>
                    </li>
                    <li>Atlanta, GA</li>
                  </ul>
                </v-col>
                <v-col class="mb-8" cols="12" lg="3" sm="6">
                  <h4 class="font-semibold text-black">
                    {{ $t('footer.company.title') }}
                  </h4>
                  <ul class="mt-3 space-y-1 text-sm">
                    <li>
                      <a class="hover:text-black transition" href="#services">
                        {{ $t('nav.services') }}
                      </a>
                    </li>
                    <li>
                      <a class="hover:text-black transition" href="#why">
                        {{ $t('nav.why') }}
                      </a>
                    </li>
                    <li>
                      <a class="hover:text-black transition" href="#apply">
                        {{ $t('footer.company.careers') }}
                      </a>
                    </li>
                  </ul>
                </v-col>
                <v-col class="mb-8" cols="12" lg="3" sm="6">
                  <h4 class="font-semibold text-black">
                    {{ $t('footer.legal.title') }}
                  </h4>
                  <ul class="mt-3 space-y-1 text-sm">
                    <li>
                      <a class="hover:text-black transition" href="#">
                        {{ $t('footer.legal.privacy') }}
                      </a>
                    </li>
                    <li>
                      <a class="hover:text-black transition" href="#">
                        {{ $t('footer.legal.terms') }}
                      </a>
                    </li>
                  </ul>
                </v-col>
                <v-col class="mb-8" cols="12" lg="3" sm="6">
                  <h4 class="font-semibold text-black">
                    {{ $t('footer.languages.title') }}
                  </h4>
                  <div class="mt-3 text-sm">
                    <v-btn
                      class="min-h-0 h-auto px-2 py-1"
                      :class="isEN ? 'font-semibold text-gray-900' : 'text-gray-500'"
                      density="comfortable"
                      variant="text"
                      @click="setLocale('en')"
                    >
                      English
                    </v-btn>
                    <span class="mx-1 text-gray-300 select-none">|</span>
                    <v-btn
                      class="min-h-0 h-auto px-2 py-1"
                      :class="isES ? 'font-semibold text-gray-900' : 'text-gray-500'"
                      density="comfortable"
                      variant="text"
                      @click="setLocale('es')"
                    >
                      Español
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
              <p class="mt-4 text-xs text-gray-500">
                &copy; {{ year }} MOSS Atlanta Staffing Services. {{ $t('footer.rights') }}
              </p>
            </v-container>
          </footer>
        </main>
      </transition>
    </div>
  </v-app>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  // ✅ TypeScript types
  type Locale = 'en' | 'es'

  // ✅ Vue 3 Composition API with proper imports
  const { locale, t } = useI18n()

  // ✅ Reactive state
  const currentLocale = ref<Locale>('en')
  const year = ref(new Date().getFullYear())

  // ✅ Computed properties
  const isEN = computed(() => currentLocale.value === 'en')
  const isES = computed(() => currentLocale.value === 'es')

  // ✅ Methods
  const setLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale
    locale.value = newLocale

    // ✅ Persist to localStorage
    try {
      localStorage.setItem('app-locale', newLocale)
    } catch (error) {
      console.error('Error saving locale to localStorage:', error)
    }
  }

  // ✅ Lifecycle hooks
  onMounted(() => {
    // ✅ Initialize locale from localStorage or default
    const savedLocale = localStorage.getItem('app-locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
      setLocale(savedLocale)
    } else {
      setLocale('en')
    }
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 300ms ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
