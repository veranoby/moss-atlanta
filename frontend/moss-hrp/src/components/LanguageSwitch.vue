<template>
  <v-btn-toggle
    v-model="currentLang"
    mandatory
    rounded="lg"
    class="bg-secondary"
    @update:model-value="handleLanguageChange"
  >
    <v-btn
      value="en"
      :variant="currentLang === 'en' ? 'flat' : 'text'"
      class="toggle-chip"
    >
      EN
    </v-btn>
    <v-btn
      value="es"
      :variant="currentLang === 'es' ? 'flat' : 'text'"
      class="toggle-chip"
    >
      ES
    </v-btn>
  </v-btn-toggle>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// ✅ Reactive state
const currentLang = ref<'en' | 'es'>('en')

// ✅ Methods
const handleLanguageChange = (newLang: 'en' | 'es') => {
  currentLang.value = newLang
  locale.value = newLang

  // ✅ Persist to localStorage
  try {
    localStorage.setItem('app-locale', newLang)
  } catch (error) {
    console.error('Error saving locale to localStorage:', error)
  }
}

// ✅ Initialize from localStorage
const initializeLanguage = () => {
  const savedLocale = localStorage.getItem('app-locale') as 'en' | 'es'
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
    currentLang.value = savedLocale
    locale.value = savedLocale
  }
}

// ✅ Watch for external changes
watch(() => locale.value, (newLocale) => {
  if (newLocale !== currentLang.value) {
    currentLang.value = newLocale as 'en' | 'es'
  }
})

// ✅ Initialize on mount
initializeLanguage()
</script>

<style scoped>
.toggle-chip {
  min-width: 44px;
  text-transform: none;
}
</style>
