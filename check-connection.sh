#!/bin/bash
# Script para verificar la conexión entre frontend y backend

echo "🔍 Verificando conexión Frontend ↔ Backend"
echo "=" | head -c 60 && echo ""

# Verificar backend
echo "1️⃣ Verificando Backend (http://localhost:8080)..."
BACKEND_RESPONSE=$(curl -s http://localhost:8080/api/health 2>&1)
if echo "$BACKEND_RESPONSE" | grep -q "status.*ok"; then
    echo "   ✅ Backend está corriendo"
    echo "   Response: $BACKEND_RESPONSE"
else
    echo "   ❌ Backend NO está corriendo"
    echo "   Response: $BACKEND_RESPONSE"
    echo ""
    echo "   💡 Solución: cd backend/python && source venv/bin/activate && python3 main.py"
    exit 1
fi

echo ""

# Verificar evento
EVENT_ID="5c751564-3a4f-4fd6-ad0d-3fd4f3318891"
echo "2️⃣ Verificando Event ID: $EVENT_ID..."
EVENT_RESPONSE=$(curl -s "http://localhost:8080/api/events/$EVENT_ID" 2>&1)
if echo "$EVENT_RESPONSE" | grep -q "title"; then
    echo "   ✅ Evento existe"
    EVENT_TITLE=$(echo "$EVENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['title'])" 2>/dev/null || echo "N/A")
    echo "   Title: $EVENT_TITLE"
else
    echo "   ❌ Evento NO existe"
    echo "   Response: $EVENT_RESPONSE"
    echo ""
    echo "   💡 Solución: cd backend/python && ./seed.sh --reset"
    exit 1
fi

echo ""

# Verificar CORS
echo "3️⃣ Verificando CORS..."
CORS_RESPONSE=$(curl -s -X OPTIONS "http://localhost:8080/api/events/$EVENT_ID" \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: GET" \
    -v 2>&1)
if echo "$CORS_RESPONSE" | grep -q "access-control-allow-origin.*5173"; then
    echo "   ✅ CORS configurado correctamente"
else
    echo "   ⚠️  CORS podría tener problemas"
    echo "   Response: $CORS_RESPONSE" | grep -i "access-control" | head -3
fi

echo ""
echo "4️⃣ Verificando Frontend..."
if [ -f "frontend/.env" ]; then
    echo "   ✅ Archivo .env existe"
    echo "   Contenido: $(cat frontend/.env)"
else
    echo "   ⚠️  Archivo .env NO existe (usando default)"
fi

echo ""
echo "=" | head -c 60 && echo ""
echo "✅ Todo parece estar bien configurado!"
echo ""
echo "🌐 URLs para probar:"
echo "   Backend Health: http://localhost:8080/api/health"
echo "   Swagger UI: http://localhost:8080/api/swagger"
echo "   Event API: http://localhost:8080/api/events/$EVENT_ID"
echo "   Frontend: http://localhost:5173/events/$EVENT_ID/control"
echo ""
echo "💡 Si el frontend no funciona:"
echo "   1. Reiniciá el servidor de desarrollo: cd frontend && npm run dev"
echo "   2. Limpiá la caché del navegador (Ctrl+Shift+R)"
echo "   3. Verificá la consola del navegador (F12) para ver errores"
