#!/bin/bash
# Script para generar iconos PNG desde el SVG

cd "$(dirname "$0")/assets/icons"

if [ ! -f "icon.svg" ]; then
    echo "❌ Error: No se encontró icon.svg"
    exit 1
fi

# Verificar que ImageMagick esté instalado
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick no está instalado"
    echo "   Instalá con: sudo apt-get install imagemagick"
    exit 1
fi

echo "🎨 Generando iconos PNG desde icon.svg..."

# Generar iconos en diferentes tamaños
convert -background none icon.svg -resize 16x16 icon-16.png
convert -background none icon.svg -resize 48x48 icon-48.png
convert -background none icon.svg -resize 128x128 icon-128.png

if [ $? -eq 0 ]; then
    echo "✅ Iconos generados correctamente:"
    ls -lh icon-*.png
else
    echo "❌ Error al generar iconos"
    exit 1
fi
