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
          <a href="#services" class="text-body-2 nav-link">Services</a>
          <a href="#about" class="text-body-2 nav-link">About</a>
          <a href="#contact" class="text-body-2 nav-link">Contact</a>
        </div>

        <div class="d-flex align-center" style="gap: 12px;">
          <v-btn-toggle v-model="currentLang" mandatory rounded="lg" class="bg-secondary">
            <v-btn value="en" :variant="currentLang === 'en' ? 'flat' : 'text'" class="toggle-chip">EN</v-btn>
            <v-btn value="es" :variant="currentLang === 'es' ? 'flat' : 'text'" class="toggle-chip">ES</v-btn>
          </v-btn-toggle>

          <v-btn color="accent" class="text-black" rounded="lg" elevation="1">
            {{ t.applyNow }}
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-app-bar>

  <v-main>
    <!-- Hero -->
    <section class="section" style="background: linear-gradient(135deg,#FFFFFF,#F5F5F5);">
      <v-container>
        <v-row align="center" justify="space-between" class="ga-8">
          <v-col cols="12" md="6">
            <transition name="fade" mode="out-in">
              <div :key="currentLang">
                <h1 class="text-h3 text-md-h2 font-weight-bold" style="color:#424242;">
                  {{ t.heroTitle }}
                </h1>
                <p class="text-subtitle-1 mt-4" style="color:#616161;">
                  {{ t.heroSubtitle }}
                </p>
                <div class="d-flex flex-column flex-sm-row mt-8" style="gap: 12px;">
                  <v-btn color="accent" class="text-black px-8 py-5" rounded="lg" size="large" elevation="2">
                    {{ t.applyNow }}
                  </v-btn>
                  <v-btn variant="outlined" color="primary" class="px-8 py-5" rounded="lg" size="large">
                    {{ t.partnerWithUs }}
                  </v-btn>
                </div>
              </div>
            </transition>
          </v-col>

          <v-col cols="12" md="6">
            <v-img
              src="/assets/hotel-staff-team.jpg"
              alt="Professional hotel staff team"
              height="360"
              cover
              class="rounded-xl elevation-4"
            />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Services -->
    <section id="services" class="section" style="background:#FFFFFF;">
      <v-container>
        <div class="text-center mb-10">
          <h2 class="text-h4 text-md-h3 font-weight-bold" style="color:#424242;">{{ t.servicesTitle }}</h2>
        </div>

        <v-row class="ga-6">
          <v-col cols="12" md="6" lg="3" v-for="(s, i) in services" :key="i">
            <v-card variant="outlined" class="rounded-xl hover-scale" :elevation="0">
              <v-card-text>
                <div class="w-12 h-12 rounded-lg d-flex align-center justify-center mb-4" style="background:#FFF9C4;">
                  <v-icon color="black" size="28">{{ s.icon }}</v-icon>
                </div>
                <h3 class="text-h6 font-weight-semibold" style="color:#424242;">{{ s.title }}</h3>
                <p class="mt-2" style="color:#757575;">{{ s.desc }}</p>
                <p class="text-body-2 mt-1" style="color:#8D6E63;">{{ s.sub }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Why Choose -->
    <section id="about" class="section" style="background:#F5F5F5;">
      <v-container>
        <div class="text-center mb-10">
          <h2 class="text-h4 text-md-h3 font-weight-bold" style="color:#424242;">{{ t.whyTitle }}</h2>
        </div>

        <v-row class="ga-6">
          <v-col cols="12" md="6" lg="3" v-for="(b, i) in benefits" :key="i">
            <div class="text-center">
              <div class="w-16 h-16 rounded-circle d-flex align-center justify-center mx-auto mb-4" style="background:#FFF9C4;">
                <v-icon color="black" size="34">{{ b.icon }}</v-icon>
              </div>
              <h3 class="text-h6 font-weight-semibold" style="color:#424242;">{{ b.title }}</h3>
              <p class="mt-2" style="color:#757575;">{{ b.desc }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA -->
    <section class="section" :style="{ background: '#FFF9C4' }">
      <v-container>
        <v-row class="ga-8">
          <v-col cols="12" md="6">
            <h3 class="text-h5 text-md-h4 font-weight-bold" style="color:#1A1A1A;">
              {{ t.ctaEmployeeTitle }}
            </h3>
            <v-btn color="white" class="text-black mt-4 px-8 py-5" rounded="lg" size="large" elevation="2">
              {{ t.ctaEmployeeBtn }}
            </v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-h5 text-md-h4 font-weight-bold" style="color:#1A1A1A;">
              {{ t.ctaEmployerTitle }}
            </h3>
            <v-btn color="white" class="text-black mt-4 px-8 py-5" rounded="lg" size="large" elevation="2">
              {{ t.ctaEmployerBtn }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

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
            <div class="text-subtitle-1 font-weight-semibold mb-3">Contact</div>
            <div style="color:#E0E0E0;">Phone: (404) XXX-XXXX</div>
            <div style="color:#E0E0E0;">Email: careers@mossatlanta.com</div>
            <div style="color:#E0E0E0;">Location: Atlanta, GA</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="text-subtitle-1 font-weight-semibold mb-3">Legal</div>
            <div class="d-flex flex-column">
              <a href="#" class="footer-link">{{ t.privacyPolicy }}</a>
              <a href="#" class="footer-link">{{ t.termsOfService }}</a>
            </div>
          </v-col>
        </v-row>

        <div class="text-center mt-8" style="color:#E0E0E0; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 16px;">
          © 2024 MOSS Atlanta Staffing Services. All rights reserved.
        </div>
      </v-container>
    </footer>
  </v-main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Lang = 'en' | 'es'
const currentLang = ref<Lang>('en')

const content = {
  en: {
    applyNow: "Apply Now",
    partnerWithUs: "Partner With Us",
    heroTitle: "Professional Hotel Staffing Solutions in Atlanta",
    heroSubtitle: "400+ trained professionals serving premium hotels across the metro area",
    servicesTitle: "Our Services",
    service1Title: "Housekeeping Services",
    service1Desc: "Room attendants, housemen, supervisors",
    service1Sub: "Our largest service area with trained professionals",
    service2Title: "Food & Beverage",
    service2Desc: "Servers, cooks, dishwashers, bartenders",
    service2Sub: "Restaurant and banquet specialists",
    service3Title: "Front Desk Support",
    service3Desc: "Receptionists, concierge, bell staff",
    service3Sub: "Guest-facing professionals",
    service4Title: "Event Staffing",
    service4Desc: "Temporary and emergency coverage",
    service4Sub: "Flexible solutions for peak demands",
    whyTitle: "Why Choose MOSS",
    reliable: "Reliable",
    reliableDesc: "Proven track record with major hotel chains",
    trained: "Trained",
    trainedDesc: "All staff undergo hotel-specific training",
    flexible: "Flexible",
    flexibleDesc: "24/7 coverage and emergency response",
    local: "Local",
    localDesc: "Deep knowledge of Atlanta hospitality market",
    ctaEmployeeTitle: "Ready to Join Our Team?",
    ctaEmployeeBtn: "Apply Today",
    ctaEmployerTitle: "Looking for Staffing Solutions?",
    ctaEmployerBtn: "Contact Us",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
  },
  es: {
    applyNow: "Aplicar Ahora",
    partnerWithUs: "Asociarse Con Nosotros",
    heroTitle: "Soluciones Profesionales de Personal Hotelero en Atlanta",
    heroSubtitle: "400+ profesionales entrenados sirviendo a hoteles premium en toda el área metropolitana",
    servicesTitle: "Nuestros Servicios",
    service1Title: "Servicios de Limpieza",
    service1Desc: "Camareras, personal de limpieza, supervisores",
    service1Sub: "Nuestra área de servicio más grande con profesionales entrenados",
    service2Title: "Alimentos y Bebidas",
    service2Desc: "Meseros, cocineros, lavaplatos, bartenders",
    service2Sub: "Especialistas en restaurantes y banquetes",
    service3Title: "Soporte de Recepción",
    service3Desc: "Recepcionistas, conserjes, botones",
    service3Sub: "Profesionales de cara al huésped",
    service4Title: "Personal para Eventos",
    service4Desc: "Cobertura temporal y de emergencia",
    service4Sub: "Soluciones flexibles para demandas pico",
    whyTitle: "Por Qué Elegir MOSS",
    reliable: "Confiable",
    reliableDesc: "Historial comprobado con cadenas hoteleras importantes",
    trained: "Entrenado",
    trainedDesc: "Todo el personal recibe entrenamiento específico hotelero",
    flexible: "Flexible",
    flexibleDesc: "Cobertura 24/7 y respuesta de emergencia",
    local: "Local",
    localDesc: "Conocimiento profundo del mercado hospitalario de Atlanta",
    ctaEmployeeTitle: "¿Listo para Unirte a Nuestro Equipo?",
    ctaEmployeeBtn: "Aplicar Hoy",
    ctaEmployerTitle: "¿Buscas Soluciones de Personal?",
    ctaEmployerBtn: "Contáctanos",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos de Servicio",
  },
} as const

const t = computed(() => content[currentLang.value])

const services = computed(() => [
  { icon: 'mdi-broom', title: t.value.service1Title, desc: t.value.service1Desc, sub: t.value.service1Sub },
  { icon: 'mdi-silverware-fork-knife', title: t.value.service2Title, desc: t.value.service2Desc, sub: t.value.service2Sub },
  { icon: 'mdi-account-tie', title: t.value.service3Title, desc: t.value.service3Desc, sub: t.value.service3Sub },
  { icon: 'mdi-calendar-clock', title: t.value.service4Title, desc: t.value.service4Desc, sub: t.value.service4Sub },
])

const benefits = computed(() => [
  { icon: 'mdi-check-circle', title: t.value.reliable, desc: t.value.reliableDesc },
  { icon: 'mdi-school', title: t.value.trained, desc: t.value.trainedDesc },
  { icon: 'mdi-clock-time-four', title: t.value.flexible, desc: t.value.flexibleDesc },
  { icon: 'mdi-map-marker-radius', title: t.value.local, desc: t.value.localDesc },
])
</script>

<style scoped>
.section { padding: 64px 0; }
@media (min-width: 960px) {
  .section { padding: 96px 0; }
}

.border-b { border-bottom: 1px solid #e0e0e0; }

.nav-link { color:#424242; text-decoration:none; transition: color .2s ease; }
.nav-link:hover { color:#1a1a1a; }

.toggle-chip { min-width: 44px; text-transform: none; }

.hover-scale { transition: transform .2s ease, box-shadow .2s ease; }
.hover-scale:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }

.footer-link { color:#E0E0E0; text-decoration:none; margin: 6px 0; transition: color .2s ease; }
.footer-link:hover { color:#FFFFFF; }

/* Language fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
