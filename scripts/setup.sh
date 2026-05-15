#!/bin/bash

# set -e  # Arrête le script si une commande échoue

echo "Démarrage de l'installation complète..."

# ==================== INSTALLATION DES DÉPENDANCES ====================
echo "Installation des dépendances..."

echo "→ Gateway..."
cd gateway
npm install
cd ..

echo "→ Back-office Service..."
cd micro-services/back-office-service
npm install
cd ../..

echo "→ Front-office Service..."
cd micro-services/front-office-service
npm install
cd ../..

echo "→ Product Service..."
cd micro-services/product-service
npm install
cd ../..


echo "→ Payments Service..."
cd micro-services/payments-service
npm install
cd ../..

# ==================== MIGRATIONS ====================
echo "Exécution des migrations..."

echo "→ Gateway migrations..."
cd gateway
npx sequelize-cli db:migrate
cd ..

# echo "→ Back-office Service migrations..."
# cd micro-services/back-office-service
# npx sequelize-cli db:migrate
# cd ../..

echo "→ Front-office Service migrations..."
cd micro-services/front-office-service
npx sequelize-cli db:migrate
cd ../..

echo "→ Product Service migrations..."
cd micro-services/product-service
npx sequelize-cli db:migrate
cd ../..

echo "→ Payments Service migrations..."
cd micro-services/payments-service
npx sequelize-cli db:migrate
cd ../..

# ==================== SEEDERS ====================
echo "Exécution des seeders..."

echo "→ Product Service seeders..."
cd micro-services/product-service
npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
cd ../..

echo "Installation complète terminée !"
