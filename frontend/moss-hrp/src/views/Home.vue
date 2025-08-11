<template>
  <v-app>
     App Bar
    <v-app-bar color="white" flat density="comfortable" elevation="1">
      <v-container class="d-flex align-center">
        <div class="text-h6 font-weight-bold" style="color:#424242">
          MOSS Atlanta
        </div>
        <v-spacer />
         Navigation
        <div class="d-none d-md-flex align-center">
          <v-btn variant="text" color="grey-darken-2" :to="'/'" class="mx-1">{{ t.nav.home }}</v-btn>
          <v-btn variant="text" color="grey-darken-2" href="#services" class="mx-1">{{ t.nav.services }}</v-btn>
          <v-btn variant="text" color="grey-darken-2" href="#why" class="mx-1">{{ t.nav.why }}</v-btn>
          <v-btn variant="text" color="grey-darken-2" href="#contact" class="mx-1">{{ t.nav.contact }}</v-btn>
          <v-divider vertical class="mx-3" />
          <v-btn color="grey-darken-2" variant="outlined" :to="'/apply'" class="mx-1">
            {{ t.nav.apply }}
          </v-btn>
        </div>
        <v-spacer class="d-none d-md-flex" />
         Language Toggle
        <div class="d-flex align-center">
          <v-btn
            size="small"
            :variant="lang === 'en' ? 'flat' : 'text'"
            :color="lang === 'en' ? 'grey-darken-2' : undefined"
            class="mx-1"
            @click="setLang('en')"
          >EN</v-btn>
          <v-btn
            size="small"
            :variant="lang === 'es' ? 'flat' : 'text'"
            :color="lang === 'es' ? 'grey-darken-2' : undefined"
            class="mx-1"
            @click="setLang('es')"
          >ES</v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <v-main>
       Hero
      <section id="hero" class="hero-gradient">
        <v-container class="py-16">
          <v-row align="center" justify="center">
            <v-col cols="12" md="8" class="text-center">
              <v-fade-transition mode="out-in">
                <div :key="lang">
                  <h1 class="text-h4 text-md-h3 mb-4" style="color:#424242">
                    {{ t.hero.title }}
                  </h1>
                  <p class="text-body-1 mb-6" style="color:#424242">
                    {{ t.hero.subtitle }}
                  </p>
                  <div class="mb-6">
                    <v-chip color="amber-lighten-4" class="ma-1" text-color="black">
                      {{ t.hero.chip1 }}
                    </v-chip>
                    <v-chip color="amber-lighten-4" class="ma-1" text-color="black">
                      {{ t.hero.chip2 }}
                    </v-chip>
                  </div>
                  <div class="d-flex justify-center flex-wrap">
                    <v-btn
                      size="large"
                      color="amber-lighten-4"
                      class="ma-2"
                      style="color:#424242"
                      :to="'/apply'"
                    >
                      {{ t.cta.applyNow }}
                    </v-btn>
                    <v-btn
                      size="large"
                      variant="outlined"
                      color="grey-darken-2"
                      class="ma-2"
                      href="#contact"
                    >
                      {{ t.cta.partner }}
                    </v-btn>
                  </div>
                </div>
              </v-fade-transition>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <v-divider />

       Services
      <section id="services">
        <v-container class="py-12">
          <h2 class="text-h5 text-md-h4 mb-6" style="color:#424242">{{ t.sections.services }}</h2>
          <v-row>
            <v-col v-for="(svc, i) in services" :key="i" cols="12" md="6" lg="3" class="mb-4">
              <v-card hover :elevation="2" class="h-100">
                <v-card-text>
                  <div class="d-flex align-center mb-3">
                    <v-avatar size="40" color="grey-lighten-4" class="mr-3">
                      <v-icon :icon="svc.icon" color="grey-darken-2"></v-icon>
                    </v-avatar>
                    <div class="text-h6" style="color:#424242">{{ svc.title }}</div>
                  </div>
                  <v-card-subtitle class="mb-2" style="white-space: pre-line; color:#616161">
                    {{ svc.line1 }}
                  </v-card-subtitle>
                  <div class="text-body-2" style="color:#616161">{{ svc.line2 }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <v-divider />

       Why Choose MOSS
      <section id="why">
        <v-container class="py-12">
          <h2 class="text-h5 text-md-h4 mb-6" style="color:#424242">{{ t.sections.why }}</h2>
          <v-row>
            <v-col cols="12" md="6" class="mb-6">
              <v-list lines="two" density="comfortable" class="bg-white">
                <v-list-item v-for="(item, idx) in t.why.items" :key="idx">
                  <template #prepend>
                    <v-icon color="grey-darken-2" icon="mdi-check-circle-outline" />
                  </template>
                  <v-list-item-title class="font-weight-medium" style="color:#424242">
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle style="color:#616161">
                    {{ item.text }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6" class="mb-6">
              <v-card variant="tonal" color="grey-lighten-4" class="pa-4">
                <div class="d-flex flex-wrap">
                  <v-chip color="amber-lighten-4" class="ma-2" text-color="black">
                    {{ t.metrics.staff }}
                  </v-chip>
                  <v-chip color="amber-lighten-4" class="ma-2" text-color="black">
                    {{ t.metrics.hotels }}
                  </v-chip>
                  <v-chip color="grey-lighten-4" class="ma-2" text-color="black">
                    {{ t.metrics.specialties }}
                  </v-chip>
                  <v-chip color="grey-lighten-4" class="ma-2" text-color="black">
                    {{ t.metrics.coverage }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <v-divider />

       Call-to-Action
      <section id="cta">
        <v-container class="py-12">
          <v-row>
            <v-col cols="12" md="6" class="mb-6">
              <v-card hover :elevation="2" class="h-100">
                <v-card-text>
                  <h3 class="text-h6 text-md-h5 mb-2" style="color:#424242">{{ t.ctaCard.joinTitle }}</h3>
                  <p class="text-body-1 mb-4" style="color:#616161">{{ t.ctaCard.joinText }}</p>
                  <v-btn color="grey-darken-2" :to="'/apply'">{{ t.cta.applyNow }}</v-btn>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" class="mb-6">
              <v-card hover :elevation="2" class="h-100">
                <v-card-text>
                  <h3 class="text-h6 text-md-h5 mb-2" style="color:#424242">{{ t.ctaCard.partnerTitle }}</h3>
                  <p class="text-body-1 mb-4" style="color:#616161">{{ t.ctaCard.partnerText }}</p>
                  <v-btn variant="outlined" color="grey-darken-2" href="#contact">{{ t.cta.partner }}</v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>
    </v-main>

     Footer
    <v-footer id="contact" color="grey-lighten-4" class="pt-10 pb-6">
      <v-container>
        <v-row>
          <v-col cols="12" md="4" class="mb-6">
            <div class="text-h6 mb-2" style="color:#424242">MOSS Atlanta</div>
            <div class="text-body-2 mb-1" style="color:#616161">
              {{ t.footer.contact }}: (404) 555-0123
            </div>
            <div class="text-body-2" style="color:#616161">
              careers@mossatlanta.com
            </div>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <div class="text-subtitle-1 mb-2" style="color:#424242">{{ t.footer.company }}</div>
            <div class="d-flex flex-column">
              <v-btn variant="text" color="grey-darken-2" href="#services" class="px-0 justify-start">{{ t.nav.services }}</v-btn>
              <v-btn variant="text" color="grey-darken-2" href="#why" class="px-0 justify-start">{{ t.nav.why }}</v-btn>
              <v-btn variant="text" color="grey-darken-2" :to="'/apply'" class="px-0 justify-start">{{ t.nav.careers }}</v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <div class="text-subtitle-1 mb-2" style="color:#424242">{{ t.footer.legal }}</div>
            <div class="d-flex flex-column">
              <v-btn variant="text" color="grey-darken-2" class="px-0 justify-start">Privacy Policy</v-btn>
              <v-btn variant="text" color="grey-darken-2" class="px-0 justify-start">Terms of Service</v-btn>
            </div>
          </v-col>
        </v-row>
        <v-divider class="my-4" />
        <div class="d-flex align-center justify-space-between">
          <div class="text-caption" style="color:#616161">© {{ new Date().getFullYear() }} MOSS Atlanta Staffing Services</div>
          <div class="d-flex align-center">
            <span class="text-caption mr-2" style="color:#616161">{{ t.footer.language }}</span>
            <v-btn
              size="x-small"
              :variant="lang === 'en' ? 'flat' : 'text'"
              :color="lang === 'en' ? 'grey-darken-2' : undefined"
              class="mx-1"
              @click="setLang('en')"
            >EN</v-btn>
            <v-btn
              size="x-small"
              :variant="lang === 'es' ? 'flat' : 'text'"
              :color="lang === 'es' ? 'grey-darken-2' : undefined"
              class="mx-1"
              @click="setLang('es')"
            >ES</v-btn>
          </div>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Lang = 'en' | 'es'
const lang = ref<Lang>('en')
const setLang = (l: Lang) => (lang.value = l)

// Bilingual copy
const copy = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      why: 'Why MOSS',
      contact: 'Contact',
      apply: 'Apply Now',
      careers: 'Careers',
    },
    hero: {
      title: 'Professional Hotel Staffing Solutions in Atlanta',
      subtitle: '400+ trained professionals serving premium hotels across the metro area',
      chip1: 'Housekeeping Specialists',
      chip2: '20+ Hotels Served',
    },
    services: {
      housekeeping: {
        title: 'Housekeeping Services',
        line1: 'Room attendants, housemen, supervisors',
        line2: 'Our largest service area with trained professionals',
        icon: 'mdi-broom',
      },
      fnb: {
        title: 'Food & Beverage',
        line1: 'Servers, cooks, dishwashers, bartenders',
        line2: 'Restaurant and banquet specialists',
        icon: 'mdi-silverware-fork-knife',
      },
      frontdesk: {
        title: 'Front Desk Support',
        line1: 'Receptionists, concierge, bell staff',
        line2: 'Guest-facing professionals',
        icon: 'mdi-account-tie',
      },
      events: {
        title: 'Event Staffing',
        line1: 'Temporary and emergency coverage',
        line2: 'Flexible solutions for peak demands',
        icon: 'mdi-calendar-clock',
      },
    },
    sections: {
      services: 'Our Services',
      why: 'Why Choose MOSS',
    },
    why: {
      items: [
        { title: 'Reliable', text: 'Proven track record with major hotel chains' },
        { title: 'Trained', text: 'All staff undergo hotel-specific training' },
        { title: 'Flexible', text: '24/7 coverage and emergency response' },
        { title: 'Local', text: 'Deep knowledge of Atlanta hospitality market' },
      ],
    },
    metrics: {
      staff: '400+ trained staff',
      hotels: '20+ premium hotels served',
      specialties: 'Housekeeping • F&B • Front Desk • Events',
      coverage: 'Metro Atlanta coverage',
    },
    cta: {
      applyNow: 'Apply Now',
      partner: 'Partner With Us',
    },
    ctaCard: {
      joinTitle: 'Ready to Join Our Team?',
      joinText: 'Apply today and start your hospitality career with MOSS.',
      partnerTitle: 'Looking for Staffing Solutions?',
      partnerText: 'Partner with us for reliable hotel staffing.',
    },
    footer: {
      contact: 'Contact',
      company: 'Company',
      legal: 'Legal',
      language: 'Language',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      services: 'Servicios',
      why: '¿Por qué MOSS?',
      contact: 'Contacto',
      apply: 'Postular',
      careers: 'Empleos',
    },
    hero: {
      title: 'Soluciones Profesionales de Personal Hotelero en Atlanta',
      subtitle: 'Más de 400 profesionales capacitados que atienden hoteles premium en el área metropolitana',
      chip1: 'Especialistas en Housekeeping',
      chip2: '20+ Hoteles Atendidos',
    },
    services: {
      housekeeping: {
        title: 'Servicios de Housekeeping',
        line1: 'Camaristas, housemen, supervisores',
        line2: 'Nuestra mayor área con personal capacitado',
        icon: 'mdi-broom',
      },
      fnb: {
        title: 'Alimentos y Bebidas',
        line1: 'Meseros, cocineros, lavalozas, bartenders',
        line2: 'Especialistas en restaurante y banquetes',
        icon: 'mdi-silverware-fork-knife',
      },
      frontdesk: {
        title: 'Soporte de Recepción',
        line1: 'Recepcionistas, concierge, botones',
        line2: 'Profesionales de atención al huésped',
        icon: 'mdi-account-tie',
      },
      events: {
        title: 'Personal para Eventos',
        line1: 'Cobertura temporal y de emergencia',
        line2: 'Soluciones flexibles para picos de demanda',
        icon: 'mdi-calendar-clock',
      },
    },
    sections: {
      services: 'Nuestros Servicios',
      why: 'Por qué elegir MOSS',
    },
    why: {
      items: [
        { title: 'Confiable', text: 'Historial comprobado con cadenas hoteleras importantes' },
        { title: 'Capacitado', text: 'Todo el personal recibe formación específica hotelera' },
        { title: 'Flexible', text: 'Cobertura 24/7 y respuesta a emergencias' },
        { title: 'Local', text: 'Amplio conocimiento del mercado hotelero de Atlanta' },
      ],
    },
    metrics: {
      staff: '400+ colaboradores capacitados',
      hotels: '20+ hoteles premium atendidos',
      specialties: 'Housekeeping • A&B • Recepción • Eventos',
      coverage: 'Cobertura en Metro Atlanta',
    },
    cta: {
      applyNow: 'Postular Ahora',
      partner: 'Asóciate con Nosotros',
    },
    ctaCard: {
      joinTitle: '¿Listo para Unirte a Nuestro Equipo?',
      joinText: 'Postula hoy y comienza tu carrera en hospitalidad con MOSS.',
      partnerTitle: '¿Buscas Soluciones de Personal?',
      partnerText: 'Asóciate con nosotros para personal hotelero confiable.',
    },
    footer: {
      contact: 'Contacto',
      company: 'Empresa',
      legal: 'Legal',
      language: 'Idioma',
    },
  },
} as const

const t = computed(() => copy[lang.value])

const services = computed(() => {
  const s = t.value.services
  return [
    { title: s.housekeeping.title, line1: s.housekeeping.line1, line2: s.housekeeping.line2, icon: s.housekeeping.icon },
    { title: s.fnb.title,         line1: s.fnb.line1,         line2: s.fnb.line2,         icon: s.fnb.icon },
    { title: s.frontdesk.title,   line1: s.frontdesk.line1,   line2: s.frontdesk.line2,   icon: s.frontdesk.icon },
    { title: s.events.title,      line1: s.events.line1,      line2: s.events.line2,      icon: s.events.icon },
  ]
})
</script>

<style scoped>
.hero-gradient {
  /* Subtle corporate gradient using specified palette */
  background: linear-gradient(180deg, #F5F5F5 0%, #FFFFFF 100%);
}
</style>
