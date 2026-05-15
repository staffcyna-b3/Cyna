#!/bin/bash

# set -e  # Arrête le script si une commande échoue

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

echo "Démarrage de l'installation complète..."

# ==================== INSTALLATION DES DÉPENDANCES ====================
echo "Installation des dépendances..."

echo "→ Gateway..."
cd "$ROOT_DIR/gateway" && npm install

echo "→ Back-office Service..."
cd "$ROOT_DIR/micro-services/back-office-service" && npm install

echo "→ Front-office Service..."
cd "$ROOT_DIR/micro-services/front-office-service" && npm install

echo "→ Product Service..."
cd "$ROOT_DIR/micro-services/product-service" && npm install

echo "→ Payments Service..."
cd "$ROOT_DIR/micro-services/payments-service" && npm install

# ==================== MIGRATIONS ====================
echo "Exécution des migrations..."

echo "→ Gateway migrations..."
cd "$ROOT_DIR/gateway" && npx sequelize-cli db:migrate

# echo "→ Back-office Service migrations..."
# cd "$ROOT_DIR/micro-services/back-office-service" && npx sequelize-cli db:migrate

echo "→ Front-office Service migrations..."
cd "$ROOT_DIR/micro-services/front-office-service" && npx sequelize-cli db:migrate

echo "→ Product Service migrations..."
cd "$ROOT_DIR/micro-services/product-service" && npx sequelize-cli db:migrate

echo "→ Payments Service migrations..."
cd "$ROOT_DIR/micro-services/payments-service" && npx sequelize-cli db:migrate

# ==================== SEEDERS ====================
echo "Exécution des seeders..."

echo "→ Product Service seeders..."
cd "$ROOT_DIR/micro-services/product-service"
npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js

echo "Installation complète terminée !"
