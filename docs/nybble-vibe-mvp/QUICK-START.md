# Nybble Vibe MVP - Quick Start ⚡

**¿Querés empezar inmediatamente? Seguí estos pasos:**

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Backend (Terminal 1)

```bash
cd backend/python
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py
```

✅ Deberías ver: "Server is running on http://localhost:8080"

### 2. Generar Datos (Terminal 1, nuevo comando)

```bash
# Ctrl+C para parar el servidor
python seed.py --reset
# Copiar el Event ID que aparece
# Volver a iniciar: python3 main.py
```

### 3. Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Deberías ver: "Local: http://localhost:5173/"

### 4. Chrome Extension

1. Chrome → `chrome://extensions/`
2. Activar "Developer mode"
3. Click "Load unpacked" → Seleccionar carpeta `extension/`
4. Abrir `https://meet.google.com/test-demo`
5. Sidebar aparece → Configurar eventId cuando se pida

### 5. Probar

**Dashboard**:
```
http://localhost:5173/events/<EVENT_ID>/control
```

**Extension**:
- Unirse al evento
- Votar en poll
- Enviar reacción 🔥
- Hacer pregunta

**Dashboard** (auto-refresh cada 5 seg):
- Ver nuevo participante
- Ver votos actualizando
- Lanzar nuevo poll
- Cambiar fase a POST

---

## 📋 Checklist Rápido

- [ ] Backend corriendo en :8080
- [ ] Seed ejecutado (tienes Event ID)
- [ ] Frontend corriendo en :5173
- [ ] Extension cargada en Chrome
- [ ] Podes abrir Meet y ver sidebar
- [ ] Podes abrir dashboard y ver evento

---

## 🆘 Si algo falla

### Backend no arranca
```bash
# Verificar Python
python3 --version  # Debe ser 3.12+

# Verificar dependencias
pip list | grep fastapi
```

### Extension no aparece
1. Reload extension en `chrome://extensions/`
2. Verificar que está en ON
3. Refrescar página de Meet

### Dashboard error 404
Verificar URL tiene el Event ID correcto:
```
http://localhost:5173/events/<TU_EVENT_ID_AQUI>/control
```

---

## 📚 Documentación Completa

Para setup detallado y troubleshooting:
- [MVP Setup Guide](./MVP-SETUP-GUIDE.md)
- [Requirements](./nybble-vibe-mvp-requirement.md)
- [Progress Checklist](./nybble-vibe-mvp-progress.md)

---

## 🎯 Testing Rápido

### Escenario de Prueba (2 minutos)

1. **Extension**: Join event → +50 pts
2. **Extension**: Vote poll → +15 pts
3. **Extension**: Send 🔥 → +5 pts
4. **Dashboard**: Ver ranking actualizado
5. **Dashboard**: Launch new poll
6. **Extension**: Ver nuevo poll (<10 seg)
7. **Dashboard**: Change phase to POST
8. **Extension**: Ver feedback form (<10 seg)
9. **Extension**: Submit feedback → +40 pts
10. **Dashboard**: Ver stats finales

---

**¿Todo funcionando?** ✅ Empezá a personalizar!

**¿Algún problema?** 🆘 Ver [MVP Setup Guide](./MVP-SETUP-GUIDE.md)

