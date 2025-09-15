<template>
  <AdminLayout>
    <v-container fluid>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4">Gestión de Aplicaciones</h2>
      <div class="d-flex align-center gap-3">
        <v-chip
          v-if="selectedApplications.length > 0"
          color="primary"
          prepend-icon="mdi-check-circle"
        >
          {{ selectedApplications.length }} seleccionada(s)
        </v-chip>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="refreshApplications"
          :loading="loading"
          elevation="2"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <v-alert v-if="error" type="error" class="mb-4" :text="error.message"></v-alert>

    <!-- Filters and Search -->
    <v-card variant="outlined" class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchTerm"
              label="Buscar candidatos"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusFilterOptions"
              label="Filtrar por Estado"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="viewMode"
              :items="viewModeOptions"
              label="Vista"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              @click="clearFilters"
              variant="outlined"
              block
              prepend-icon="mdi-filter-off"
            >
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Application Statistics -->
    <v-row class="mb-4">
      <v-col v-for="stat in applicationStats" :key="stat.status" cols="6" sm="4" md="2">
        <v-card :color="stat.color" variant="tonal" class="text-center">
          <v-card-text class="py-3">
            <h3 class="text-h5">{{ stat.count }}</h3>
            <p class="text-caption">{{ stat.title }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Applications List -->
      <v-col :cols="showHiringActions ? 8 : 12">
        <!-- List View -->
        <div v-if="viewMode === 'list'">
          <v-data-table
            v-model="selectedApplications"
            :headers="tableHeaders"
            :items="filteredApplications"
            :loading="loading"
            item-value="id"
            show-select
            class="elevation-1"
          >
            <template #item.candidate_name="{ item }">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="32" class="me-3">
                  <span class="text-caption">{{ getInitials(item) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">
                    {{ item.candidate_first_name }} {{ item.candidate_last_name }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ item.candidate_email }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.position="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.position_name }}</div>
                <div class="text-caption text-grey">{{ item.area }} - {{ item.department_name }}</div>
              </div>
            </template>

            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                label
              >
                {{ getStatusTitle(item.status) }}
              </v-chip>
            </template>

            <template #item.created="{ item }">
              {{ formatDate(item.created) }}
            </template>

            <template #item.documents="{ item }">
              <div class="d-flex gap-1">
                <v-tooltip text="Ver CV/Resume" v-if="item.resume_url">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-file-document"
                      size="small"
                      variant="text"
                      :href="item.resume_url"
                      target="_blank"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Ver Documentos" v-if="item.documents_url">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-folder"
                      size="small"
                      variant="text"
                      :href="item.documents_url"
                      target="_blank"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-tooltip text="Ver Perfil Completo">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-account"
                      size="small"
                      variant="text"
                      @click="viewCandidateProfile(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      size="small"
                      variant="text"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="quickStatusChange(item, 'reviewed')">
                      <v-list-item-title>Marcar Revisado</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="quickStatusChange(item, 'interviewed')">
                      <v-list-item-title>Marcar Entrevistado</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="quickHire(item)" class="text-success">
                      <v-list-item-title>Contratar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="quickReject(item)" class="text-error">
                      <v-list-item-title>Rechazar</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>
        </div>

        <!-- Card View -->
        <div v-else-if="viewMode === 'cards'">
          <v-row>
            <v-col
              v-for="application in filteredApplications"
              :key="application.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="application-card"
                :class="{ 'selected': selectedApplications.some(app => app.id === application.id) }"
                @click="toggleSelection(application)"
                variant="outlined"
              >
                <v-card-item>
                  <div class="d-flex justify-space-between align-start">
                    <div class="d-flex align-center">
                      <v-avatar color="primary" size="40" class="me-3">
                        <span class="text-h6">{{ getInitials(application) }}</span>
                      </v-avatar>
                      <div>
                        <v-card-title class="pa-0 text-wrap">
                          {{ application.candidate_first_name }} {{ application.candidate_last_name }}
                        </v-card-title>
                        <v-card-subtitle class="pa-0">
                          {{ application.candidate_email }}
                        </v-card-subtitle>
                      </div>
                    </div>
                    <v-checkbox
                      :model-value="selectedApplications.some(app => app.id === application.id)"
                      @update:model-value="toggleSelection(application)"
                      color="primary"
                      hide-details
                    ></v-checkbox>
                  </div>
                </v-card-item>

                <v-card-text>
                  <div class="mb-2">
                    <strong>Posición:</strong> {{ application.position_name }}<br>
                    <strong>Área:</strong> {{ application.area }} - {{ application.department_name }}
                  </div>
                  
                  <div class="mb-2">
                    <strong>Aplicó:</strong> {{ formatDate(application.created) }}
                  </div>

                  <div class="d-flex justify-space-between align-center">
                    <v-chip
                      :color="getStatusColor(application.status)"
                      size="small"
                      label
                    >
                      {{ getStatusTitle(application.status) }}
                    </v-chip>
                    
                    <div class="d-flex gap-1">
                      <v-tooltip text="Ver Perfil">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-account"
                            size="small"
                            variant="text"
                            @click.stop="viewCandidateProfile(application)"
                          ></v-btn>
                        </template>
                      </v-tooltip>
                      
                      <v-btn
                        v-if="application.resume_url"
                        icon="mdi-file-document"
                        size="small"
                        variant="text"
                        :href="application.resume_url"
                        target="_blank"
                        @click.stop
                      ></v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Grouped by Position View -->
        <div v-else-if="viewMode === 'grouped'">
          <div v-for="(group, positionId) in groupedApplications" :key="positionId" class="mb-6">
            <v-card variant="outlined">
              <v-card-title class="bg-grey-lighten-4">
                <div class="d-flex justify-space-between align-center w-100">
                  <div>
                    <h3>{{ group.position_name }}</h3>
                    <p class="text-caption text-grey mb-0">
                      {{ group.area }} - {{ group.department_name }} | {{ group.salary_range }}
                    </p>
                  </div>
                  <v-chip color="primary" size="small">
                    {{ group.applications.length }} candidato(s)
                  </v-chip>
                </div>
              </v-card-title>
              
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="application in group.applications"
                    :key="application.id"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-card variant="tonal" class="application-mini-card">
                      <v-card-item>
                        <div class="d-flex justify-space-between align-center">
                          <div class="d-flex align-center">
                            <v-avatar color="primary" size="32" class="me-2">
                              <span class="text-caption">{{ getInitials(application) }}</span>
                            </v-avatar>
                            <div>
                              <div class="font-weight-medium">
                                {{ application.candidate_first_name }} {{ application.candidate_last_name }}
                              </div>
                              <div class="text-caption text-grey">
                                {{ formatDate(application.created) }}
                              </div>
                            </div>
                          </div>
                          <v-checkbox
                            :model-value="selectedApplications.some(app => app.id === application.id)"
                            @update:model-value="toggleSelection(application)"
                            color="primary"
                            hide-details
                            density="compact"
                          ></v-checkbox>
                        </div>
                      </v-card-item>
                      <v-card-actions class="pt-0">
                        <v-chip
                          :color="getStatusColor(application.status)"
                          size="x-small"
                          label
                        >
                          {{ getStatusTitle(application.status) }}
                        </v-chip>
                        <v-spacer></v-spacer>
                        <v-btn
                          icon="mdi-account"
                          size="x-small"
                          variant="text"
                          @click="viewCandidateProfile(application)"
                        ></v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- Empty State -->
        <v-alert v-if="!loading && filteredApplications.length === 0" type="info" class="mt-4">
          <div class="text-center">
            <v-icon size="48" class="mb-2">mdi-account-search</v-icon>
            <h3>No hay aplicaciones que mostrar</h3>
            <p v-if="searchTerm || statusFilter">
              Intente ajustar sus filtros de búsqueda.
            </p>
            <p v-else>
              Las aplicaciones aparecerán aquí cuando los candidatos se postule en las posiciones abiertas.
            </p>
          </div>
        </v-alert>
      </v-col>

      <!-- Hiring Actions Panel -->
      <v-col v-if="showHiringActions" cols="4">
        <HiringActions
          :selected-applications="selectedApplications"
          @refresh="refreshApplications"
          @candidate-hired="onCandidateHired"
          @candidate-rejected="onCandidateRejected"
        />
      </v-col>
    </v-row>

    <!-- Candidate Profile Dialog -->
    <CandidateProfile
      v-model="profileDialog"
      :candidate-email="selectedCandidateEmail"
    />
    </v-container>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useHiringWorkflow } from '@/composables/useHiringWorkflow';
import AdminLayout from '@/layouts/AdminLayout.vue';
import HiringActions from '@/components/HiringActions.vue';
import CandidateProfile from '@/components/CandidateProfile.vue';

// --- Composables and State ---
const {
  applications,
  loading,
  error,
  applicationStatuses,
  fetchApplications,
  fetchApplicationsByPosition,
  getApplicationStats
} = useHiringWorkflow();

// UI State
const selectedApplications = ref([]);
const searchTerm = ref('');
const statusFilter = ref('');
const viewMode = ref('list');
const profileDialog = ref(false);
const selectedCandidateEmail = ref('');

// --- Computed Properties ---
const showHiringActions = computed(() => selectedApplications.value.length > 0);

const statusFilterOptions = computed(() => [
  { title: 'Todos los Estados', value: '' },
  ...applicationStatuses.map(status => ({
    title: status.title,
    value: status.value
  }))
]);

const viewModeOptions = [
  { title: 'Lista', value: 'list' },
  { title: 'Tarjetas', value: 'cards' },
  { title: 'Agrupado por Posición', value: 'grouped' }
];

const tableHeaders = [
  { title: 'Candidato', key: 'candidate_name', sortable: true },
  { title: 'Posición', key: 'position', sortable: false },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Fecha Aplicación', key: 'created', sortable: true },
  { title: 'Documentos', key: 'documents', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false }
];

const filteredApplications = computed(() => {
  let filtered = applications.value;

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(app => 
      app.candidate_first_name?.toLowerCase().includes(term) ||
      app.candidate_last_name?.toLowerCase().includes(term) ||
      app.candidate_email?.toLowerCase().includes(term) ||
      app.position_name?.toLowerCase().includes(term) ||
      app.area?.toLowerCase().includes(term)
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter(app => app.status === statusFilter.value);
  }

  return filtered;
});

const groupedApplications = computed(() => {
  const grouped = {};
  filteredApplications.value.forEach(app => {
    const positionId = app.open_position;
    if (!grouped[positionId]) {
      grouped[positionId] = {
        position_name: app.position_name,
        department_name: app.department_name,
        area: app.area,
        salary_range: app.salary_range,
        applications: []
      };
    }
    grouped[positionId].applications.push(app);
  });
  return grouped;
});

const applicationStats = computed(() => {
  const stats = getApplicationStats();
  return applicationStatuses.map(status => ({
    ...status,
    count: stats.by_status[status.value] || 0
  }));
});

// --- Methods ---
const refreshApplications = async () => {
  try {
    await fetchApplications();
    selectedApplications.value = [];
  } catch (error) {
    console.error('Failed to refresh applications:', error);
  }
};

const clearFilters = () => {
  searchTerm.value = '';
  statusFilter.value = '';
};

const toggleSelection = (application) => {
  const index = selectedApplications.value.findIndex(app => app.id === application.id);
  if (index === -1) {
    selectedApplications.value.push(application);
  } else {
    selectedApplications.value.splice(index, 1);
  }
};

const getInitials = (application) => {
  const first = application.candidate_first_name?.[0] || '';
  const last = application.candidate_last_name?.[0] || '';
  return (first + last).toUpperCase() || '??';
};

const getStatusColor = (status) => {
  const statusConfig = applicationStatuses.find(s => s.value === status);
  return statusConfig?.color || 'grey';
};

const getStatusTitle = (status) => {
  const statusConfig = applicationStatuses.find(s => s.value === status);
  return statusConfig?.title || status;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const viewCandidateProfile = (application) => {
  selectedCandidateEmail.value = application.candidate_email;
  profileDialog.value = true;
};

const quickStatusChange = async (application, newStatus) => {
  // This would be handled by the HiringActions component
  selectedApplications.value = [application];
};

const quickHire = (application) => {
  selectedApplications.value = [application];
  // Trigger hire action
};

const quickReject = (application) => {
  selectedApplications.value = [application];
  // Trigger reject action
};

const onCandidateHired = (application) => {
  selectedApplications.value = [];
  // Optionally show success message
};

const onCandidateRejected = (applications) => {
  selectedApplications.value = [];
  // Optionally show success message
};

// --- Lifecycle Hooks ---
onMounted(() => {
  refreshApplications();
});
</script>

<style scoped>
.application-card {
  cursor: pointer;
  transition: all 0.2s;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}

.application-card.selected {
  border: 2px solid rgb(var(--v-theme-primary));
}

.application-mini-card {
  height: 100%;
}

.gap-1 {
  gap: 4px;
}

.gap-3 {
  gap: 12px;
}
</style>