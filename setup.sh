#!/bin/bash

echo "Démarrage de l'installation complète..."

# ==================== INSTALLATION DES DÉPENDANCES ====================
echo "Installation des dépendances..."

echo "→ Frontend..."
cd frontend
npm install
cd ..


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

# ==================== MIGRATIONS ====================
echo "Exécution des migrations..."

echo "→ Gateway migrations..."
cd gateway
npx sequelize-cli db:migrate
cd ..

echo "→ Product Service migrations..."
cd micro-services/product-service
npx sequelize-cli db:migrate
cd ../..


echo "→ Front-office Service migrations..."
cd micro-services/front-office-service
npx sequelize-cli db:migrate
cd ../..

# ==================== SEEDERS ====================
echo "Exécution des seeders..."

echo "→ Product Service seeders..."
cd micro-services/product-service
npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
cd ../..

echo "→ Front-office Service seeders..."
cd micro-services/front-office-service
npx sequelize-cli db:seed:undo --seed 001-seed-checkout.js --seeders-path seeders --models-path src/models --config config/config.js || true
npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
cd ../..

echo "Installation complète terminée !"
