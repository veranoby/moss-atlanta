
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

// ✅ Plugins registration in proper order
app.use(createPinia())

// Initialize the auth store immediately to ensure the auth state is restored
// from the cookie before the router's navigation guards run.
useAuthStore()

app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')
