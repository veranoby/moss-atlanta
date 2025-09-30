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
    path: '/open-positions',
    name: 'OpenPositions',
    component: () => import('@/views/OpenPositions.vue'),
    meta: { requiresAuth: false } // Public route
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact.vue'),
    meta: { requiresAuth: false } // Public route
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false } // Public route
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/Admin/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/employees',
    name: 'AdminEmployees',
    component: () => import('@/views/Admin/Employees.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/reconciliation',
    name: 'AdminReconciliation',
    component: () => import('@/views/Admin/Reconciliation.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('@/views/Admin/Settings.vue'),
    meta: { requiresAuth: true, roles: ['super_admin'] }
  },
  {
    path: '/admin/positions',
    name: 'AdminPositions',
    component: () => import('@/views/Admin/Positions.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/departments',
    name: 'AdminDepartments',
    component: () => import('@/views/Admin/Departments.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/legal-entities',
    name: 'AdminLegalEntities',
    component: () => import('@/views/Admin/LegalEntities.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/hotels',
    name: 'AdminHotels',
    component: () => import('@/views/Admin/Hotels.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/open-positions',
    name: 'AdminOpenPositions',
    component: () => import('@/views/Admin/OpenPositions.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/applications',
    name: 'AdminApplications',
    component: () => import('@/views/Admin/Applications.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr'] }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/Admin/Users.vue'),
    meta: { requiresAuth: true, roles: ['super_admin'] }
  },
  // Historical views - TODO [JULES]: Create these view components
  {
    path: '/admin/payroll-history',
    name: 'AdminPayrollHistory',
    component: () => import('@/views/Admin/PayrollHistory.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr', 'financial'] }
  },
  {
    path: '/admin/hotel-billing',
    name: 'AdminHotelBilling',
    component: () => import('@/views/Admin/HotelBilling.vue'),
    meta: { requiresAuth: true, roles: ['super_admin', 'operations_hr', 'financial'] }
  },
  {
    path: '/admin/reconciliation-archive',
    name: 'AdminReconciliationArchive',
    component: () => import('@/views/Admin/ReconciliationArchive.vue'),
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
