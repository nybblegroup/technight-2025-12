# Nybble Vibe MVP - Guía de Setup Completa

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Configuración del Backend](#configuración-del-backend)
3. [Configuración de la Database](#configuración-de-la-database)
4. [Generación de Datos de Prueba](#generación-de-datos-de-prueba)
5. [Configuración del Frontend](#configuración-del-frontend)
6. [Configuración de la Chrome Extension](#configuración-de-la-chrome-extension)
7. [Testing End-to-End](#testing-end-to-end)
8. [Troubleshooting](#troubleshooting)

---

## Pre-requisitos

### Software Requerido

- **Python**: 3.12 o superior
- **Node.js**: 20.19.4 o superior
- **PostgreSQL**: 15 o superior (opcional para MVP, ver nota abajo)
- **Google Chrome**: Última versión
- **Git**: Para clonar el repositorio

**Nota sobre PostgreSQL**: El MVP puede funcionar sin PostgreSQL activo, pero algunos endpoints retornarán errores. Para la funcionalidad completa, se recomienda tener PostgreSQL corriendo.

---

## Configuración del Backend

### 1. Navegar al directorio del backend

```bash
cd backend/python
```

### 2. Crear virtual environment (recomendado)

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

**Dependencias incluidas:**
- fastapi==0.115.6
- uvicorn[standard]==0.34.0
- python-dotenv==1.0.1
- PyYAML==6.0.2
- sqlalchemy==2.0.36
- psycopg2-binary==2.9.10
- alembic==1.14.0

### 4. Configurar variables de entorno

Crear archivo `.env` en `backend/python/`:

```bash
PORT=8080
DATABASE_URL="postgresql://user:password@localhost:5432/nybble_vibe"
```

**Nota**: Si no tienes PostgreSQL, puedes omitir `DATABASE_URL`. El servidor arrancará igual.

### 5. Iniciar el servidor

```bash
# Desde backend/python/ con venv activado
python3 main.py

# O desde el root del proyecto
npm run dev:python
```

Deberías ver:

```
================================================================================
🎮 NYBBLE VIBE - Event Engagement Platform
================================================================================

🚀 Server starting on http://localhost:8080
📚 Swagger UI available at http://localhost:8080/api/swagger
📄 OpenAPI JSON available at http://localhost:8080/api/openapi.json
📋 OpenAPI YAML available at http://localhost:8080/api/openapi.yaml

================================================================================

✅ Database tables created successfully
✅ Database initialized successfully
INFO:     Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)
```

### 6. Verificar que funciona

Abrir en el navegador:
- http://localhost:8080/api/health
- http://localhost:8080/api/swagger

---

## Configuración de la Database

### Opción 1: PostgreSQL Local (Recomendado)

#### macOS

```bash
# Instalar PostgreSQL con Homebrew
brew install postgresql@15
brew services start postgresql@15

# Crear database
psql postgres
CREATE DATABASE nybble_vibe;
CREATE USER nybble_user WITH PASSWORD 'nybble_password';
GRANT ALL PRIVILEGES ON DATABASE nybble_vibe TO nybble_user;
\q
```

#### Linux (Ubuntu/Debian)

```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear database
sudo -u postgres psql
CREATE DATABASE nybble_vibe;
CREATE USER nybble_user WITH PASSWORD 'nybble_password';
GRANT ALL PRIVILEGES ON DATABASE nybble_vibe TO nybble_user;
\q
```

#### Windows

1. Descargar PostgreSQL desde https://www.postgresql.org/download/windows/
2. Instalar con pgAdmin 4 incluido
3. Abrir pgAdmin 4 → Create Database: `nybble_vibe`
4. Crear usuario: `nybble_user` / `nybble_password`

### Opción 2: Sin Database (Limitado)

Si no querés configurar PostgreSQL, el backend arrancará igual pero:
- ✅ Health check funcionará
- ✅ Swagger UI estará disponible
- ❌ Endpoints de datos retornarán error 503

Útil para desarrollo del frontend o testing sin datos reales.

---

## Generación de Datos de Prueba

Una vez que el backend esté corriendo y la database configurada, generar datos de prueba:

### 1. Ejecutar seed script

```bash
cd backend/python
python seed.py --reset
```

Output esperado:

```
================================================================================
🌱 NYBBLE VIBE - Database Seeder
================================================================================

🔄 Resetting database...
✅ Database reset complete
📅 Creating event (phase: live)...
✅ Event created: Tech Talk Q4 2024 - Nybble Vibe Demo
   ID: <uuid>
   Phase: live
📊 Creating polls...
✅ Created 3 polls (1 active, 2 draft)
👥 Creating 10 participants...
✅ Created 10 participants with engagement data
   Reactions: 45
   Questions: 4
   Poll votes: 7

================================================================================
🎉 Seed Complete!
================================================================================

📋 Summary:
   Event ID: <uuid>
   Event Title: Tech Talk Q4 2024 - Nybble Vibe Demo
   Phase: live
   Polls: 3 (1 active, 2 draft)
   Participants: 10

🔗 Quick Links:
   Backend: http://localhost:8080/api/health
   Swagger: http://localhost:8080/api/swagger
   Event API: http://localhost:8080/api/events/<uuid>

📝 For Chrome Extension:
   Set eventId in localStorage: '<uuid>'

💡 To reseed with different phase:
   python seed.py --reset --phase pre
   python seed.py --reset --phase post

================================================================================
```

### 2. Guardar el Event ID

**IMPORTANTE**: Copiar el `Event ID` del output, lo vas a necesitar para la extension y el dashboard.

### 3. Opciones del seed script

```bash
# Crear evento en fase PRE
python seed.py --reset --phase pre

# Crear evento en fase LIVE (default)
python seed.py --reset --phase live

# Crear evento en fase POST
python seed.py --reset --phase post

# Solo agregar datos sin resetear
python seed.py
```

---

## Configuración del Frontend

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variable de entorno

Crear archivo `.env` en `frontend/`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Iniciar dev server

```bash
npm run dev
```

Output esperado:

```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4. Acceder al Admin Dashboard

Abrir en el navegador:

```
http://localhost:5173/events/<EVENT_ID>/control
```

Reemplazar `<EVENT_ID>` con el ID del evento generado por el seed script.

**Ejemplo**:
```
http://localhost:5173/events/550e8400-e29b-41d4-a716-446655440000/control
```

---

## Configuración de la Chrome Extension

### 1. Preparar la extension

Los archivos de la extension están en la carpeta `extension/`. No requiere build ni compilación.

### 2. Cargar en Chrome

1. Abrir Chrome
2. Navegar a: `chrome://extensions/`
3. Activar "Developer mode" (esquina superior derecha)
4. Click "Load unpacked"
5. Seleccionar la carpeta `extension/` del proyecto

### 3. Configurar Event ID

Una vez cargada la extension:

**Opción A: Via Console**

1. Abrir una nueva tab
2. Abrir DevTools (F12)
3. En la Console, ejecutar:

```javascript
chrome.storage.local.set({ 
  eventId: '<EVENT_ID>' 
}, () => {
  console.log('Event ID configured!');
});
```

**Opción B: Via Extension UI**

1. Abrir Google Meet: https://meet.google.com/test-demo
2. La extension aparecerá con un setup screen
3. Pegar el Event ID cuando se te pida

### 4. Verificar que funciona

1. Abrir: https://meet.google.com/test-demo
2. El sidebar de Nybble Vibe debería aparecer a la derecha
3. Si configuraste el eventId correctamente, verás la pantalla de "Join Event"

---

## Testing End-to-End

### Escenario Completo: Simular un Evento LIVE

#### Terminal 1: Backend

```bash
cd backend/python
source venv/bin/activate  # o venv\Scripts\activate en Windows
python3 main.py
```

#### Terminal 2: Frontend (Admin Dashboard)

```bash
cd frontend
npm run dev
```

#### Chrome: Extension

1. Abrir https://meet.google.com/test-demo
2. Sidebar de Nybble Vibe aparece
3. Click "Join Event"
4. Ingresar tu nombre y elegir avatar
5. Click "Unirse al Evento" (+50 pts)

#### Chrome: Admin Dashboard

1. Abrir http://localhost:5173/events/<EVENT_ID>/control
2. Ver la lista de participantes (incluido vos)
3. Ver el ranking actualizado

#### Testing Flujo LIVE

##### En la Extension:

1. **Votar en la encuesta activa**:
   - Ver la pregunta "¿Cuál debería ser nuestra prioridad para Q1 2025?"
   - Seleccionar una opción
   - Click "Vote"
   - Ver animación "+15 pts"
   - Tu total de puntos aumenta

2. **Enviar reacciones**:
   - Click en 🔥 o 👏
   - Ver emoji flotando hacia arriba
   - Ver "+5 pts" popup
   - Contador de reacciones incrementa (X/10)

3. **Hacer una pregunta**:
   - Escribir pregunta en Q&A
   - Marcar "anónima" (opcional)
   - Click "Enviar Pregunta" (+25 pts)
   - Ver confirmación

##### En el Dashboard:

1. **Ver actualizaciones en tiempo real** (cada 5 seg):
   - Nuevo participante aparece en lista
   - Puntos actualizados
   - Ranking recalculado
   - Votos en poll incrementan
   - Pregunta nueva aparece en Q&A

2. **Lanzar nueva encuesta**:
   - Ver polls en estado "DRAFT"
   - Click "Lanzar" en un poll
   - Poll pasa a "ACTIVO"
   - Extension detecta cambio en <10 seg
   - Usuarios ven nueva encuesta

3. **Cerrar encuesta**:
   - Click "Cerrar Encuesta" en poll activo
   - Poll pasa a "CERRADO"
   - Ver resultados finales con porcentajes

4. **Cambiar fase del evento**:
   - Click en botón "POST"
   - Confirmar cambio
   - Extension detecta cambio
   - UI cambia a feedback form

##### Testing Fase POST:

1. En extension, completar feedback:
   - Calificar reunión (1-5 emojis)
   - Indicar si lograste tu objetivo
   - Escribir comentario (opcional)
   - Click "Enviar Feedback" (+40 pts)

2. Ver stats finales:
   - Puntos totales
   - Ranking final
   - Badges ganados
   - Asistencia %

---

## Troubleshooting

### Backend no arranca

#### Error: `python: command not found`

**Solución**: Usar `python3` en vez de `python`:

```bash
python3 main.py
```

#### Error: `psycopg2-binary installation failed`

**Solución macOS**:

```bash
brew install libpq openssl@3
export PATH="$(brew --prefix libpq)/bin:$PATH"
pip install psycopg2-binary
```

**Solución Linux**:

```bash
sudo apt-get install libpq-dev libssl-dev
pip install psycopg2-binary
```

#### Error: `Database connection failed`

**Solución**: Verificar que PostgreSQL está corriendo:

```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Verificar conexión manual
psql -U nybble_user -d nybble_vibe -h localhost
```

### Extension no aparece en Google Meet

1. **Verificar que está cargada**:
   - `chrome://extensions/` → Buscar "Nybble Vibe"
   - Debe tener switch en ON

2. **Verificar permisos**:
   - La extension debe tener permiso para `meet.google.com`

3. **Reload extension**:
   - En `chrome://extensions/` → Click en reload icon

4. **Ver logs**:
   - Abrir DevTools en Meet
   - Ver tab "Console"
   - Buscar mensajes de "🎮 Nybble Vibe"

### Extension muestra "No event active"

**Solución**: Configurar eventId en storage:

```javascript
// En DevTools Console
chrome.storage.local.set({ 
  eventId: 'TU_EVENT_ID_AQUI' 
});
```

### Dashboard muestra "Evento no encontrado"

1. **Verificar que backend está corriendo**:
   - http://localhost:8080/api/health debe responder

2. **Verificar Event ID en URL**:
   - URL debe ser: `/events/<UUID>/control`
   - UUID debe coincidir con el generado por seed

3. **Verificar datos en database**:
   - Ejecutar seed script nuevamente: `python seed.py --reset`

### Polls no aparecen en extension

1. **Verificar fase del evento**:
   - Polls activos solo se muestran en fase LIVE
   - Ver phase badge en header

2. **Lanzar poll desde dashboard**:
   - Polls inician en estado DRAFT
   - Admin debe hacer click "Lanzar"

3. **Esperar polling**:
   - Extension refresca cada 5 segundos
   - Esperar máximo 10 segundos para ver cambios

### Frontend no conecta con backend

1. **Verificar `.env` en frontend**:
   - Debe tener `VITE_API_BASE_URL=http://localhost:8080`

2. **Restart dev server** después de cambiar `.env`:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

3. **Verificar CORS en backend**:
   - Backend ya tiene CORS permisivo configurado
   - No debería ser un problema en desarrollo

---

## URLs de Referencia Rápida

### Backend

- Health: http://localhost:8080/api/health
- Swagger: http://localhost:8080/api/swagger
- OpenAPI JSON: http://localhost:8080/api/openapi.json

### Frontend

- Dashboard: http://localhost:5173/events/<EVENT_ID>/control

### Extension

- Load in Chrome: chrome://extensions/
- Test in Meet: https://meet.google.com/test-demo

---

## Próximos Pasos

Una vez que el MVP funciona correctamente:

1. **Mejorar UI/UX**:
   - Agregar más animaciones
   - Mejorar diseño responsive
   - Agregar iconos PNG para extension

2. **Agregar Features**:
   - AI Q&A con OpenAI
   - WebSocket real-time (en vez de polling)
   - Más tipos de badges
   - Streaks cross-events

3. **Testing**:
   - Unit tests (pytest para backend)
   - E2E tests con múltiples users
   - Performance testing

4. **Deploy**:
   - Backend en Railway/Render/Fly.io
   - Frontend en Vercel/Netlify
   - Database en Supabase/Neon

---

## Contacto y Soporte

Si tenés problemas con el setup:

1. Verificar logs del backend (terminal donde corre Python)
2. Verificar logs de extension (DevTools Console en Meet)
3. Verificar logs del frontend (DevTools Console en Dashboard)
4. Consultar documentación en `/docs/nybble-vibe-mvp/`

---

**Última actualización**: 2024-12-03
**Autor**: AI Agent + Fernando Fiocca
**Versión**: MVP 1.0

