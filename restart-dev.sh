#!/bin/bash
# Script pour redémarrer le serveur de dev sur le port 5173
# Restart dev server script on port 5173

PORT=5173

echo "🔍 Vérification du port $PORT..."
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ ! -z "$PIDS" ]; then
  echo "🔪 Arrêt des processus existants: $PIDS"
  kill -9 $PIDS 2>/dev/null
  sleep 1
fi

echo "🚀 Démarrage du serveur sur le port $PORT..."
cd "$(dirname "$0")/apps/web"
PORT=$PORT pnpm dev