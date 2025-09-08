<template>
  <v-dialog v-model="dialog" max-width="900px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-avatar color="primary" class="me-3">
          <v-icon>mdi-account</v-icon>
        </v-avatar>
        <div>
          <h3>{{ candidateProfile?.first_name }} {{ candidateProfile?.last_name }}</h3>
          <p class="text-caption text-grey mb-0">Perfil del Candidato</p>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-2">Cargando perfil del candidato...</p>
      </v-card-text>

      <v-card-text v-else-if="candidateProfile">
        <!-- Contact Information -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-card-account-details</v-icon>
            Información de Contacto
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <strong>Nombre Completo:</strong><br>
                  {{ candidateProfile.first_name }} {{ candidateProfile.last_name }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <strong>Email:</strong><br>
                  <a :href="`mailto:${candidateProfile.email}`">{{ candidateProfile.email }}</a>
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="candidateProfile.phone">
                <div class="mb-2">
                  <strong>Teléfono:</strong><br>
                  <a :href="`tel:${candidateProfile.phone}`">{{ candidateProfile.phone }}</a>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <strong>Total Aplicaciones:</strong><br>
                  {{ candidateProfile.applications?.length || 0 }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Application History -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-history</v-icon>
            Historial de Aplicaciones
          </v-card-title>
          <v-card-text>
            <div v-if="!candidateProfile.applications || candidateProfile.applications.length === 0">
              <v-alert type="info" variant="tonal">
                No hay aplicaciones registradas para este candidato.
              </v-alert>
            </div>
            
            <v-timeline v-else density="compact">
              <v-timeline-item
                v-for="(application, index) in candidateProfile.applications"
                :key="application.id"
                :dot-color="getStatusColor(application.status)"
                size="small"
              >
                <template #icon>
                  <v-icon size="small">{{ getStatusIcon(application.status) }}</v-icon>
                </template>
                
                <v-card variant="outlined" class="mb-2">
                  <v-card-text class="pb-2">
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div>
                        <h4 class="text-subtitle-1">{{ application.position_name }}</h4>
                        <p class="text-body-2 text-grey mb-1">
                          {{ application.department_name }} - {{ application.area }}
                        </p>
                      </div>
                      <v-chip
                        :color="getStatusColor(application.status)"
                        size="small"
                        label
                      >
                        {{ getStatusTitle(application.status) }}
                      </v-chip>
                    </div>
                    
                    <v-row class="text-caption text-grey">
                      <v-col cols="6">
                        <strong>Aplicó:</strong> {{ formatDate(application.created) }}
                      </v-col>
                      <v-col cols="6" v-if="application.reviewed_at">
                        <strong>Revisado:</strong> {{ formatDate(application.reviewed_at) }}
                      </v-col>
                    </v-row>

                    <!-- Document Links -->
                    <div v-if="application.resume_url || application.documents_url" class="mt-2">
                      <h5 class="text-caption text-grey">DOCUMENTOS:</h5>
                      <div class="d-flex flex-wrap gap-2">
                        <v-btn
                          v-if="application.resume_url"
                          size="small"
                          variant="outlined"
                          prepend-icon="mdi-file-document"
                          :href="application.resume_url"
                          target="_blank"
                        >
                          CV/Resume
                        </v-btn>
                        <v-btn
                          v-if="application.documents_url"
                          size="small"
                          variant="outlined"
                          prepend-icon="mdi-folder"
                          :href="application.documents_url"
                          target="_blank"
                        >
                          Documentos
                        </v-btn>
                      </div>
                    </div>

                    <!-- Status Notes -->
                    <div v-if="application.status_notes" class="mt-2">
                      <h5 class="text-caption text-grey">NOTAS:</h5>
                      <p class="text-body-2">{{ application.status_notes }}</p>
                    </div>

                    <!-- Cover Letter -->
                    <div v-if="application.cover_letter" class="mt-2">
                      <h5 class="text-caption text-grey">CARTA DE PRESENTACIÓN:</h5>
                      <p class="text-body-2">{{ application.cover_letter }}</p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>

        <!-- Candidate Statistics -->
        <v-card variant="outlined">
          <v-card-title>
            <v-icon class="me-2">mdi-chart-line</v-icon>
            Estadísticas del Candidato
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <v-card color="blue lighten-5" variant="tonal">
                  <v-card-text class="text-center">
                    <h3 class="text-h4 text-blue">{{ getApplicationCount('applied') }}</h3>
                    <p class="text-caption">Aplicaciones</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card color="purple lighten-5" variant="tonal">
                  <v-card-text class="text-center">
                    <h3 class="text-h4 text-purple">{{ getApplicationCount('interviewed') }}</h3>
                    <p class="text-caption">Entrevistas</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card color="green lighten-5" variant="tonal">
                  <v-card-text class="text-center">
                    <h3 class="text-h4 text-green">{{ getApplicationCount('hired') }}</h3>
                    <p class="text-caption">Contratado</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card color="red lighten-5" variant="tonal">
                  <v-card-text class="text-center">
                    <h3 class="text-h4 text-red">{{ getApplicationCount('rejected') }}</h3>
                    <p class="text-caption">Rechazado</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-text v-else>
        <v-alert type="error" variant="tonal">
          No se pudo cargar el perfil del candidato.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useHiringWorkflow } from '@/composables/useHiringWorkflow';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  candidateEmail: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// --- Composables ---
const { getCandidateProfile, applicationStatuses } = useHiringWorkflow();

// --- State ---
const loading = ref(false);
const candidateProfile = ref(null);

// --- Computed ---
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// --- Methods ---
const loadCandidateProfile = async () => {
  if (!props.candidateEmail) return;
  
  loading.value = true;
  try {
    candidateProfile.value = await getCandidateProfile(props.candidateEmail);
  } catch (error) {
    console.error('Error loading candidate profile:', error);
    candidateProfile.value = null;
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
};

const getStatusColor = (status) => {
  const statusConfig = applicationStatuses.find(s => s.value === status);
  return statusConfig?.color || 'grey';
};

const getStatusTitle = (status) => {
  const statusConfig = applicationStatuses.find(s => s.value === status);
  return statusConfig?.title || status;
};

const getStatusIcon = (status) => {
  const icons = {
    applied: 'mdi-account-plus',
    reviewed: 'mdi-eye',
    interviewed: 'mdi-account-voice',
    hired: 'mdi-account-check',
    rejected: 'mdi-account-remove'
  };
  return icons[status] || 'mdi-help-circle';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getApplicationCount = (status) => {
  if (!candidateProfile.value?.applications) return 0;
  return candidateProfile.value.applications.filter(app => app.status === status).length;
};

// --- Watchers ---
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.candidateEmail) {
    loadCandidateProfile();
  }
});

watch(() => props.candidateEmail, (newEmail) => {
  if (newEmail && dialog.value) {
    loadCandidateProfile();
  }
});
</script>

<style scoped>
.v-timeline-item {
  margin-bottom: 0;
}

.gap-2 {
  gap: 8px;
}
</style>