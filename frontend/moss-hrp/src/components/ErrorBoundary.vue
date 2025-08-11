<template>
  <div v-if="hasError">
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="text-center pa-6 error-card">
            <v-icon
              size="64"
              color="error"
              class="mb-4 error-icon"
            >
              mdi-alert-circle-outline
            </v-icon>

            <h2 class="text-h5 mb-4 error-title">
              {{ error?.message || 'Something went wrong' }}
            </h2>

            <p class="text-body-2 mb-6 error-description">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            <!-- ✅ Enhanced error actions -->
            <div class="d-flex flex-column flex-sm-row gap-3 justify-center">
              <v-btn
                color="primary"
                @click="handleRetry"
                class="error-btn"
              >
                <v-icon start>mdi-refresh</v-icon>
                Try Again
              </v-btn>

              <v-btn
                variant="outlined"
                @click="handleGoHome"
                class="error-btn"
              >
                <v-icon start>mdi-home</v-icon>
                Go Home
              </v-btn>
            </div>

            <!-- ✅ Error details for development -->
            <v-expand-transition>
              <div v-if="showDetails" class="mt-4">
                <v-divider class="mb-3" />
                <v-btn
                  variant="text"
                  size="small"
                  @click="showDetails = false"
                >
                  Hide Details
                </v-btn>
                <pre class="text-caption mt-2 error-details">{{ errorDetails }}</pre>
              </div>
            </v-expand-transition>

            <!-- ✅ Show details button for development -->
            <v-btn
              v-if="!showDetails && isDevelopment"
              variant="text"
              size="small"
              @click="showDetails = true"
              class="mt-2"
            >
              Show Error Details
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'

// ✅ Reactive state
const hasError = ref(false)
const error = ref<Error | null>(null)
const showDetails = ref(false)
const router = useRouter()

// ✅ Computed properties
const isDevelopment = computed(() => import.meta.env.DEV)
const errorDetails = computed(() => {
  if (!error.value) return ''
  return JSON.stringify({
    message: error.value.message,
    stack: error.value.stack,
    name: error.value.name
  }, null, 2)
})

// ✅ Error handling
onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true
  error.value = err

  // ✅ Enhanced error logging
  console.error('Error captured:', {
    error: err,
    component: instance?.$options?.name || 'Unknown',
    info,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  })

  // ✅ Send to error tracking service in production
  if (import.meta.env.PROD) {
    // Example: sendToErrorTracking(err, { instance, info })
    console.warn('Error would be sent to tracking service in production')
  }

  return false // Prevent error propagation
})

// ✅ Methods
const handleRetry = () => {
  hasError.value = false
  error.value = null
  showDetails.value = false

  // ✅ Soft reload instead of hard reload
  window.location.reload()
}

const handleGoHome = () => {
  hasError.value = false
  error.value = null
  showDetails.value = false

  // ✅ Navigate to home page
  router.push('/')
}

// ✅ Global error handler
const setupGlobalErrorHandler = () => {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
}

// ✅ Setup on mount
setupGlobalErrorHandler()
</script>

<style scoped>
.error-card {
  animation: slideInUp 0.5s ease-out;
}

.error-icon {
  animation: pulse 2s infinite;
}

.error-title {
  color: #424242;
  font-weight: 600;
}

.error-description {
  color: #757575;
  line-height: 1.6;
}

.error-btn {
  transition: all 0.2s ease;
}

.error-btn:hover {
  transform: translateY(-1px);
}

.error-details {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}

/* ✅ Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
