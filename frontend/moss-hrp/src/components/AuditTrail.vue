<template>
  <v-card class="audit-trail-card" elevation="1">
    <v-card-title class="bg-grey-lighten-4">
      <v-icon start>mdi-history</v-icon>
      Audit Trail
      <v-spacer />
      <v-btn
        icon="mdi-refresh"
        size="small"
        variant="text"
        @click="refreshAuditLogs"
        :loading="loading"
      />
    </v-card-title>

    <v-card-text class="pa-0">
      <div v-if="loading && auditLogs.length === 0" class="text-center pa-4">
        <v-progress-circular indeterminate />
        <div class="text-caption mt-2">Loading audit trail...</div>
      </div>

      <div v-else-if="auditLogs.length === 0" class="text-center pa-4 text-medium-emphasis">
        <v-icon size="48" color="grey-lighten-1">mdi-clipboard-text-off</v-icon>
        <div class="text-subtitle-2 mt-2">No audit entries found</div>
        <div class="text-caption">All reconciliation actions will appear here</div>
      </div>

      <v-timeline v-else side="end" density="compact" class="audit-timeline">
        <v-timeline-item
          v-for="log in auditLogs"
          :key="log.id"
          :dot-color="getActionColor(log.action)"
          size="small"
          class="audit-timeline-item"
        >
          <template #icon>
            <v-icon :color="getActionColor(log.action)" size="small">
              {{ getActionIcon(log.action) }}
            </v-icon>
          </template>

          <v-card variant="tonal" :color="getActionColor(log.action)" class="audit-card">
            <v-card-text class="py-2">
              <div class="d-flex justify-space-between align-center">
                <div class="audit-action">
                  <span class="font-weight-medium">{{ getActionDescription(log) }}</span>
                  <div class="text-caption text-medium-emphasis mt-1">
                    by {{ log.expand?.user?.name || 'System' }}
                  </div>
                </div>
                <div class="audit-timestamp">
                  <v-chip size="x-small" :color="getActionColor(log.action)" variant="outlined">
                    {{ formatTimestamp(log.created) }}
                  </v-chip>
                </div>
              </div>

              <!-- Action details -->
              <div v-if="log.details" class="audit-details mt-2">
                <v-expansion-panels variant="accordion" class="audit-expansion">
                  <v-expansion-panel>
                    <v-expansion-panel-title class="text-caption">
                      <v-icon start size="small">mdi-information</v-icon>
                      Details
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="text-caption">
                      <pre class="audit-details-content">{{ formatDetails(log.details) }}</pre>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Employee-specific information -->
              <div v-if="log.employee_id" class="mt-2">
                <v-chip size="small" color="primary" variant="outlined">
                  <v-icon start size="x-small">mdi-account</v-icon>
                  {{ log.expand?.employee?.name || `Employee #${log.employee_id}` }}
                </v-chip>
              </div>

              <!-- Reconciliation impact -->
              <div v-if="log.before_value || log.after_value" class="audit-values mt-2">
                <v-row dense>
                  <v-col cols="6" v-if="log.before_value">
                    <div class="text-caption text-medium-emphasis">Before</div>
                    <v-chip size="small" color="error" variant="tonal">
                      {{ log.before_value }}h
                    </v-chip>
                  </v-col>
                  <v-col cols="6" v-if="log.after_value">
                    <div class="text-caption text-medium-emphasis">After</div>
                    <v-chip size="small" color="success" variant="tonal">
                      {{ log.after_value }}h
                    </v-chip>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center pa-3">
        <v-btn
          variant="outlined"
          color="primary"
          @click="loadMoreLogs"
          :loading="loadingMore"
          size="small"
        >
          Load More Entries
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { pb } from '@/composables/usePocketbase'

const props = defineProps({
  reconciliationId: { type: String, required: true },
  employeeId: { type: String, default: null }, // Optional: filter by employee
})

// Local state
const auditLogs = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 20

// Computed properties
const hasMore = computed(() => currentPage.value < totalPages.value)

// Methods
async function loadAuditLogs(page = 1, append = false) {
  if (page === 1) loading.value = true
  else loadingMore.value = true

  try {
    let filter = `reconciliation_id="${props.reconciliationId}"`
    if (props.employeeId) {
      filter += ` && employee_id="${props.employeeId}"`
    }

    const result = await pb.collection('audit_logs').getList(page, pageSize, {
      filter,
      sort: '-created',
      expand: 'user,employee',
    })

    if (append) {
      auditLogs.value.push(...result.items)
    } else {
      auditLogs.value = result.items
    }

    currentPage.value = result.page
    totalPages.value = result.totalPages
  } catch (error) {
    console.error('Failed to load audit logs:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function refreshAuditLogs() {
  await loadAuditLogs(1, false)
}

async function loadMoreLogs() {
  await loadAuditLogs(currentPage.value + 1, true)
}

function getActionColor(action) {
  const colors = {
    'reconciliation_started': 'info',
    'hours_approved': 'success',
    'hours_modified': 'warning',
    'justification_added': 'orange',
    'bulk_approved': 'success',
    'discrepancy_resolved': 'success',
    'reconciliation_completed': 'success',
    'reconciliation_rejected': 'error',
    'system_correction': 'purple',
  }
  return colors[action] || 'grey'
}

function getActionIcon(action) {
  const icons = {
    'reconciliation_started': 'mdi-play-circle',
    'hours_approved': 'mdi-check-circle',
    'hours_modified': 'mdi-pencil-circle',
    'justification_added': 'mdi-text-box',
    'bulk_approved': 'mdi-checkbox-multiple-marked-circle',
    'discrepancy_resolved': 'mdi-check-decagram',
    'reconciliation_completed': 'mdi-check-all',
    'reconciliation_rejected': 'mdi-close-circle',
    'system_correction': 'mdi-robot',
  }
  return icons[action] || 'mdi-circle'
}

function getActionDescription(log) {
  const descriptions = {
    'reconciliation_started': 'Reconciliation process initiated',
    'hours_approved': 'Hours approved for employee',
    'hours_modified': 'Hours manually modified',
    'justification_added': 'Justification provided for discrepancy',
    'bulk_approved': 'Bulk approval performed',
    'discrepancy_resolved': 'Discrepancy marked as resolved',
    'reconciliation_completed': 'Reconciliation process completed',
    'reconciliation_rejected': 'Reconciliation rejected',
    'system_correction': 'System automatic correction applied',
  }
  
  let description = descriptions[log.action] || log.action
  
  if (log.employee_id && log.expand?.employee?.name) {
    description += ` for ${log.expand.employee.name}`
  }
  
  return description
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  
  // Less than 1 minute
  if (diffMs < 60000) {
    return 'Just now'
  }
  
  // Less than 1 hour
  if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000)
    return `${minutes}m ago`
  }
  
  // Less than 24 hours
  if (diffMs < 86400000) {
    const hours = Math.floor(diffMs / 3600000)
    return `${hours}h ago`
  }
  
  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDetails(details) {
  if (typeof details === 'string') {
    try {
      return JSON.stringify(JSON.parse(details), null, 2)
    } catch {
      return details
    }
  }
  return JSON.stringify(details, null, 2)
}

// Lifecycle
onMounted(() => {
  loadAuditLogs()
})

// Expose methods for parent component
defineExpose({
  refreshAuditLogs,
  loadAuditLogs,
})
</script>

<style scoped>
.audit-trail-card {
  max-height: 600px;
  overflow: hidden;
}

.audit-timeline {
  max-height: 500px;
  overflow-y: auto;
  padding: 0 16px;
}

.audit-timeline-item {
  margin-bottom: 8px;
}

.audit-card {
  margin-bottom: 8px;
  border-radius: 8px;
}

.audit-action {
  flex: 1;
}

.audit-timestamp {
  flex-shrink: 0;
  margin-left: 12px;
}

.audit-details {
  margin-top: 8px;
}

.audit-expansion {
  box-shadow: none;
}

.audit-expansion :deep(.v-expansion-panel) {
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.audit-expansion :deep(.v-expansion-panel-title) {
  padding: 8px 12px;
  min-height: 36px;
}

.audit-expansion :deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 12px;
}

.audit-details-content {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
}

.audit-values {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 8px;
}
</style>