# MOSS ATLANTA - Claude Code Development Instructions

## **PROJECT CONTEXT**
- **Company**: MOSS Atlanta (staffing hotelero, ~400 empleados, 20→40+ hoteles)
- **Mission**: Transform manual processes → automated scalable operations
- **Timeline**: 50 días desarrollo (32 código + 20 infraestructura)

## **CORE ARCHITECTURE (NO CAMBIAR)**

### **Technology Stack Finalizado**
- **Database**: Pocketbase (21 colecciones, SQLite, puerto 8080)
- **Automation**: n8n auto-alojado (puerto 5678) + Gemini 2.5 Pro
- **Frontend Admin**: Vue.js 3 + Composition API + Vuetify 3 + Pinia + i18n
- **Mobile**: React Native + Expo.dev + Gluestack UI
- **Infrastructure**: VPS Hetzner CX11 ($4.50/mes)
- **AI**: OpenRouter + Gemini 2.5 Pro ($3-5/mes)

### **Decisions Técnicas Cerradas**
- ✅ **SSE** (no WebSockets) para real-time updates
- ✅ **OneDrive** para documentos + Pocketbase metadatos únicamente
- ✅ **GPS + Photo fallback** para punch validation
- ✅ **Virtual scrolling** obligatorio (400+ empleados)
- ✅ **3-column reconciliation modal** (diseño crítico)

---

## **JSON WORK PLAN EXECUTION**

### **How to Follow JSON Instructions**
When receiving a JSON work plan:

1. **Read complete JSON first** - understand full scope
2. **Follow order specified** in task_decomposition
3. **Implement tests FIRST** from tdd_specification
4. **Use exact patterns** from context_injection
5. **Validate against** success_criteria continuously

### **MOSS Context Awareness**
Always apply these business rules from JSON context:
- **work_date logic**: Use clock_in date (even if clock_out next day)
- **4-punch sequence**: Enforce order (clock_in → break_start → break_end → clock_out)
- **Virtual scrolling**: Required for 400+ employee lists
- **3-column reconciliation**: Critical UI pattern (Hotel|MOSS|Final)

---

## **DEVELOPMENT STANDARDS**

### **Vue.js 3 Conventions**
```javascript
// Composition API REQUIRED
<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// Pinia store usage
const { user, isLoading } = storeToRefs(useAuthStore())

// Naming: camelCase variables, PascalCase components
const isModalOpen = ref(false)
const employeeList = ref([])
</script>

// Vuetify 3 components ONLY
<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="isLoading"
    class="elevation-1"
  >
    <template #item.actions="{ item }">
      <v-btn @click="editItem(item)">Edit</v-btn>
    </template>
  </v-data-table>
</template>
```

### **Pocketbase Integration Pattern**
```javascript
// composables/usePocketbase.js REQUIRED for all API calls
import { pb } from '@/plugins/pocketbase'

// Always use reactive data
const employees = ref([])
const loading = ref(false)

const fetchEmployees = async () => {
  loading.value = true
  try {
    const records = await pb.collection('employees').getFullList({
      expand: 'assignments.hotel,assignments.position'
    })
    employees.value = records
  } catch (error) {
    console.error('Error fetching employees:', error)
  } finally {
    loading.value = false
  }
}
```

### **File Structure REQUIRED**
```
src/
├── components/          # Reusable components
│   ├── DataTable.vue   # Standard table component
│   ├── FormModal.vue   # CRUD modal
│   └── BulkActions.vue # Multi-select operations
├── views/              # Page components  
│   ├── employees/      # Employee management
│   ├── reconciliation/ # 3-column modal
│   └── dashboard/      # Role-based tabs
├── composables/        # Business logic
│   ├── usePocketbase.js
│   ├── useAuth.js
│   └── useReconciliation.js
├── stores/             # Pinia stores
│   ├── auth.js
│   ├── employees.js
│   └── reconciliation.js
└── plugins/
    └── pocketbase.js   # PB client setup
```

## **BUSINESS LOGIC CRÍTICO**

### **work_date Logic (Horarios Nocturnos)**
```javascript
// ALWAYS use clock_in date for work_date
const calculateWorkDate = (clockInTime) => {
  const date = new Date(clockInTime)
  // Work date = clock-in date (even if clock-out is next day)
  return date.toISOString().split('T')[0]
}
```

### **4-Punch Cycle Validation**
```javascript
// Mobile app MUST enforce sequence
const punchTypes = ['clock_in', 'break_start', 'break_end', 'clock_out']
const validatePunchSequence = (existingPunches, newPunchType) => {
  const lastPunch = existingPunches[existingPunches.length - 1]
  const currentIndex = punchTypes.indexOf(newPunchType)
  const lastIndex = lastPunch ? punchTypes.indexOf(lastPunch.type) : -1
  
  return currentIndex === lastIndex + 1
}
```

### **GPS Validation + Photo Fallback**
```javascript
// GPS first, photo if GPS fails
const validateLocation = async (hotelLocation) => {
  try {
    const position = await getCurrentPosition()
    const distance = calculateDistance(position, hotelLocation)
    return distance <= 100 // 100 meters radius
  } catch (gpsError) {
    // Fallback to photo requirement
    return { requirePhoto: true, reason: 'GPS unavailable' }
  }
}
```

## **COMPONENT PATTERNS**

### **DataTable.vue Standard**
```vue
<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    :search="search"
    class="elevation-1"
  >
    <template #top>
      <v-toolbar flat>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        />
        <v-spacer />
        <v-btn @click="openCreateDialog">
          <v-icon>mdi-plus</v-icon>
          Add New
        </v-btn>
      </v-toolbar>
    </template>
  </v-data-table>
</template>
```

### **3-Column Reconciliation Modal (CRÍTICO)**
```vue
<template>
  <v-dialog v-model="dialog" max-width="1200px">
    <v-card>
      <v-card-title>Reconciliation</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4">
            <h3>Hotel Report</h3>
            <!-- Hotel data -->
          </v-col>
          <v-col cols="4">
            <h3>MOSS Time</h3>
            <!-- App data -->
          </v-col>
          <v-col cols="4">
            <h3>Final Hours</h3>
            <!-- Reconciled data -->
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
```

## **MOBILE DEVELOPMENT (React Native + Expo)**

### **MOSS Time App Structure**
```javascript
// App.js - Main navigation
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Required screens:
// - AuthScreen (login)
// - PunchScreen (4-button interface)  
// - HistoryScreen (personal timesheet)

// Gluestack UI components ONLY
import { Button, VStack, HStack } from '@gluestack-ui/themed'
```

### **Punch Flow Pattern**
```javascript
const PunchScreen = () => {
  const [currentStep, setCurrentStep] = useState('clock_in')
  const [location, setLocation] = useState(null)
  
  const handlePunch = async (type) => {
    // 1. Validate sequence
    // 2. Get GPS or require photo
    // 3. Submit to Pocketbase
    // 4. Store offline if no network
  }
}
```

## **n8n WORKFLOW PATTERNS**

### **AI Processing Standard**
```javascript
// OpenRouter + Gemini 2.5 Pro
const prompt = `Extract timesheet data from this hotel report.
Return JSON format:
{
  "employees": [
    {
      "name": "string",
      "date": "YYYY-MM-DD", 
      "clock_in": "HH:MM",
      "break_start": "HH:MM",
      "break_end": "HH:MM", 
      "clock_out": "HH:MM"
    }
  ]
}`
```

## **POCKETBASE COLLECTIONS**

### **Critical Collections (21 total)**
- **employees**: Main employee data (400+ records)
- **punches**: Time tracking data (1M+ records/month)
- **payroll_periods**: Workflow orchestrator
- **reconciliations**: Hotel vs MOSS comparison
- **audit_logs**: Immutable compliance trail

### **Virtual Scrolling REQUIRED**
```javascript
// For 400+ employees, use virtual scrolling
<v-virtual-scroll
  :items="employees"
  :item-height="56"
  height="400"
>
  <template #default="{ item }">
    <EmployeeCard :employee="item" />
  </template>
</v-virtual-scroll>
```

## **PERFORMANCE REQUIREMENTS**
- **Admin portal**: < 3 seconds page load (50 hoteles)
- **Mobile app**: < 1 second punch submission  
- **Reconciliation modal**: < 5 seconds load
- **Virtual scrolling**: Handle 400+ items smoothly

## **SECURITY PATTERNS**
- **Authentication**: Pocketbase JWT only
- **Sensitive data**: OneDrive storage, Pocketbase metadata only
- **Audit trail**: Log all critical actions to audit_logs
- **Role-based access**: Database-level permissions

## **DEPLOYMENT TARGETS**
- **VPS**: Hetzner CX11 (1 vCPU, 2GB RAM)
- **Mobile**: Expo EAS Build (30 builds/month free)
- **Web**: nginx reverse proxy
- **SSL**: Cloudflare or Let's Encrypt

## **TESTING REQUIREMENTS**
- **Unit tests**: Critical business logic
- **Integration tests**: Pocketbase API calls
- **E2E tests**: 4-punch mobile flow
- **Performance tests**: 400+ employees virtual scrolling

## **ERROR HANDLING**
```javascript
// Standard error pattern
try {
  const result = await pb.collection('employees').create(data)
  return { success: true, data: result }
} catch (error) {
  console.error('Employee creation failed:', error)
  return { 
    success: false, 
    error: error.message,
    code: error.status 
  }
}
```

## **BRAIN FILE INTEGRATION**
- **Query before coding**: Check `./brain/sdd_system.json` + `backlog.json`
- **Update after completion**: Status changes in `backlog.json`
- **Architectural changes**: Update `sdd_system.json`