# PostgreSQL con Docker 🐳

Esta guía explica cómo usar PostgreSQL en Docker para el proyecto Nybble Vibe.

---

## 🚀 Inicio Rápido

### 1. Iniciar PostgreSQL

```bash
# Desde la raíz del proyecto
npm run docker:up
```

O directamente con Docker Compose:

```bash
docker-compose up -d
```

✅ PostgreSQL estará corriendo en `localhost:5432`

### 2. Verificar que está corriendo

```bash
# Ver logs
npm run docker:logs

# O verificar el estado
docker-compose ps
```

### 3. Configurar el Backend

El archivo `.env` en `backend/python/` ya debería estar configurado con:

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/technightdb-python"
PORT=8080
```

**Importante:** No incluyas `?schema=public` en el `DATABASE_URL` (PostgreSQL no acepta ese parámetro).

### 4. Iniciar el Backend

```bash
cd backend/python
python3 main.py
```

El backend creará automáticamente las tablas al iniciar.

---

## 📋 Comandos Útiles

### Gestión del Contenedor

```bash
# Iniciar PostgreSQL
npm run docker:up
# o
docker-compose up -d

# Detener PostgreSQL
npm run docker:down
# o
docker-compose down

# Ver logs en tiempo real
npm run docker:logs
# o
docker-compose logs -f postgres

# Reiniciar PostgreSQL
npm run docker:restart
# o
docker-compose restart postgres

# Detener y eliminar volúmenes (⚠️ borra todos los datos)
npm run docker:clean
# o
docker-compose down -v
```

### Acceso Directo a PostgreSQL

```bash
# Conectar con psql
docker exec -it technight-postgres psql -U postgres -d technightdb-python

# O desde tu máquina (si tienes psql instalado)
psql -h localhost -U postgres -d technightdb-python
# Password: mysecretpassword
```

### Comandos SQL Útiles

```sql
-- Listar todas las bases de datos
\l

-- Conectar a la base de datos
\c technightdb-python

-- Listar todas las tablas
\dt

-- Ver estructura de una tabla
\d events

-- Ver datos de una tabla
SELECT * FROM events LIMIT 10;
```

---

## 🔧 Configuración

### Cambiar Credenciales

Si querés cambiar el usuario, contraseña o nombre de la base de datos, editá `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: tu_usuario
  POSTGRES_PASSWORD: tu_contraseña
  POSTGRES_DB: tu_base_de_datos
```

Y actualizá el `DATABASE_URL` en `backend/python/.env`:

```env
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/tu_base_de_datos"
```

### Cambiar Puerto

Si el puerto 5432 ya está en uso, cambiá el mapeo en `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Puerto externo:puerto interno
```

Y actualizá el `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5433/technightdb-python"
```

---

## 📦 Volúmenes

Los datos de PostgreSQL se guardan en un volumen de Docker llamado `postgres_data`. Esto significa que:

- ✅ Los datos persisten aunque reinicies el contenedor
- ✅ Los datos persisten aunque elimines el contenedor
- ⚠️ Para borrar todos los datos: `npm run docker:clean`

### Ubicación del Volumen

```bash
# Ver información del volumen
docker volume inspect technight-2025-12_postgres_data
```

---

## 🆘 Troubleshooting

### Error: "Port 5432 is already in use"

**Solución:** Cambiá el puerto en `docker-compose.yml` o detené el PostgreSQL local:

```bash
# Ver qué está usando el puerto
sudo lsof -i :5432

# Detener PostgreSQL local (si está instalado)
sudo systemctl stop postgresql  # Linux
# o
brew services stop postgresql@14  # macOS
```

### Error: "Cannot connect to database"

**Verificaciones:**

1. **PostgreSQL está corriendo:**
   ```bash
   docker-compose ps
   ```

2. **Health check:**
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **Verificar credenciales en `.env`:**
   ```bash
   cat backend/python/.env
   ```

4. **Probar conexión manual:**
   ```bash
   docker exec -it technight-postgres psql -U postgres -d technightdb-python
   ```

### Error: "Database does not exist"

**Solución:** El contenedor crea la base de datos automáticamente. Si no existe:

```bash
# Crear manualmente
docker exec -it technight-postgres psql -U postgres -c "CREATE DATABASE technightdb-python;"
```

### Resetear la Base de Datos

```bash
# Opción 1: Eliminar y recrear el contenedor (mantiene el volumen)
npm run docker:down
npm run docker:up

# Opción 2: Eliminar todo (incluyendo datos)
npm run docker:clean
npm run docker:up
```

---

## 🔄 Workflow Recomendado

### Desarrollo Diario

```bash
# 1. Iniciar PostgreSQL (una vez al día)
npm run docker:up

# 2. Iniciar backend
cd backend/python
python3 main.py

# 3. Generar datos de prueba
python seed.py --reset

# 4. Al final del día (opcional)
npm run docker:down
```

### Primera Vez

```bash
# 1. Iniciar PostgreSQL
npm run docker:up

# 2. Esperar a que esté listo (10-20 segundos)
npm run docker:logs

# 3. Verificar conexión
docker-compose exec postgres pg_isready -U postgres

# 4. Configurar backend (.env ya debería estar listo)
cd backend/python
cat .env

# 5. Iniciar backend (creará las tablas automáticamente)
python3 main.py

# 6. Generar datos de prueba
python seed.py --reset
```

---

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [SQLAlchemy Connection Strings](https://docs.sqlalchemy.org/en/20/core/engines.html#postgresql)

---

## ✅ Checklist

- [ ] Docker y Docker Compose instalados
- [ ] PostgreSQL corriendo (`npm run docker:up`)
- [ ] `.env` configurado correctamente
- [ ] Backend puede conectarse a la base de datos
- [ ] Tablas creadas automáticamente
- [ ] Datos de prueba generados (`python seed.py --reset`)

---

**¿Problemas?** Verifica los logs con `npm run docker:logs` o consulta la sección de Troubleshooting.

