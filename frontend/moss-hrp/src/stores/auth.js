import { defineStore } from 'pinia';
import { computed } from 'vue';
import { pb, currentUser } from '@/composables/usePocketbase';

// Define the auth store using Pinia's setup store syntax
export const useAuthStore = defineStore('auth', () => {
  // The user state is directly linked to the reactive currentUser from our composable
  const user = currentUser;

  // A computed property to determine if the user is authenticated
  const isAuthenticated = computed(() => !!user.value && pb.authStore.isValid);

  // A computed property for the user's role
  const userRole = computed(() => user.value?.system_role || null);

  /**
   * Logs the user in by authenticating with PocketBase.
   * The `currentUser` ref will update automatically via the hook in usePocketbase.js.
   * @param {string} email The user's email.
   * @param {string} password The user's password.
   * @returns {Promise<void>}
   */
  async function login(email, password) {
    await pb.collection('users').authWithPassword(email, password);
  }

  /**
   * Logs the user out by clearing the auth store in PocketBase.
   * The `currentUser` ref will update automatically.
   */
  function logout() {
    pb.authStore.clear();
  }

  /**
   * Checks if the current user has a specific role.
   * A 'super_admin' is considered to have all roles.
   * @param {string} role The role to check.
   * @returns {boolean} True if the user has the role.
   */
  function hasRole(role) {
    if (!user.value) return false;
    if (user.value.system_role === 'super_admin') return true;
    return user.value.system_role === role;
  }

  /**
   * Checks if the current user has at least one of the specified roles.
   * This correctly leverages the hasRole function which accounts for super_admin.
   * @param {string[]} roles An array of roles to check against.
   * @returns {boolean} True if the user has any of the roles.
   */
  function hasAnyRole(roles) {
    if (!user.value || !roles || roles.length === 0) {
      return false;
    }
    // Use .some() to check if the user has at least one of the required roles.
    return roles.some(role => hasRole(role));
  }

  // Expose state, getters, and actions
  return {
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };
});
