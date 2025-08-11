<template>
  <div v-if="hasError">
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="text-center pa-6">
            <v-icon
              size="64"
              color="error"
              class="mb-4"
            >
              mdi-alert-circle-outline
            </v-icon>

            <h2 class="text-h5 mb-4">
              {{ error?.message || 'Something went wrong' }}
            </h2>

            <p class="text-body-2 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            <v-btn
              color="primary"
              @click="handleRetry"
            >
              Try Again
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const error = ref(null)

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  error.value = err

  // ✅ AGREGAR: Logging de errores
  console.error('Error captured:', err, info)

  if (import.meta.env.PROD) {
    // Enviar a servicio de logging
  }

  return false // Prevenir propagación
})

const handleRetry = () => {
  hasError.value = false
  error.value = null
  window.location.reload()
}
</script>
