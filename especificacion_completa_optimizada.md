# Especificación Completa Optimizada: Flujos de Empleados y Portal Público - MOSS

## 🛠️ **HERRAMIENTAS CONFIRMADAS**

### **Desarrollo Principal**
- **Primary Tool**: Jules (jules.google.com) - Vue.js + React Native
- **Mobile Framework**: Expo.dev + Gluestack UI (planes gratuitos)
- **Base Setup**: GitHub moss-hrp/ (Vue.js 3 setup existente)
- **Deployment**: VPS Hetzner + GitHub Actions CI/CD

### **7 Fases Específicas de Desarrollo**
1. **Pocketbase Client + Auth** (2 días) - Jules + GitHub base
2. **Master Data CRUDs** (4 días) - Jules
3. **Employee Management** (5 días) - Jules (virtual scrolling 400+ records)
4. **Applications & Hiring** (4 días) - Jules
5. **Reconciliation Dashboard** (6 días) - Jules (3-column layout crítico)
6. **Employee Portal** (3 días) - Jules
7. **Mobile App Foundation** (8 días) - Jules + Expo.dev + Gluestack

**Timeline Total**: 32 días desarrollo Jules + 20 días infraestructura paralela

---

## 🌐 **1. Portal Público - Carreras**

### **1.1 Landing Page Carreras**
**URL:** `https://moss.com/careers` *(Expansión planificada: Georgia y Florida)*

**Integración con Landing Existente:**
- Expandir el landing actual de GitHub que ya implementa sistema de doble idioma
- Acoplar nueva sección `/careers` que requiere autenticación previa
- **Restricción crítica**: Solo usuarios registrados y aprobados pueden aplicar a posiciones

**Contenido:**
- Lista de `open_positions` con status "open" 
- **Información de ubicación simplificada**: Solo ciudad y área (ej. "Downtown Atlanta", "Buckhead Area")
- **NO mostrar hotel específico** por razones de privacidad y seguridad
- Cards con: area, position.title, department, salary_range, requirements preview

### **1.2 Ejemplo de Posting Actual vs Optimizado**

**Formato Actual (WhatsApp):**
> "buscamos cocineros con experiencia y disponibilidad. $18/hora. downtown. turnos flexibles. entrevista previa"

**Formato Optimizado (moss.com):**
```
🍳 COOK POSITION
💰 $18/hour
📍 Downtown Atlanta
⏰ Flexible shifts  
✅ Experience required
📋 Interview required
[Aplicar Ahora] (solo usuarios registrados)
```

### **1.3 Impacto en Colecciones Pocketbase**

**Colección `open_positions` optimizada:**
```javascript
{
  "area": "downtown_atlanta", // En lugar de hotel específico
  "zone_description": "Downtown Area", // User-friendly
  "position": "relation:positions",
  "department": "relation:departments", 
  "hourly_rate": 18.00,
  "schedule_type": "flexible", // full_time, part_time, flexible, weekends
  "requirements": ["experience_required", "interview_required"],
  "status": "open",
  "posting_type": "informal_optimized" // vs formal_corporate
}
```

---

## 📝 **2. Flujo de Postulación OPTIMIZADO**

### **2.1 Proceso de Registro Moderno**

**Práctica Moderna Recomendada:**
1. **Registro inicial**: Email + password (estándar OAuth-like)
2. **Estado progresivo**: Usuario ve dashboard con progreso de aplicación
3. **Aplicación temporal**: Sistema acepta aplicación incomplete pero congela pagos

**Flujo de Estados:**
```
Usuario No Registrado → Registro → Email Verification → 
Perfil Básico → Aplicación a Trabajo → Documentos Pendientes → 
Aplicación Completa → Revisión HR → Aprobado/Contratado
```

### **2.2 Dashboard del Aplicante**

**URL:** `https://moss.com/my-application`

**Estados visibles:**
```javascript
const applicationStates = {
  profile_incomplete: {
    status: "Tu perfil está 60% completo",
    action: "Completa tu información personal",
    payment_eligible: false
  },
  documents_pending: {
    status: "Aplicación recibida - Documentos pendientes", 
    action: "Sube: W9, ID, Social Security verificación",
    payment_eligible: false, // PAGO CONGELADO
    warning: "⚠️ Tu pago estará retenido hasta completar documentos"
  },
  under_review: {
    status: "Revisión HR en proceso",
    estimated: "2-3 días hábiles",
    payment_eligible: false
  },
  approved_active: {
    status: "¡Aprobado! Ya puedes trabajar",
    payment_eligible: true,
    next_steps: "Descarga la app MOSS Time"
  }
}
```

### **2.3 Documentos Obligatorios - Flujo Flexible**

**Documentos CRÍTICOS (bloquean pago):**
- W9 o W4 válido
- ID con foto (licencia, pasaporte, ID estatal)
- Verificación Social Security

**Documentos RECOMENDADOS (no bloquean):**
- Resume/CV
- Referencias laborales
- Certificaciones específicas del puesto

---

## 🔄 **3. Administración de Aplicaciones - DUAL SECTION**

### **3.1 Sección General: Vista de Todas las Aplicaciones**
**URL:** `admin.moss.com/applications`

**Vista HR Consolidada:**
- Todas las applications sin importar la posición
- Filtros: status, date_range, area, experience_level
- Bulk actions optimizadas
- **KPI Dashboard**: Aplicaciones por semana, tasa de conversión, tiempo promedio

### **3.2 Sección Específica: Aplicaciones por Trabajo**
**URL:** `admin.moss.com/positions/{position_id}/applicants`

**Vista desde el Trabajo:**
- Al ver detalle de un trabajo específico → ver aplicantes para ese trabajo
- Comparativa side-by-side de candidatos
- **Hiring funnel**: Submitted → Screening → Interview → Hire
- **Quick Actions**: Mover candidatos entre stages

**Ventaja estratégica:** Permite tanto gestión masiva como enfoque específico por puesto.

---

## 👥 **4. Gestión de Empleados - Cambios de Trabajo**

### **4.1 Transferencias Internas**

**Escenario:** Empleado en Hotel A quiere moverse a Hotel B

**Flujo Admin:**
```javascript
const transferEmployee = {
  current_assignment: {
    hotel: "marriott_buckhead",
    position: "housekeeper", 
    end_date: "2025-09-15"
  },
  new_assignment: {
    hotel: "hyatt_downtown",
    position: "front_desk",
    start_date: "2025-09-16",
    training_required: true
  }
}
```

### **4.2 Impacto en Seguimiento de Ponchadas**

**Problema:** ¿Cómo afecta el cambio de trabajo al tracking?

**Solución Arquitectónica:**
- `punches` se vinculan a `employee_assignment` específico
- Cada assignment tiene periodo válido (start_date → end_date)  
- **Punch validation**: Solo se permite poncheo en assignment activo
- **Historial preservado**: Punches anteriores mantienen referencia al assignment previo

**Beneficio:** Audit trail completo + flexibilidad de transferencias.

---

## 🔐 **5. Portal de Empleados - Registro y Autenticación**

### **5.1 Flujo de Credenciales Moderno**

**Al ser contratado (status = "hired"):**
1. **Auto-generación**: Sistema crea email profesional `{first_name}.{employee_id}@moss.com`
2. **Password temporal**: Enviado por email con expiración 48h
3. **Primer login forzoso**: Cambio obligatorio de password + setup 2FA opcional
4. **Dashboard personalizado**: Acceso inmediato a su información

### **5.2 Dashboard Empleado Optimizado**

**Estado del Sistema:**
```javascript
const employeeDashboard = {
  personal_header: {
    name: "Maria Garcia",
    employee_id: "EMP001", 
    current_assignment: {
      area: "Buckhead Area", // NO hotel específico
      position: "Housekeeping",
      start_date: "2025-01-15",
      status: "active"
    }
  },
  quick_stats: {
    this_week_hours: 32.5,
    missing_punches: 0, // ✅ o ⚠️
    documents_status: "compliant", // ✅ o ⚠️ próximo a vencer
    next_payday: "2025-09-15"
  },
  recent_activity: [
    "Última ponchada: Hoy 4:30 PM",
    "Último documento actualizado: W9 (válido hasta 2026)",
    "Aplicación interna pendiente: Front Desk Position"
  ]
}
```

---

## 📊 **6. Métricas de Éxito Calibradas**

### **6.1 KPIs de Aplicación**
- **Tasa de registro completo**: >85% (considerando el paso extra de documentos)
- **Tiempo promedio de onboarding**: <5 días (desde aplicación hasta primer punch)
- **Retención documentos al día**: >95%

### **6.2 KPIs Operacionales**  
- **Transferencias internas exitosas**: Sin pérdida de data histórica
- **Adopción portal empleados**: >90% login mensual
- **Reducción consultas HR**: -70% (por auto-servicio)

---

## ⚙️ **7. Integraciones Técnicas Optimizadas**

### **7.1 Email Automático Mejorado**
**Triggers con contexto:**
- Aplicación temporal aceptada → "Bienvenido, completa documentos para activar pagos"  
- Documentos aprobados → "¡Listo para trabajar! Descarga MOSS Time"
- Transferencia aprobada → "Tu nuevo puesto inicia el {date}"

### **7.2 Estructura OneDrive Escalable**
```
/MOSS_Documents/
├── /Applications/
│   └── /Area_Downtown/
│       └── /John_Doe_20250901/
├── /Employees_Active/
│   └── /EMP001_Maria_Garcia/
└── /Employees_Transferred/
    └── /EMP001_Maria_Garcia_History/
```

---

## 🚀 **8. Fases de Implementación**

### **Fase 1: MVP Portal (Mes 2)**
- Landing careers integrado con GitHub existente
- Sistema registro + aplicación básica
- Dashboard aplicante con estados

### **Fase 2: Admin Dual-Section (Mes 3)**  
- Vista general aplicaciones
- Vista específica por puesto
- Bulk actions básicas

### **Fase 3: Employee Management (Mes 4)**
- Portal empleados completo
- Transferencias internas  
- Integración completa con punch tracking

**Criterio de Éxito Final:** Cero intervención manual para 90% de los procesos de aplicación y gestión de empleados.