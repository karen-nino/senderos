#!/bin/bash

# Script para subir el proyecto a GitHub
# Uso: ./push-to-github.sh [nombre-del-repositorio]

REPO_NAME=${1:-"senderos-de-chiapas"}
GITHUB_USER="karen-nino"

echo "🚀 Preparando para subir a GitHub..."
echo "📦 Repositorio: $GITHUB_USER/$REPO_NAME"
echo ""

# Verificar si ya existe el remote
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Ya existe un remote 'origin' configurado."
    echo "   URL actual: $(git remote get-url origin)"
    read -p "¿Deseas cambiarlo? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "Usando el remote existente..."
        git push -u origin main
        exit 0
    fi
fi

# Agregar remote
echo "📡 Agregando remote origin..."
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Verificar si el repositorio existe
echo ""
echo "⚠️  IMPORTANTE: Asegúrate de haber creado el repositorio en GitHub primero:"
echo "   https://github.com/new"
echo "   Nombre: $REPO_NAME"
echo "   NO marques 'Initialize with README'"
echo ""
read -p "¿Ya creaste el repositorio en GitHub? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Por favor crea el repositorio primero y luego ejecuta este script de nuevo."
    exit 1
fi

# Hacer push
echo ""
echo "⬆️  Subiendo código a GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Código subido exitosamente!"
    echo "🌐 Repositorio: https://github.com/$GITHUB_USER/$REPO_NAME"
else
    echo ""
    echo "❌ Error al subir. Verifica que:"
    echo "   1. El repositorio existe en GitHub"
    echo "   2. Tienes permisos para escribir"
    echo "   3. Tu autenticación está configurada correctamente"
fi

