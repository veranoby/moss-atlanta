#!/bin/bash
# MOSS Atlanta - Creación Individual de Colecciones Pocketbase
# EJECUTAR EN: Terminal (con Pocketbase corriendo en localhost:8080)

# 1. VERIFICAR POCKETBASE
echo "🔍 Verificando Pocketbase..."
if ! curl -s http://localhost:8080/api/health > /dev/null; then
    echo "❌ Error: Pocketbase no está corriendo en puerto 8080"
    echo "Ejecuta primero: ./start-pocketbase.fish"
    exit 1
fi
echo "✅ Pocketbase está corriendo"

# 2. AUTENTICACIÓN
echo "🔐 Credenciales de admin de Pocketbase"
echo "📧 Email admin:"
read ADMIN_EMAIL
echo "🔒 Password admin:"
read -s ADMIN_PASSWORD

TOKEN=$(curl -s -X POST http://localhost:8080/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | \
  jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo autenticar. Verifica credenciales."
    exit 1
fi
echo "✅ Autenticado correctamente"

# 3. CREAR COLECCIONES UNA POR UNA
echo "🚀 Creando colecciones..."


# Colección 2: hotels
echo "📝 Creando hotels..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hotels",
    "type": "base",
    "schema": [
      {"name": "name", "type": "text", "required": true},
      {"name": "code", "type": "text", "required": true, "unique": true},
      {"name": "address", "type": "text"},
      {"name": "city", "type": "text"},
      {"name": "state", "type": "text"},
      {"name": "country", "type": "text", "default": "USA"},
      {"name": "legal_entity", "type": "relation", "options": {"collectionId": "legal_entities", "cascadeDelete": false}},
      {"name": "time_system", "type": "select", "options": {"values": ["workrecords", "homebase", "hotel_effectiveness", "timesheets_only"]}},
      {"name": "week_start", "type": "select", "options": {"values": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}},
      {"name": "week_end", "type": "select", "options": {"values": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}},
      {"name": "primary_contact_name", "type": "text"},
      {"name": "primary_contact_email", "type": "email"},
      {"name": "allows_timesheets", "type": "bool", "default": true},
      {"name": "operational_notes", "type": "text"},
      {"name": "last_report_processed", "type": "date"},
      {"name": "active", "type": "bool", "default": true}
    ]
  }' > /dev/null

# Colección 3: departments
echo "📝 Creando departments..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "departments",
    "type": "base",
    "schema": [
      {"name": "hotel", "type": "relation", "required": true, "options": {"collectionId": "hotels", "cascadeDelete": false}},
      {"name": "name", "type": "text", "required": true},
      {"name": "code", "type": "text", "required": true},
      {"name": "manager_name", "type": "text"},
      {"name": "active", "type": "bool", "default": true}
    ]
  }' > /dev/null

# Colección 4: positions
echo "📝 Creando positions..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "positions",
    "type": "base",
    "schema": [
      {"name": "title", "type": "text", "required": true},
      {"name": "description", "type": "text"},
      {"name": "department_type", "type": "select", "options": {"values": ["housekeeping", "food_beverage", "front_desk", "maintenance", "banquet"]}},
      {"name": "base_rate", "type": "number"},
      {"name": "active", "type": "bool", "default": true}
    ]
  }' > /dev/null

# Colección 5: employees
echo "📝 Creando employees..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "employees",
    "type": "base",
    "schema": [
      {"name": "employee_id", "type": "text", "required": true, "unique": true},
      {"name": "first_name", "type": "text", "required": true},
      {"name": "last_name", "type": "text", "required": true},
      {"name": "user_id", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
      {"name": "email", "type": "email", "unique": true},
      {"name": "phone", "type": "text", "required": true},
      {"name": "address", "type": "text"},
      {"name": "city", "type": "text"},
      {"name": "state", "type": "text"},
      {"name": "zip", "type": "text"},
      {"name": "ssn_last_4", "type": "text"},
      {"name": "date_of_birth", "type": "date"},
      {"name": "employment_type", "type": "select", "options": {"values": ["employee", "contractor"]}},
      {"name": "hire_date", "type": "date"},
      {"name": "status", "type": "select", "options": {"values": ["pending_approval", "active", "inactive", "terminated"]}},
      {"name": "system_role", "type": "select", "options": {"values": ["super_admin", "operations_hr", "finance", "field_manager", "employee"]}, "default": "employee"},
      {"name": "onedrive_folder_url", "type": "url"},
      {"name": "w9_completed", "type": "bool", "default": false},
      {"name": "w4_completed", "type": "bool", "default": false},
      {"name": "quickbooks_id", "type": "text"},
      {"name": "app_pin", "type": "text"},
      {"name": "notes", "type": "text"}
    ]
  }' > /dev/null

# Colección 6: employee_assignments
echo "📝 Creando employee_assignments..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "employee_assignments",
    "type": "base",
    "schema": [
      {"name": "employee", "type": "relation", "required": true, "options": {"collectionId": "employees", "cascadeDelete": false}},
      {"name": "hotel", "type": "relation", "required": true, "options": {"collectionId": "hotels", "cascadeDelete": false}},
      {"name": "department", "type": "relation", "required": true, "options": {"collectionId": "departments", "cascadeDelete": false}},
      {"name": "position", "type": "relation", "required": true, "options": {"collectionId": "positions", "cascadeDelete": false}},
      {"name": "hourly_rate", "type": "number", "required": true},
      {"name": "start_date", "type": "date", "required": true},
      {"name": "end_date", "type": "date"},
      {"name": "is_active", "type": "bool", "default": true},
      {"name": "is_temporary", "type": "bool", "default": false},
      {"name": "notes", "type": "text"}
    ]
  }' > /dev/null

# Colección 7: punches
echo "📝 Creando punches..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "punches",
    "type": "base",
    "schema": [
      {"name": "assignment", "type": "relation", "required": true, "options": {"collectionId": "employee_assignments", "cascadeDelete": false}},
      {"name": "type", "type": "select", "required": true, "options": {"values": ["clock_in", "break_start", "break_end", "clock_out"]}},
      {"name": "timestamp", "type": "date", "required": true},
      {"name": "location", "type": "json"},
      {"name": "selfie_onedrive_url", "type": "url"},
      {"name": "source", "type": "select", "options": {"values": ["moss_app", "manual_entry"]}, "default": "moss_app"},
      {"name": "verified", "type": "bool", "default": false},
      {"name": "notes", "type": "text"}
    ]
  }' > /dev/null

# Colección 8: hotel_reports
echo "📝 Creando hotel_reports..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hotel_reports",
    "type": "base",
    "schema": [
      {"name": "hotel", "type": "relation", "required": true, "options": {"collectionId": "hotels", "cascadeDelete": false}},
      {"name": "week_start", "type": "date", "required": true},
      {"name": "week_end", "type": "date", "required": true},
      {"name": "file_onedrive_url", "type": "url"},
      {"name": "status", "type": "select", "options": {"values": ["pending", "processing", "processed", "error"]}, "default": "pending"},
      {"name": "ai_extracted_data", "type": "json"},
      {"name": "submitted_by", "type": "text"},
      {"name": "submitted_at", "type": "date"}
    ]
  }' > /dev/null

# Colección 9: reconciliations
echo "📝 Creando reconciliations..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "reconciliations",
    "type": "base",
    "schema": [
      {"name": "hotel_report", "type": "relation", "required": true, "options": {"collectionId": "hotel_reports", "cascadeDelete": false}},
      {"name": "employee", "type": "relation", "required": true, "options": {"collectionId": "employees", "cascadeDelete": false}},
      {"name": "date", "type": "date", "required": true},
      {"name": "hotel_hours", "type": "number"},
      {"name": "app_hours", "type": "number"},
      {"name": "discrepancy", "type": "number"},
      {"name": "status", "type": "select", "options": {"values": ["match", "discrepancy", "missing_hotel", "missing_app", "resolved"]}},
      {"name": "resolution_notes", "type": "text"},
      {"name": "approved_by", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
      {"name": "approved_at", "type": "date"},
      {"name": "final_hours", "type": "number"}
    ]
  }' > /dev/null

# Colección 10: open_positions
echo "📝 Creando open_positions..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "open_positions",
    "type": "base",
    "schema": [
      {"name": "hotel", "type": "relation", "required": true, "options": {"collectionId": "hotels", "cascadeDelete": false}},
      {"name": "department", "type": "relation", "required": true, "options": {"collectionId": "departments", "cascadeDelete": false}},
      {"name": "position", "type": "relation", "required": true, "options": {"collectionId": "positions", "cascadeDelete": false}},
      {"name": "hourly_rate", "type": "number", "required": true},
      {"name": "slots_needed", "type": "number", "default": 1},
      {"name": "start_date", "type": "date"},
      {"name": "is_urgent", "type": "bool", "default": false},
      {"name": "urgency_reason", "type": "text"},
      {"name": "is_temporary", "type": "bool", "default": false},
      {"name": "requirements", "type": "text"},
      {"name": "status", "type": "select", "options": {"values": ["open", "in_progress", "filled", "cancelled"]}},
      {"name": "source", "type": "select", "options": {"values": ["whatsapp", "teams", "email", "portal"]}, "default": "portal"},
      {"name": "created_by", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
      {"name": "posted_at", "type": "date"},
      {"name": "filled_at", "type": "date"}
    ]
  }' > /dev/null

# Colección 11: applications
echo "📝 Creando applications..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "applications",
    "type": "base",
    "schema": [
      {"name": "open_position", "type": "relation", "options": {"collectionId": "open_positions", "cascadeDelete": false}},
      {"name": "first_name", "type": "text", "required": true},
      {"name": "last_name", "type": "text", "required": true},
      {"name": "email", "type": "email", "required": true},
      {"name": "phone", "type": "text", "required": true},
      {"name": "address", "type": "text"},
      {"name": "city", "type": "text"},
      {"name": "state", "type": "text"},
      {"name": "zip", "type": "text"},
      {"name": "has_experience", "type": "bool"},
      {"name": "previous_hotels", "type": "text"},
      {"name": "available_start", "type": "date"},
      {"name": "documents_onedrive_url", "type": "url"},
      {"name": "status", "type": "select", "options": {"values": ["submitted", "reviewing", "approved", "rejected", "hired"]}},
      {"name": "notes", "type": "text"},
      {"name": "rejection_reason", "type": "text"},
      {"name": "created_employee", "type": "relation", "options": {"collectionId": "employees", "cascadeDelete": false}},
      {"name": "reviewed_by", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
      {"name": "reviewed_at", "type": "date"}
    ]
  }' > /dev/null

# Colección 12: payroll
echo "📝 Creando payroll..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "payroll",
    "type": "base",
    "schema": [
      {"name": "hotel", "type": "relation", "required": true, "options": {"collectionId": "hotels", "cascadeDelete": false}},
      {"name": "week_start", "type": "date", "required": true},
      {"name": "week_end", "type": "date", "required": true},
      {"name": "total_hours", "type": "number"},
      {"name": "total_amount", "type": "number"},
      {"name": "status", "type": "select", "options": {"values": ["draft", "approved", "sent_to_quickbooks", "paid"]}},
      {"name": "quickbooks_batch_id", "type": "text"},
      {"name": "file_onedrive_url", "type": "url"},
      {"name": "generated_at", "type": "date"},
      {"name": "approved_by", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}}
    ]
  }' > /dev/null

# Colección 13: payroll_items
echo "📝 Creando payroll_items..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "payroll_items",
    "type": "base",
    "schema": [
      {"name": "payroll", "type": "relation", "required": true, "options": {"collectionId": "payroll", "cascadeDelete": false}},
      {"name": "assignment", "type": "relation", "required": true, "options": {"collectionId": "employee_assignments", "cascadeDelete": false}},
      {"name": "hours_worked", "type": "number", "required": true},
      {"name": "hourly_rate", "type": "number", "required": true},
      {"name": "gross_pay", "type": "number", "required": true}
    ]
  }' > /dev/null

# Colección 14: audit_logs
echo "📝 Creando audit_logs..."
curl -s -X POST http://localhost:8080/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "audit_logs",
    "type": "base",
    "schema": [
      {"name": "collection_name", "type": "text", "required": true},
      {"name": "record_id", "type": "text", "required": true},
      {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
      {"name": "action", "type": "select", "options": {"values": ["create", "update", "delete"]}},
      {"name": "old_data", "type": "json"},
      {"name": "new_data", "type": "json"},
      {"name": "timestamp", "type": "date"},
      {"name": "ip_address", "type": "text"},
      {"name": "user_agent", "type": "text"}
    ]
  }' > /dev/null

echo ""
echo "✅ TODAS LAS COLECCIONES CREADAS"
echo "🌐 Ve a http://localhost:8080/_/ para verificar"
echo "📋 Total: 14 colecciones importadas"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Verificar colecciones en panel admin"
echo "2. Configurar reglas de API (opcional por ahora)"
echo "3. Crear algunos registros de prueba"
        {"name": "hotel", "type": "relation", "required": true, "options": {"collectionId": "hotels", "cascadeDelete": false}},
        {"name": "department", "type": "relation", "required": true, "options": {"collectionId": "departments", "cascadeDelete": false}},
        {"name": "position", "type": "relation", "required": true, "options": {"collectionId": "positions", "cascadeDelete": false}},
        {"name": "hourly_rate", "type": "number", "required": true},
        {"name": "slots_needed", "type": "number", "default": 1},
        {"name": "start_date", "type": "date"},
        {"name": "is_urgent", "type": "bool", "default": false},
        {"name": "urgency_reason", "type": "text"},
        {"name": "is_temporary", "type": "bool", "default": false},
        {"name": "requirements", "type": "text"},
        {"name": "status", "type": "select", "options": {"values": ["open", "in_progress", "filled", "cancelled"]}},
        {"name": "source", "type": "select", "options": {"values": ["whatsapp", "teams", "email", "portal"]}, "default": "portal"},
        {"name": "created_by", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
        {"name": "posted_at", "type": "date"},
        {"name": "filled_at", "type": "date"}
      ]
    },
    {
      "name": "applications",
      "type": "base",
      "schema": [
        {"name": "open_position", "type": "relation", "options": {"collectionId": "open_positions", "cascadeDelete": false}},
        {"name": "first_name", "type": "text", "required": true},
        {"name": "last_name", "type": "text", "required": true},
        {"name": "email", "type": "email", "required": true},
        {"name": "phone", "type": "text", "required": true},
        {"name": "address", "type": "text"},
        {"name": "city", "type": "text"},
        {"name": "state", "type": "text"},
        {"name": "zip", "type": "text"},
        {"name": "has_experience", "type": "bool"},
        {"name": "previous_hotels", "type": "text"},
        {"name": "available_start", "type": "date"},
        {"name": "documents_onedrive_url", "type": "url"},
        {"name": "status", "type": "select", "options": {"values": ["submitted", "reviewing", "approved", "rejected", "hired"]}},
        {"name": "notes", "type": "text"},
        {"name": "rejection_reason", "type": "text"},
        {"name": "created_employee", "type": "relation", "options": {"collectionId": "employees", "cascadeDelete": false}},
        {"name": "reviewed_by", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
        {"name": "reviewed_at", "type": "date"}
      ]
    },
    {
      "name": "payroll",
      "type": "base",
      "schema": [
        {"name": "hotel", "type": "relation", "required": true, "options": {"collectionId": "hotels", "cascadeDelete": false}},
        {"name": "week_start", "type": "date", "required": true},
        {"name": "week_end", "type": "date", "required": true},
        {"name": "total_hours", "type": "number"},
        {"name": "total_amount", "type": "number"},
        {"name": "status", "type": "select", "options": {"values": ["draft", "approved", "sent_to_quickbooks", "paid"]}},
        {"name": "quickbooks_batch_id", "type": "text"},
        {"name": "file_onedrive_url", "type": "url"},
        {"name": "generated_at", "type": "date"},
        {"name": "approved_by", "type": "relation", "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}}
      ]
    },
    {
      "name": "payroll_items",
      "type": "base",
      "schema": [
        {"name": "payroll", "type": "relation", "required": true, "options": {"collectionId": "payroll", "cascadeDelete": false}},
        {"name": "assignment", "type": "relation", "required": true, "options": {"collectionId": "employee_assignments", "cascadeDelete": false}},
        {"name": "hours_worked", "type": "number", "required": true},
        {"name": "hourly_rate", "type": "number", "required": true},
        {"name": "gross_pay", "type": "number", "required": true}
      ]
    },
    {
      "name": "audit_logs",
      "type": "base",
      "schema": [
        {"name": "collection_name", "type": "text", "required": true},
        {"name": "record_id", "type": "text", "required": true},
        {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": false}},
        {"name": "action", "type": "select", "options": {"values": ["create", "update", "delete"]}},
        {"name": "old_data", "type": "json"},
        {"name": "new_data", "type": "json"},
        {"name": "timestamp", "type": "date"},
        {"name": "ip_address", "type": "text"},
        {"name": "user_agent", "type": "text"}
      ]
    }
  ]
}
EOF

# 3. IMPORTAR CADA COLECCIÓN
echo "🚀 Importando colecciones..."

# Login como admin (necesitarás usuario/password)
echo "🔐 Necesitas las credenciales de admin de Pocketbase"
echo "Ve a http://localhost:8080/_/ y crea admin si no existe"
echo "Presiona ENTER cuando tengas las credenciales listas..."
read

# Obtener token de admin
echo "📧 Email admin:"
read ADMIN_EMAIL
echo "🔒 Password admin:"
read -s ADMIN_PASSWORD

# Autenticar
TOKEN=$(curl -s -X POST http://localhost:8080/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | \
  jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo autenticar. Verifica credenciales."
    exit 1
fi

# Importar colecciones via API Admin
echo "📤 Importando..."
curl -X POST http://localhost:8080/api/collections/import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/moss_collections.json

# Limpiar archivo temporal
rm /tmp/moss_collections.json

echo ""
echo "✅ IMPORTACIÓN COMPLETADA"
echo "🌐 Ve a http://localhost:8080/_/ para verificar las colecciones"
echo "📋 Total: 15 colecciones importadas"
