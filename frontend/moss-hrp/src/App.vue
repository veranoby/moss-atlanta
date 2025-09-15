<template>
  <v-app>
    <!-- ✅ Error boundary wrapper -->
    <ErrorBoundary>
      <!-- ✅ Loading overlay for better UX -->
      <v-overlay
        v-model="isLoading"
        class="align-center justify-center"
        persistent
      >
        <v-progress-circular
          size="64"
          color="primary"
          indeterminate
        />
      </v-overlay>

      <!-- ✅ App Bar for all pages except Home -->
      <v-app-bar v-if="$route.name !== 'Home'" app color="surface" class="border-b" elevation="0">
        <v-container class="d-flex align-center justify-space-between pa-0">
          <div class="d-flex align-center">
            <router-link
              :to="{ name: 'Home' }"
              class="text-h5 font-weight-bold text-decoration-none"
              style="color:#424242;"
              aria-label="Go to top"
            >
              MOSS
            </router-link>
            <div class="ms-2 text-body-2" style="color:#757575">Atlanta Staffing Services</div>
          </div>

          <div class="d-none d-md-flex align-center" style="gap: 24px;">
            <router-link :to="{ name: 'Home' }" class="text-body-2 nav-link">{{ $t('nav.services') }}</router-link>
            <router-link :to="{ name: 'Home' }" class="text-body-2 nav-link">{{ $t('nav.about') }}</router-link>
            <router-link :to="{ name: 'OpenPositions' }" class="text-body-2 nav-link">{{ $t('nav.openPositions') }}</router-link>
            <router-link :to="{ name: 'Contact' }" class="text-body-2 nav-link">{{ $t('nav.contact') }}</router-link>
          </div>

          <div class="d-flex align-center" style="gap: 12px;">
            <LanguageSwitch />
            <!-- Login button - show only if not authenticated -->
            <v-btn
              v-if="!authStore.isAuthenticated && $route.name !== 'Login'"
              :to="{ name: 'Login' }"
              color="primary"
              rounded="lg"
              variant="flat"
            >
              {{ $t('nav.login') }}
            </v-btn>
            <!-- Logout button - show only if authenticated -->
            <v-btn
              v-if="authStore.isAuthenticated"
              @click="handleLogout"
              color="error"
              rounded="lg"
              variant="outlined"
            >
              {{ $t('nav.logout') }}
            </v-btn>
          </div>
        </v-container>
      </v-app-bar>

      <!-- ✅ Main router view with transition -->
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </ErrorBoundary>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

// ✅ Reactive state
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

// ✅ Methods
const handleLoading = (loading: boolean) => {
  isLoading.value = loading
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Home' })
}

// ✅ Router navigation guards for loading states
const setupRouterGuards = () => {
  router.beforeEach((to, from, next) => {
    isLoading.value = true
    next()
  })

  router.afterEach(() => {
    // ✅ Delay to show loading state for better UX
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  })
}

// ✅ Lifecycle hooks
onMounted(() => {
  setupRouterGuards()

  // ✅ Initialize app theme from localStorage
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme) {
    // Apply theme if needed
  }
})

onUnmounted(() => {
  // ✅ Cleanup if needed
})
</script>

<style>
/* ✅ Global styles for better consistency */
:root {
  --app-transition-duration: 0.3s;
  --app-border-radius: 12px;
  --app-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ✅ Smooth page transitions */
.page-enter-active,
.page-leave-active {
  transition: all var(--app-transition-duration) ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ✅ Global utility classes */
.text-gradient {
  background: linear-gradient(135deg, #FFF9C4, #FFE082);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--app-shadow);
}

/* ✅ Optimize scrolling */
html {
  scroll-behavior: smooth;
}

/* ✅ Optimize fonts */
body {
  font-display: swap;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ✅ Focus styles for accessibility */
*:focus {
  outline: 2px solid #FFF9C4;
  outline-offset: 2px;
}

/* ✅ Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ✅ Navigation link styles to match Home.vue */
.nav-link {
  color:#424242;
  text-decoration:none;
  transition: color .2s ease;
}

.nav-link:hover {
  color:#1a1a1a;
}
</style>
