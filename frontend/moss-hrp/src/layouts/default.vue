<template>
  <v-app>
    <!-- Show the App Bar and Navigation Drawer only for routes that require authentication -->
    <template v-if="showAdminLayout">
      <v-app-bar app color="primary">
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>MOSS HRP Admin</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="handleLogout" prepend-icon="mdi-logout">
          Logout
        </v-btn>
      </v-app-bar>

      <v-navigation-drawer app v-model="drawer">
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in navItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </template>

    <!-- The main content area where the views will be rendered -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Show the simple footer only on public pages -->
    <AppFooter v-if="!showAdminLayout" />
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppFooter from '@/components/AppFooter.vue';

const drawer = ref(true);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// This computed property determines whether to show the admin navigation.
// It checks the meta field of the current route.
const showAdminLayout = computed(() => route.meta.requiresAuth);

// List of navigation items for the admin sidebar.
const navItems = [
  { title: 'Dashboard', to: '/admin', icon: 'mdi-view-dashboard' },
  { title: 'Empleados', to: '/admin/employees', icon: 'mdi-account-group' },
  { title: 'Reconciliation', to: '/admin/reconciliation', icon: 'mdi-compare' },
  { title: 'Entidades Legales', to: '/admin/legal-entities', icon: 'mdi-office-building' },
  { title: 'Hoteles', to: '/admin/hotels', icon: 'mdi-domain' },
  { title: 'Departamentos', to: '/admin/departments', icon: 'mdi-google-circles-communities' },
  { title: 'Puestos', to: '/admin/positions', icon: 'mdi-briefcase' },
  { title: 'Posiciones Abiertas', to: '/admin/open-positions', icon: 'mdi-briefcase-search' },
  { title: 'Configuración', to: '/admin/settings', icon: 'mdi-cog' },
];

/**
 * Logs the user out and redirects to the login page.
 */
async function handleLogout() {
  try {
    authStore.logout();
    await router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
    // Even if router.push fails, ensure we still clear auth
    authStore.logout();
    window.location.href = '/login';
  }
}
</script>
