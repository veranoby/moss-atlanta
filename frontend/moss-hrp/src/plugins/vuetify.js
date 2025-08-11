/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'

// ✅ Optimized Vuetify configuration with enhanced defaults
export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#FFF9C4',
          secondary: '#F5F5F5',
          accent: '#424242',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          // ✅ Agregar colores adicionales para mejor control
          background: '#FFFFFF',
          surface: '#FFFFFF',
          'surface-variant': '#F5F5F5',
          'on-surface': '#424242',
          'on-surface-variant': '#757575'
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#FFF9C4',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          // ✅ Colores para tema oscuro
          background: '#121212',
          surface: '#1E1E1E',
          'surface-variant': '#2D2D2D',
          'on-surface': '#FFFFFF',
          'on-surface-variant': '#B0B0B0'
        },
      },
    },
    variations: {
      colors: [],
      lighten: 0,
      darken: 0,
    },
  },
  // ✅ Enhanced defaults for better consistency
  defaults: {
    VCard: {
      rounded: 'lg',
      variant: 'elevated',
      elevation: 2,
    },
    VBtn: {
      rounded: 'lg',
      elevation: 1,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VContainer: {
      fluid: false,
    },
    VAppBar: {
      elevation: 0,
      color: 'surface',
    },
    VNavigationDrawer: {
      elevation: 2,
    },
    VDialog: {
      persistent: false,
      maxWidth: 600,
    },
    VSnackbar: {
      timeout: 4000,
      location: 'bottom',
    },
    VTooltip: {
      location: 'top',
    },
    VMenu: {
      location: 'bottom',
    },
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 340,
      md: 540,
      lg: 800,
      xl: 1280,
    },
  },
  // ✅ Global configuration for better performance
  ssr: {
    noExternal: ['vuetify']
  }
})
