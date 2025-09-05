import { useAuthStore } from '@/stores/auth';

/**
 * Vue Router navigation guard for authentication and authorization.
 * It's designed to be used with `router.beforeEach`.
 *
 * @param {object} to - The target Route object.
 * @param {object} from - The current Route object being navigated away from.
 * @returns {boolean|object} - `true` to allow navigation, or a route object to redirect.
 */
export function authGuard(to, from) {
  const authStore = useAuthStore();

  const requiresAuth = to.meta.requiresAuth;
  const requiredRoles = to.meta.roles || [];

  // Redirect authenticated users away from the login page
  if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirect to a default authenticated page, e.g., home or dashboard
    return { path: '/' };
  }

  // If the route doesn't require authentication, allow access
  if (!requiresAuth) {
    return true;
  }

  // If the route requires auth and the user is not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  // If the route requires specific roles and the user doesn't have them
  if (requiredRoles.length > 0 && !authStore.hasAnyRole(requiredRoles)) {
    // Redirect to an unauthorized page or home. Home is a safe default.
    return { path: '/' };
  }

  // If all checks pass, grant access
  return true;
}
