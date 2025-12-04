# 📦 Presentation Mockups - Nybble Vibe

Este directorio contiene los mockups y prototipos de presentación del proyecto Nybble Vibe.

## 📁 Contenido

### 1. `nybble-vibe.zip` (63 KB)

**Descripción:** Prototipo inicial de la extensión de Chrome para Nybble Vibe.

**Contenido:**
- **Estructura de extensión Chrome (Manifest V3)**
  - `manifest.json` - Configuración de la extensión
  - `assets/` - Iconos y recursos visuales
  - `content/` - Scripts de inyección para Google Meet
    - `inject.js` - Lógica de inyección del sidebar
    - `inject.css` - Estilos para la integración
  - `sidebar/` - Aplicación principal del sidebar
    - `app.js` - Lógica principal de la aplicación
  - `popup/` - Interfaz del popup de la extensión
    - `popup.html` - Estructura HTML
    - `popup.js` - Funcionalidad del popup
    - `popup.css` - Estilos del popup
  - `data/` - Datos mock para desarrollo
    - `mockData.js` - Datos de prueba (eventos, polls, participantes)
  - `prompts/` - Documentación del proyecto
    - `NYBBLE-VIBE-PROJECT.md` - Especificación completa del proyecto
    - `prompt.md` - Prompt de desarrollo
  - `README.md` - Documentación del prototipo

**Uso:** Prototipo funcional básico de la extensión con datos mock. Útil para demostrar la interfaz y flujo de usuario.

---

### 2. `nybble-vibe-central-main.zip` (244 KB)

**Descripción:** Aplicación web central más completa con componentes React/TypeScript.

**Contenido:**
- **Proyecto React + Vite + TypeScript**
  - `package.json` - Dependencias del proyecto
  - `index.html` - Punto de entrada HTML
  - `src/` - Código fuente
    - `App.tsx` - Componente principal
    - `App.css` - Estilos globales
    - `components/` - Componentes React
      - `NavLink.tsx` - Componente de navegación
      - `extension/` - Componentes específicos de la extensión
        - `PreMeetingView.tsx` - Vista pre-reunión
        - `LiveMeetingView.tsx` - Vista durante la reunión
        - `PostMeetingView.tsx` - Vista post-reunión
        - `ClosedView.tsx` - Vista cuando el evento está cerrado
        - `ExtensionSidebar.tsx` - Sidebar principal
        - `ExtensionHeader.tsx` - Header de la extensión
  - `public/` - Archivos estáticos
    - `favicon.ico` - Icono del sitio
    - `placeholder.svg` - Placeholder visual
  - `components.json` - Configuración de componentes
  - `eslint.config.js` - Configuración de ESLint
  - `postcss.config.js` - Configuración de PostCSS

**Uso:** Aplicación web más completa con componentes React reutilizables. Incluye todas las vistas de la extensión (Pre, Live, Post, Closed) implementadas como componentes modulares.

---

## 🎯 Propósito

Estos mockups fueron creados para:

1. **Demostración visual** - Mostrar la interfaz y experiencia de usuario
2. **Prototipado rápido** - Validar conceptos antes de la implementación final
3. **Presentación** - Material para presentaciones y demos
4. **Referencia de diseño** - Guía visual para la implementación final

## 📊 Comparación

| Característica | nybble-vibe.zip | nybble-vibe-central-main.zip |
|----------------|-----------------|------------------------------|
| **Tecnología** | Vanilla JavaScript | React + TypeScript |
| **Tamaño** | 63 KB | 244 KB |
| **Complejidad** | Básica | Avanzada |
| **Componentes** | Monolítico | Modular |
| **Uso** | Prototipo rápido | Aplicación completa |

## 🚀 Cómo usar

### Extraer y explorar

```bash
# Extraer nybble-vibe.zip
unzip nybble-vibe.zip
cd nybble-vibe

# Extraer nybble-vibe-central-main.zip
unzip nybble-vibe-central-main.zip
cd nybble-vibe-central-main
npm install  # Para el proyecto React
```

### Para presentaciones

1. **nybble-vibe.zip** - Útil para mostrar la estructura básica y flujo simple
2. **nybble-vibe-central-main.zip** - Mejor para demostrar componentes interactivos y arquitectura moderna

## 📝 Notas

- Estos son **mockups/prototipos** y no representan la implementación final del proyecto
- La implementación final se encuentra en las carpetas:
  - `extension/` - Extensión Chrome final
  - `frontend/` - Dashboard admin final
  - `backend/` - API backend final
- Los mockups pueden tener funcionalidad limitada o datos hardcodeados
- Útiles como referencia visual y de diseño

## 🔗 Relación con el proyecto

Estos mockups fueron la base para desarrollar:

- ✅ **Extensión Chrome** (`extension/`) - Implementación final con integración real
- ✅ **Frontend Admin** (`frontend/`) - Dashboard de control completo
- ✅ **Backend API** (`backend/python/`) - API REST funcional con base de datos

---

**Última actualización:** Diciembre 2024
