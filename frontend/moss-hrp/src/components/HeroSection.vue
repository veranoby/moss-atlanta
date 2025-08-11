<template>
  <section class="section hero-section" style="background: linear-gradient(135deg,#FFFFFF,#F5F5F5);">
    <v-container>
      <v-row align="center" justify="space-between" class="ga-8">
        <v-col cols="12" md="6">
          <transition name="slide-up" mode="out-in">
            <div :key="currentLang" class="hero-content">
              <h1 class="text-h3 text-md-h2 font-weight-bold hero-title">
                {{ $t('hero.title') }}
              </h1>
              <p class="text-subtitle-1 mt-4 hero-subtitle">
                {{ $t('hero.subtitle') }}
              </p>
              <div class="d-flex flex-column flex-sm-row mt-8 hero-buttons" style="gap: 12px;">
                <v-btn
                  color="accent"
                  class="text-black px-8 py-5 hero-btn"
                  rounded="lg"
                  size="large"
                  elevation="2"
                  @click="scrollToSection('apply')"
                >
                  {{ $t('hero.applyNow') }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="primary"
                  class="px-8 py-5 hero-btn"
                  rounded="lg"
                  size="large"
                  @click="scrollToSection('contact')"
                >
                  {{ $t('hero.partnerWithUs') }}
                </v-btn>
              </div>
            </div>
          </transition>
        </v-col>

        <v-col cols="12" md="6">
          <!-- ✅ Lazy loaded image with sophisticated animations -->
          <div class="hero-image-container">
            <LazyImage
              src="/assets/hotel-staff-team.jpg"
              alt="Professional hotel staff team"
              aspect-ratio="4/3"
              placeholder-color="#f5f5f5"
              image-class="hero-image"
              :image-style="{
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import LazyImage from './LazyImage.vue'

// ✅ Inject current language from parent
const currentLang = inject('currentLang', 'en')

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

.hero-section {
  position: relative;
  overflow: hidden;
}

.hero-content {
  animation: fadeInUp 0.8s ease-out;
}

.hero-title {
  color: #424242;
  animation: slideInLeft 0.8s ease-out 0.2s both;
}

.hero-subtitle {
  color: #616161;
  animation: slideInLeft 0.8s ease-out 0.4s both;
}

.hero-buttons {
  animation: slideInLeft 0.8s ease-out 0.6s both;
}

.hero-btn {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.hero-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.hero-btn:hover::before {
  left: 100%;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.hero-image-container {
  animation: fadeInRight 0.8s ease-out 0.4s both;
}

.hero-image {
  transition: transform 0.3s ease;
}

.hero-image:hover {
  transform: scale(1.02);
}

/* ✅ Sophisticated animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ✅ Language transition animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
