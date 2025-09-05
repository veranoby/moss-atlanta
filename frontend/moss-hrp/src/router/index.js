import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import LoginPage from '@/pages/LoginPage.vue'
import { authGuard } from '@/middleware/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false } // Public route
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/hotels',
    name: 'AdminHotels',
    component: () => import('@/views/Admin/Hotels.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/employee',
    name: 'Employee',
    component: () => import('@/views/Employee/Profile.vue'),
    meta: { requiresAuth: true, roles: ['employee'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Register the authentication guard to run before each navigation.
router.beforeEach(authGuard);

export default router
