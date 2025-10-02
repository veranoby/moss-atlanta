<template>
  <AdminLayout>
    <v-container fluid class="pa-0">
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h4 mb-2">{{ $t('admin.settings') }}</h2>
          <p class="text-body-1 text-medium-emphasis">{{ $t('admin.settings.subtitle') }}</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          @click="saveAllSettings"
          :loading="saving"
          :disabled="!hasChanges"
        >
          {{ $t('admin.settings.saveChanges') }}
        </v-btn>
      </div>

      <!-- Enhanced Quick Settings Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="32" color="primary" class="mb-2">mdi-map-marker-radius</v-icon>
            <div class="text-h6">{{ punchRadius }}m</div>
            <div class="text-caption text-medium-emphasis">{{ $t('admin.settings.punchRadius') }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="32" :color="autoProcessing ? 'success' : 'grey'" class="mb-2">mdi-robot</v-icon>
            <div class="text-h6">{{ autoProcessing ? $t('admin.settings.active') : $t('admin.settings.inactive') }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t('admin.settings.aiProcessing') }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="32" :color="integrationsActive ? 'success' : 'warning'" class="mb-2">mdi-cloud-sync</v-icon>
            <div class="text-h6">{{ integrationsCount }}/2</div>
            <div class="text-caption text-medium-emphasis">{{ $t('admin.settings.integrations') }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="32" color="info" class="mb-2">mdi-calendar-clock</v-icon>
            <div class="text-h6">{{ payrollPeriod }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t('admin.settings.payrollPeriod') }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Settings Categories -->
      <v-row v-if="loading">
        <v-col class="text-center">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-col>
      </v-row>

      <v-row v-else>
        <!-- System Settings -->
        <v-col cols="12" lg="6">
          <v-card variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-cog</v-icon>
              {{ $t('admin.settings.system') }}
            </v-card-title>
            <v-card-text>
              <div v-for="setting in systemSettings" :key="setting.key" class="mb-4">
                <component
                  :is="getSettingComponent(setting.type)"
                  v-model="settingValues[setting.key]"
                  :label="setting.display_name"
                  :hint="setting.description"
                  :items="setting.options ? JSON.parse(setting.options) : undefined"
                  :type="setting.input_type"
                  variant="outlined"
                  density="compact"
                  @update:model-value="markChanged(setting.key)"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Integrations Settings -->
        <v-col cols="12" lg="6">
          <v-card variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-cloud-sync</v-icon>
              {{ $t('admin.settings.integrations') }}
            </v-card-title>
            <v-card-text>
              <div v-for="setting in integrationSettings" :key="setting.key" class="mb-4">
                <component
                  :is="getSettingComponent(setting.type)"
                  v-model="settingValues[setting.key]"
                  :label="setting.display_name"
                  :hint="setting.description"
                  :items="setting.options ? JSON.parse(setting.options) : undefined"
                  :type="setting.input_type || (setting.key.includes('password') ? 'password' : 'text')"
                  variant="outlined"
                  density="compact"
                  @update:model-value="markChanged(setting.key)"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Payroll Settings -->
        <v-col cols="12" lg="6">
          <v-card variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-calendar-clock</v-icon>
              {{ $t('admin.settings.payroll') }}
            </v-card-title>
            <v-card-text>
              <div v-for="setting in payrollSettings" :key="setting.key" class="mb-4">
                <component
                  :is="getSettingComponent(setting.type)"
                  v-model="settingValues[setting.key]"
                  :label="setting.display_name"
                  :hint="setting.description"
                  :items="setting.options ? JSON.parse(setting.options) : undefined"
                  :type="setting.input_type"
                  :step="setting.key.includes('rate') ? '0.1' : undefined"
                  variant="outlined"
                  density="compact"
                  @update:model-value="markChanged(setting.key)"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Automation Settings -->
        <v-col cols="12" lg="6">
          <v-card variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-robot</v-icon>
              {{ $t('admin.settings.automation') }}
            </v-card-title>
            <v-card-text>
              <div v-for="setting in automationSettings" :key="setting.key" class="mb-4">
                <component
                  :is="getSettingComponent(setting.type)"
                  v-model="settingValues[setting.key]"
                  :label="setting.display_name"
                  :hint="setting.description"
                  :items="setting.options ? JSON.parse(setting.options) : undefined"
                  :type="setting.input_type || (setting.key.includes('key') ? 'password' : 'text')"
                  variant="outlined"
                  density="compact"
                  @update:model-value="markChanged(setting.key)"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Save Status -->
      <v-snackbar
        v-model="showSaveStatus"
        :color="saveStatus.color"
        :timeout="3000"
        location="top"
      >
        {{ saveStatus.message }}
        <template #actions>
          <v-btn variant="text" @click="showSaveStatus = false">
            {{ $t('admin.settings.close') }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { pb } from '@/composables/usePocketbase';
import AdminLayout from '@/layouts/AdminLayout.vue';

// State
const settings = ref([]);
const settingValues = ref({});
const changedSettings = ref(new Set());
const loading = ref(true);
const saving = ref(false);
const showSaveStatus = ref(false);
const saveStatus = ref({ message: '', color: 'success' });

// Computed properties for quick stats
const punchRadius = computed(() => settingValues.value.punch_radius || 100);
const autoProcessing = computed(() => settingValues.value.auto_process_reports || false);
const payrollPeriod = computed(() => {
  const period = settingValues.value.payroll_period || 'biweekly';
  const periodLabels = {
    'weekly': 'Semanal',
    'biweekly': 'Quincenal',
    'monthly': 'Mensual'
  };
  return periodLabels[period] || period;
});

const integrationsCount = computed(() => {
  let count = 0;
  if (settingValues.value.onedrive_enabled) count++;
  if (settingValues.value.quickbooks_enabled) count++;
  return count;
});

const integrationsActive = computed(() => integrationsCount.value > 0);
const hasChanges = computed(() => changedSettings.value.size > 0);

// Categorized settings
const systemSettings = computed(() =>
  settings.value.filter(s => s.category === 'system')
);

const integrationSettings = computed(() =>
  settings.value.filter(s => s.category === 'integrations')
);

const payrollSettings = computed(() =>
  settings.value.filter(s => s.category === 'payroll')
);

const automationSettings = computed(() =>
  settings.value.filter(s => s.category === 'automation')
);

// Methods
const getSettingComponent = (type) => {
  switch (type) {
    case 'boolean': return 'v-switch';
    case 'select': return 'v-select';
    case 'number': return 'v-text-field';
    default: return 'v-text-field';
  }
};

const markChanged = (key) => {
  changedSettings.value.add(key);
};

async function loadSettings() {
  loading.value = true;
  try {
    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      console.error('User not authenticated');
      return;
    }

    const records = await pb.collection('app_settings').getFullList({ sort: '+key' });
    settings.value = records;

    // Initialize setting values
    records.forEach(setting => {
      let value = setting.value;
      // Parse boolean values
      if (setting.type === 'boolean') {
        value = value === 'true' || value === true;
      }
      // Parse number values
      if (setting.type === 'number') {
        value = parseFloat(value) || 0;
      }
      settingValues.value[setting.key] = value;
    });

    console.log(`Loaded ${records.length} settings:`, settingValues.value);
  } catch (error) {
    console.error("Failed to load settings:", error);
    if (error.status === 404) {
      console.log("app_settings collection not found - creating default settings");
      await createDefaultSettings();
    }
  } finally {
    loading.value = false;
  }
}

async function createDefaultSettings() {
  // Default settings based on MOSS Atlanta requirements
  const defaultSettings = [
    // System settings
    { key: 'company_name', value: 'MOSS Atlanta', type: 'text', category: 'system', display_name: 'Nombre de la Empresa', description: 'Nombre oficial de la empresa' },
    { key: 'punch_radius', value: '100', type: 'number', category: 'system', display_name: 'Radio de Marcaje (m)', description: 'Distancia permitida desde la ubicación del hotel' },
    { key: 'require_photo_fallback', value: 'true', type: 'boolean', category: 'system', display_name: 'Foto si GPS falla', description: 'Requerir foto cuando GPS no está disponible' },
    { key: 'enforce_punch_sequence', value: 'true', type: 'boolean', category: 'system', display_name: 'Forzar secuencia 4 marcajes', description: 'Clock In → Break Start → Break End → Clock Out' },

    // Integration settings
    { key: 'onedrive_enabled', value: 'false', type: 'boolean', category: 'integrations', display_name: 'OneDrive habilitado', description: 'Integración con Microsoft OneDrive' },
    { key: 'onedrive_folder', value: '/MOSS-Documents', type: 'text', category: 'integrations', display_name: 'Carpeta OneDrive', description: 'Ruta de la carpeta en OneDrive' },
    { key: 'quickbooks_enabled', value: 'false', type: 'boolean', category: 'integrations', display_name: 'QuickBooks habilitado', description: 'Integración con QuickBooks' },
    { key: 'quickbooks_sync_frequency', value: 'daily', type: 'select', category: 'integrations', display_name: 'Frecuencia sync QB', description: 'Frecuencia de sincronización con QuickBooks', options: '[{"title":"Diario","value":"daily"},{"title":"Semanal","value":"weekly"},{"title":"Manual","value":"manual"}]' },

    // Payroll settings
    { key: 'payroll_period', value: 'biweekly', type: 'select', category: 'payroll', display_name: 'Período de nómina', description: 'Tipo de período de pago', options: '[{"title":"Semanal","value":"weekly"},{"title":"Quincenal","value":"biweekly"},{"title":"Mensual","value":"monthly"}]' },
    { key: 'overtime_threshold', value: '40', type: 'number', category: 'payroll', display_name: 'Límite horas normales', description: 'Horas antes de aplicar tiempo extra' },
    { key: 'overtime_rate', value: '1.5', type: 'number', category: 'payroll', display_name: 'Tasa tiempo extra', description: 'Multiplicador para tiempo extra' },

    // Automation settings
    { key: 'auto_process_reports', value: 'true', type: 'boolean', category: 'automation', display_name: 'Procesar reportes con IA', description: 'Usar Gemini 2.5 Pro para extraer datos automáticamente' },
    { key: 'n8n_url', value: 'http://localhost:5678', type: 'text', category: 'automation', display_name: 'URL de n8n', description: 'Dirección del servidor n8n' },
    { key: 'send_reconciliation_alerts', value: 'true', type: 'boolean', category: 'automation', display_name: 'Alertas reconciliación', description: 'Enviar notificaciones de reconciliación' }
  ];

  // Note: In production, this would create the app_settings collection
  // For now, just log that default settings would be created
  console.log('Would create default settings:', defaultSettings);
  settings.value = defaultSettings;

  // Initialize values
  defaultSettings.forEach(setting => {
    let value = setting.value;
    if (setting.type === 'boolean') {
      value = value === 'true';
    }
    if (setting.type === 'number') {
      value = parseFloat(value) || 0;
    }
    settingValues.value[setting.key] = value;
  });
}

async function saveAllSettings() {
  saving.value = true;
  try {
    const promises = [];

    for (const key of changedSettings.value) {
      const setting = settings.value.find(s => s.key === key);
      if (setting) {
        const value = settingValues.value[key];
        const dataToUpdate = { value: String(value) };

        if (setting.id) {
          // Update existing setting
          promises.push(pb.collection('app_settings').update(setting.id, dataToUpdate));
        } else {
          // Create new setting (for default settings)
          const newSetting = { ...setting, value: String(value) };
          promises.push(pb.collection('app_settings').create(newSetting));
        }
      }
    }

    await Promise.all(promises);
    changedSettings.value.clear();

    showSaveStatus.value = true;
    saveStatus.value = {
      message: `${promises.length} configuraciones guardadas exitosamente`,
      color: 'success'
    };

    // Reload settings to get updated IDs
    await loadSettings();
  } catch (error) {
    console.error('Failed to save settings:', error);
    showSaveStatus.value = true;
    saveStatus.value = {
      message: 'Error al guardar configuraciones',
      color: 'error'
    };
  } finally {
    saving.value = false;
  }
}

// Lifecycle
onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.wrap-text {
  white-space: normal;
  word-break: break-word;
}

.v-card {
  height: 100%;
}

.v-switch {
  display: flex;
  align-items: center;
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1.25rem;
}

/* Quick stats cards */
.pa-4 {
  padding: 16px !important;
}

.mb-6 {
  margin-bottom: 24px !important;
}

/* Setting input spacing */
.mb-4 {
  margin-bottom: 16px !important;
}

/* Card consistency */
.v-card-title {
  font-weight: 600;
  font-size: 1.125rem;
}

.v-card-text {
  padding-top: 16px;
}

/* Switch component improvements */
.v-switch .v-selection-control__input {
  margin-right: 12px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-col.cols-12.md-3 {
    margin-bottom: 12px;
  }
}
</style>
