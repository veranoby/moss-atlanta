<template>
  <v-card variant="outlined" class="hiring-actions">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-account-check</v-icon>
      Acciones de Contratación
    </v-card-title>

    <v-card-text>
      <div v-if="selectedApplications.length === 0" class="text-center py-4">
        <v-icon size="48" color="grey">mdi-information-outline</v-icon>
        <p class="text-grey mt-2">Seleccione aplicaciones para ver las acciones disponibles</p>
      </div>

      <div v-else>
        <div class="mb-4">
          <v-chip color="primary" class="me-2">
            {{ selectedApplications.length }} aplicación(es) seleccionada(s)
          </v-chip>
        </div>

        <!-- Individual Actions (only when 1 selected) -->
        <div v-if="selectedApplications.length === 1" class="mb-4">
          <h3 class="text-h6 mb-3">Acciones Individuales</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-btn
                color="success"
                variant="elevated"
                block
                prepend-icon="mdi-account-plus"
                @click="openHireDialog"
                :loading="hiring"
              >
                Contratar Candidato
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn
                color="error"
                variant="outlined"
                block
                prepend-icon="mdi-account-remove"
                @click="openRejectDialog"
              >
                Rechazar Candidato
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Bulk Actions -->
        <div class="mb-4">
          <h3 class="text-h6 mb-3">Acciones Masivas</h3>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-btn
                color="blue"
                variant="outlined"
                block
                size="small"
                @click="bulkUpdateStatus('reviewed')"
                :loading="bulkUpdating"
              >
                Marcar Revisado
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-btn
                color="purple"
                variant="outlined"
                block
                size="small"
                @click="bulkUpdateStatus('interviewed')"
                :loading="bulkUpdating"
              >
                Marcar Entrevistado
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-btn
                color="success"
                variant="outlined"
                block
                size="small"
                @click="openBulkHireDialog"
                :loading="bulkUpdating"
              >
                Contratación Masiva
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-btn
                color="error"
                variant="outlined"
                block
                size="small"
                @click="openBulkRejectDialog"
                :loading="bulkUpdating"
              >
                Rechazo Masivo
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Status Change with Notes -->
        <div>
          <h3 class="text-h6 mb-3">Cambiar Estado</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedStatus"
                :items="applicationStatuses"
                item-title="title"
                item-value="value"
                label="Nuevo Estado"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn
                color="primary"
                @click="openStatusChangeDialog"
                :disabled="!selectedStatus"
                block
              >
                Cambiar Estado
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-card-text>

    <!-- Hire Dialog -->
    <v-dialog v-model="hireDialog" max-width="600px">
      <v-card>
        <v-card-title>Contratar Candidato</v-card-title>
        <v-card-text>
          <v-form ref="hireForm" v-model="hireFormValid">
            <div v-if="selectedApplications[0]" class="mb-4">
              <h4>Candidato:</h4>
              <p>{{ selectedApplications[0].candidate_first_name }} {{ selectedApplications[0].candidate_last_name }}</p>
              <p>{{ selectedApplications[0].candidate_email }}</p>
            </div>

            <v-text-field
              v-model="hireData.employee_id"
              label="ID de Empleado"
              :rules="[rules.required]"
              variant="outlined"
              density="compact"
            ></v-text-field>

            <v-text-field
              v-model="hireData.salary"
              label="Salario"
              type="number"
              prefix="$"
              :rules="[rules.required, rules.positiveNumber]"
              variant="outlined"
              density="compact"
            ></v-text-field>

            <v-text-field
              v-model="hireData.start_date"
              label="Fecha de Inicio"
              type="date"
              :rules="[rules.required]"
              variant="outlined"
              density="compact"
            ></v-text-field>

            <v-checkbox
              v-model="hireData.fills_position"
              label="Esta contratación llena completamente la posición"
              color="primary"
            ></v-checkbox>

            <v-textarea
              v-model="hireData.notes"
              label="Notas de Contratación"
              rows="3"
              variant="outlined"
              density="compact"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="hireDialog = false">Cancelar</v-btn>
          <v-btn
            color="success"
            @click="confirmHire"
            :loading="hiring"
            :disabled="!hireFormValid"
          >
            Contratar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500px">
      <v-card>
        <v-card-title>Rechazar Candidato(s)</v-card-title>
        <v-card-text>
          <p>¿Está seguro que desea rechazar {{ selectedApplications.length === 1 ? 'este candidato' : 'estos candidatos' }}?</p>
          <v-textarea
            v-model="rejectReason"
            label="Motivo del Rechazo"
            rows="3"
            variant="outlined"
            density="compact"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="rejectDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            @click="confirmReject"
            :loading="rejecting"
          >
            Rechazar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Status Change Dialog -->
    <v-dialog v-model="statusDialog" max-width="500px">
      <v-card>
        <v-card-title>Cambiar Estado</v-card-title>
        <v-card-text>
          <p>Cambiar estado de {{ selectedApplications.length }} aplicación(es) a: 
            <strong>{{ applicationStatuses.find(s => s.value === selectedStatus)?.title }}</strong>
          </p>
          <v-textarea
            v-model="statusNotes"
            label="Notas del Cambio"
            rows="3"
            variant="outlined"
            density="compact"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="statusDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="confirmStatusChange"
            :loading="statusUpdating"
          >
            Cambiar Estado
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Messages -->
    <v-snackbar
      v-model="showMessage"
      :color="messageType"
      timeout="3000"
    >
      {{ message }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHiringWorkflow } from '@/composables/useHiringWorkflow';

const props = defineProps({
  selectedApplications: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['refresh', 'candidate-hired', 'candidate-rejected']);

// --- Composables ---
const { 
  applicationStatuses,
  updateApplicationStatus,
  bulkUpdateApplications,
  hireCandidate,
  rejectCandidate
} = useHiringWorkflow();

// --- State ---
const hiring = ref(false);
const rejecting = ref(false);
const bulkUpdating = ref(false);
const statusUpdating = ref(false);

// Dialog states
const hireDialog = ref(false);
const rejectDialog = ref(false);
const statusDialog = ref(false);

// Form data
const hireFormValid = ref(false);
const hireData = ref({
  employee_id: '',
  salary: '',
  start_date: new Date().toISOString().split('T')[0],
  fills_position: false,
  notes: ''
});

const rejectReason = ref('');
const selectedStatus = ref('');
const statusNotes = ref('');

// Messages
const showMessage = ref(false);
const message = ref('');
const messageType = ref('success');

// Form refs
const hireForm = ref(null);

// --- Validation Rules ---
const rules = {
  required: value => !!value || 'Este campo es requerido',
  positiveNumber: value => value > 0 || 'Debe ser un número positivo'
};

// --- Methods ---
const showNotification = (msg, type = 'success') => {
  message.value = msg;
  messageType.value = type;
  showMessage.value = true;
};

const openHireDialog = () => {
  hireData.value = {
    employee_id: '',
    salary: '',
    start_date: new Date().toISOString().split('T')[0],
    fills_position: false,
    notes: ''
  };
  hireDialog.value = true;
};

const openRejectDialog = () => {
  rejectReason.value = '';
  rejectDialog.value = true;
};

const openBulkHireDialog = () => {
  // For bulk hiring, we might want a different dialog or approach
  showNotification('Función de contratación masiva en desarrollo', 'info');
};

const openBulkRejectDialog = () => {
  rejectReason.value = '';
  rejectDialog.value = true;
};

const openStatusChangeDialog = () => {
  statusNotes.value = '';
  statusDialog.value = true;
};

const confirmHire = async () => {
  if (!hireForm.value) return;
  const { valid } = await hireForm.value.validate();
  if (!valid) return;

  hiring.value = true;
  try {
    const application = props.selectedApplications[0];
    await hireCandidate(application.id, hireData.value);
    
    showNotification('Candidato contratado exitosamente');
    emit('candidate-hired', application);
    emit('refresh');
    hireDialog.value = false;
  } catch (error) {
    console.error('Hire error:', error);
    showNotification('Error al contratar candidato', 'error');
  } finally {
    hiring.value = false;
  }
};

const confirmReject = async () => {
  rejecting.value = true;
  try {
    if (props.selectedApplications.length === 1) {
      await rejectCandidate(props.selectedApplications[0].id, rejectReason.value);
    } else {
      await bulkUpdateApplications(
        props.selectedApplications.map(app => app.id),
        'rejected',
        rejectReason.value
      );
    }
    
    showNotification(`${props.selectedApplications.length} candidato(s) rechazado(s)`);
    emit('candidate-rejected', props.selectedApplications);
    emit('refresh');
    rejectDialog.value = false;
  } catch (error) {
    console.error('Reject error:', error);
    showNotification('Error al rechazar candidato(s)', 'error');
  } finally {
    rejecting.value = false;
  }
};

const bulkUpdateStatus = async (status) => {
  bulkUpdating.value = true;
  try {
    await bulkUpdateApplications(
      props.selectedApplications.map(app => app.id),
      status,
      `Estado cambiado masivamente a ${status}`
    );
    
    const statusTitle = applicationStatuses.find(s => s.value === status)?.title;
    showNotification(`${props.selectedApplications.length} aplicación(es) marcada(s) como ${statusTitle}`);
    emit('refresh');
  } catch (error) {
    console.error('Bulk update error:', error);
    showNotification('Error en actualización masiva', 'error');
  } finally {
    bulkUpdating.value = false;
  }
};

const confirmStatusChange = async () => {
  statusUpdating.value = true;
  try {
    await bulkUpdateApplications(
      props.selectedApplications.map(app => app.id),
      selectedStatus.value,
      statusNotes.value
    );
    
    const statusTitle = applicationStatuses.find(s => s.value === selectedStatus.value)?.title;
    showNotification(`Estado cambiado a ${statusTitle} para ${props.selectedApplications.length} aplicación(es)`);
    emit('refresh');
    statusDialog.value = false;
  } catch (error) {
    console.error('Status change error:', error);
    showNotification('Error al cambiar estado', 'error');
  } finally {
    statusUpdating.value = false;
  }
};
</script>

<style scoped>
.hiring-actions {
  position: sticky;
  top: 20px;
}
</style>