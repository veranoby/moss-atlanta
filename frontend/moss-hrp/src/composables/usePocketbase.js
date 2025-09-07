import PocketBase from 'pocketbase';
import { ref } from 'vue';

// Pocketbase client instance
// The URL is from the project instructions
export const pb = new PocketBase('http://localhost:8080');

// Reactive reference to the authenticated user
// Initialized with the value from the auth store
export const currentUser = ref(pb.authStore.model);

// Register a callback to update the currentUser on auth store changes
// This ensures the user state is always in sync
pb.authStore.onChange((token, model) => {
  currentUser.value = model;
}, true); // 'true' fires the callback immediately with the current state
