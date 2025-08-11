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

      <!-- ✅ Main router view with transition -->
      <transition name="page" mode="out-in">
        <router-view v-slot="{ Component, route }">
          <component
            :is="Component"
            :key="route.path"
            @loading="handleLoading"
          />
        </router-view>
      </transition>
    </ErrorBoundary>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

// ✅ Reactive state
const isLoading = ref(false)
const router = useRouter()

// ✅ Methods
const handleLoading = (loading: boolean) => {
  isLoading.value = loading
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
</style>
