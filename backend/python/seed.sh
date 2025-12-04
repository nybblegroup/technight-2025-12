#!/bin/bash
# Script wrapper para ejecutar seed.py con el entorno virtual activado

cd "$(dirname "$0")"

# Activar el entorno virtual
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Error: No se encontró el entorno virtual (venv)"
    echo "   Ejecutá: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Ejecutar el script de seed
python seed.py "$@"
