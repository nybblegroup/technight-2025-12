#!/bin/bash
# Script para reiniciar el backend de Python

cd "$(dirname "$0")"

# Buscar y matar procesos de Python main.py
pkill -f "python.*main.py" 2>/dev/null
sleep 1

# Activar el entorno virtual
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Error: No se encontró el entorno virtual (venv)"
    echo "   Ejecutá: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Iniciar el backend
echo "🚀 Iniciando backend de Python..."
python3 main.py
