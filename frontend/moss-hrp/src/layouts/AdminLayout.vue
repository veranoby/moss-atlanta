<template>
  <div class="admin-layout">
    <!-- Admin Sidebar -->
    <AdminSidebar v-model="sidebarOpen" />

    <!-- Main Content Area -->
    <v-main class="admin-main-content">
      <!-- Admin App Bar -->
      <v-app-bar
        color="surface"
        elevation="1"
        height="64"
        class="admin-app-bar"
      >
        <v-app-bar-nav-icon
          @click="toggleSidebar"
          class="d-md-none"
        />

        <v-toolbar-title class="d-flex align-center">
          <v-icon class="me-2" size="24">mdi-shield-crown</v-icon>
          <span class="text-h6">{{ pageTitle }}</span>
        </v-toolbar-title>

        <v-spacer />

        <!-- User Actions -->
        <div class="d-flex align-center ga-2">
          <LanguageSwitch />

          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            @click="goBack"
            title="Go Back"
          />

          <v-btn
            icon="mdi-bell"
            variant="text"
            size="small"
          />

          <v-btn
            icon="mdi-cog"
            variant="text"
            size="small"
            :to="{ name: 'AdminSettings' }"
          />

          <v-btn
            icon="mdi-home"
            variant="text"
            size="small"
            :to="{ name: 'AdminDashboard' }"
            title="Dashboard"
          />
        </div>
      </v-app-bar>

      <!-- Page Content with proper spacing -->
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

// Reactive state
const sidebarOpen = ref(true)
const route = useRoute()
const router = useRouter()

// Computed
const pageTitle = computed(() => {
  const routeName = route.name as string
  const titleMap: Record<string, string> = {
    'AdminDashboard': 'Dashboard',
    'AdminHotels': 'Hotels',
    'AdminDepartments': 'Departments',
    'AdminPositions': 'Positions',
    'AdminEmployees': 'Employees',
    'AdminOpenPositions': 'Open Positions',
    'AdminApplications': 'Applications',
    'AdminReconciliation': 'Reconciliation',
    'AdminSettings': 'Settings'
  }
  return titleMap[routeName] || 'Admin Panel'
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Ensure proper router history handling
onMounted(() => {
  // Enable browser back button functionality
  window.addEventListener('popstate', handlePopstate)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopstate)
})

const handlePopstate = () => {
  // Let Vue Router handle the navigation naturally
  // This ensures the back button works correctly in admin area
}

// Back button functionality
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'AdminDashboard' })
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
}

.admin-main-content {
  padding-left: 280px; /* Match sidebar width */
}

.admin-app-bar {
  left: 280px !important; /* Match sidebar width */
  width: calc(100% - 280px) !important;
}

/* Mobile responsive */
@media (max-width: 960px) {
  .admin-main-content {
    padding-left: 0;
  }

  .admin-app-bar {
    left: 0 !important;
    width: 100% !important;
  }
}

/* Content spacing */
.v-container {
  max-width: none;
}
</style>