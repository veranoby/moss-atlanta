import vuetify from 'eslint-config-vuetify'

export default [
  ...vuetify(),
  // ✅ AGREGAR: Reglas adicionales de performance
  {
    rules: {
      // ✅ Prevenir memory leaks
      'vue/no-unused-components': 'error',
      'vue/no-unused-vars': 'error',

      // ✅ Performance optimizations
      'vue/no-async-in-computed-properties': 'error',
      'vue/no-side-effects-in-computed-properties': 'error',

      // ✅ Best practices
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],

            // i18n enforcement
            'vue/no-bare-strings-in-template': 'warn',

            // Pocketbase optimization
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',


      // ✅ Accessibility
      'vue/require-valid-default-prop': 'error',
      'vue/valid-v-slot': 'error',
      'vue/no-v-html': 'warn'

    },
    languageOptions: {
      globals: {
        'defineProps': 'readonly',
        'defineEmits': 'readonly',
        'useI18n': 'readonly'
      }
    }
  },
]

