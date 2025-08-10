import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin/Dashboard.vue'),
    meta: { requiresAuth: true, role: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/hotels',
    name: 'AdminHotels',
    component: () => import('@/views/Admin/Hotels.vue'),
    meta: { requiresAuth: true, role: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/employee',
    name: 'Employee',
    component: () => import('@/views/Employee/Profile.vue'),
    meta: { requiresAuth: true, role: ['employee'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
