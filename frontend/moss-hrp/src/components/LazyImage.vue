<template>
  <div class="lazy-image-container" :class="{ 'is-loaded': isLoaded }">
    <!-- ✅ Placeholder mientras carga -->
    <div
      v-if="!isLoaded"
      class="image-placeholder"
      :style="{
        backgroundColor: placeholderColor,
        aspectRatio: aspectRatio
      }"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="32"
      />
    </div>

    <!-- ✅ Imagen real con lazy loading -->
    <img
      v-show="isLoaded"
      :src="src"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleImageLoad"
      @error="handleImageError"
      loading="lazy"
      decoding="async"
    />

    <!-- ✅ Error state -->
    <div
      v-if="hasError"
      class="image-error"
      :style="{ aspectRatio: aspectRatio }"
    >
      <v-icon color="error" size="48">mdi-image-off</v-icon>
      <p class="text-caption mt-2">Failed to load image</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// ✅ Props
interface Props {
  src: string
  alt: string
  aspectRatio?: string
  placeholderColor?: string
  imageClass?: string
  imageStyle?: Record<string, string>
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: '16/9',
  placeholderColor: '#f5f5f5',
  imageClass: '',
  imageStyle: () => ({}),
  threshold: 0.1
})

// ✅ Reactive state
const isLoaded = ref(false)
const hasError = ref(false)
const isIntersecting = ref(false)

// ✅ Computed
const containerStyle = computed(() => ({
  aspectRatio: props.aspectRatio
}))

// ✅ Methods
const handleImageLoad = () => {
  isLoaded.value = true
  hasError.value = false
}

const handleImageError = () => {
  hasError.value = true
  isLoaded.value = false
}

// ✅ Intersection Observer for lazy loading
const setupIntersectionObserver = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isIntersecting.value = true
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: props.threshold,
      rootMargin: '50px'
    }
  )

  return observer
}

// ✅ Lifecycle
onMounted(() => {
  const observer = setupIntersectionObserver()
  const container = document.querySelector('.lazy-image-container')
  if (container) {
    observer.observe(container)
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  border-radius: inherit;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.is-loaded img {
  opacity: 1;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
