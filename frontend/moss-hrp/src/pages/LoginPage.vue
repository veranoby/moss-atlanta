<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-alert
                v-if="errorMessage"
                type="error"
                density="compact"
                class="mb-4"
                :text="errorMessage"
                closable
                @click:close="errorMessage = null"
              ></v-alert>

              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-account"
                type="email"
                required
                :disabled="loading"
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
                :disabled="loading"
                variant="underlined"
              ></v-text-field>

              <v-card-actions class="px-0">
                <v-spacer></v-spacer>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                  :disabled="loading || !email || !password"
                >
                  Login
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref(null);

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  if (!email.value || !password.value) return;

  loading.value = true;
  errorMessage.value = null;
  try {
    await authStore.login(email.value, password.value);

    // Redirect after successful login.
    // The prompt mentions an '/admin' route as an example for a protected area.
    router.push('/admin');
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = error.data?.message || 'Invalid credentials or server error.';
  } finally {
    loading.value = false;
  }
};
</script>
