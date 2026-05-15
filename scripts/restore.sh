#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
ENV_FILE="$ROOT_DIR/gateway/.env"
DOCKER_CONTAINER="mySql"

USE_DOCKER=0
SQL_FILE=""
for arg in "$@"; do
    if [ "$arg" = "--docker" ]; then
        USE_DOCKER=1
    else
        SQL_FILE="$arg"
    fi
done

if [ ! -f "$ENV_FILE" ]; then
    echo "Erreur: $ENV_FILE introuvable. Copiez gateway/.env.example vers gateway/.env et configurez-le."
    exit 1
fi

parse_env() { grep -E "^${1}=" "$ENV_FILE" | head -1 | cut -d'=' -f2-; }

DB_HOST=$(parse_env DB_HOST); DB_HOST=${DB_HOST:-localhost}
DB_PORT=$(parse_env DB_PORT); DB_PORT=${DB_PORT:-3306}
DB_USER=$(parse_env DB_USER)
DB_PASSWORD=$(parse_env DB_PASSWORD)
DB_NAME=$(parse_env DB_NAME)

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "Erreur: DB_USER et DB_NAME doivent etre definis dans gateway/.env"
    exit 1
fi

PASS_ARG=""
[ -n "$DB_PASSWORD" ] && PASS_ARG="-p$DB_PASSWORD"

if [ "$USE_DOCKER" = "1" ]; then
    MYSQL="docker exec -i $DOCKER_CONTAINER mysql -u $DB_USER $PASS_ARG"
    MYSQL_EXEC="docker exec $DOCKER_CONTAINER mysql -u $DB_USER $PASS_ARG"
else
    MYSQL="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER $PASS_ARG"
    MYSQL_EXEC="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER $PASS_ARG"
fi

# ==================== MODE 1: Restauration depuis un fichier SQL ====================
if [ -n "$SQL_FILE" ]; then
    if [ ! -f "$SQL_FILE" ]; then
        echo "Erreur: Fichier '$SQL_FILE' introuvable."
        exit 1
    fi
    echo ""
    echo "ATTENTION: Cela va ecraser toutes les donnees actuelles de '$DB_NAME'."
    read -p "Confirmer la restauration depuis '$SQL_FILE' ? (oui/non): " CONFIRM
    if [ "$CONFIRM" != "oui" ]; then
        echo "Restauration annulee."
        exit 0
    fi
    echo "Restauration en cours..."
    $MYSQL "$DB_NAME" < "$SQL_FILE"
    echo "Restauration terminee avec succes !"
    exit 0
fi

# ==================== MODE 2: Reinitialisation complete ====================
echo ""
echo "Usage: $0 [--docker] [fichier_backup.sql]"
echo ""
echo "Aucun fichier SQL fourni - mode reinitialisation complete."
echo "La base '$DB_NAME' sera supprimee et recreee avec migrations et seeders."
echo ""
echo "ATTENTION: Toutes les donnees actuelles seront PERDUES."
read -p "Confirmer la reinitialisation complete ? (oui/non): " CONFIRM
if [ "$CONFIRM" != "oui" ]; then
    echo "Reinitialisation annulee."
    exit 0
fi

echo ""
echo "Suppression et recreation de la base '$DB_NAME'..."
$MYSQL_EXEC -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo ""
echo "Execution des migrations..."

echo "Gateway..."
cd "$ROOT_DIR/gateway" && npx sequelize-cli db:migrate && cd "$ROOT_DIR"

echo "Back-office Service..."
cd "$ROOT_DIR/micro-services/back-office-service" && npx sequelize-cli db:migrate && cd "$ROOT_DIR"

echo "Product Service..."
cd "$ROOT_DIR/micro-services/product-service" && npx sequelize-cli db:migrate && cd "$ROOT_DIR"

echo "Front-office Service..."
cd "$ROOT_DIR/micro-services/front-office-service" && npx sequelize-cli db:migrate && cd "$ROOT_DIR"

echo "Payments Service..."
cd "$ROOT_DIR/micro-services/payments-service" && npx sequelize-cli db:migrate && cd "$ROOT_DIR"

echo ""
echo "Execution des seeders..."

echo "Product Service..."
cd "$ROOT_DIR/micro-services/product-service"
npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
cd "$ROOT_DIR"

echo "Front-office Service..."
cd "$ROOT_DIR/micro-services/front-office-service"
npx sequelize-cli db:seed:undo --seed 001-seed-checkout.js --seeders-path seeders --models-path src/models --config config/config.js || echo "Warning: seed:undo ignore (peut etre absent, non bloquant)"
npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
cd "$ROOT_DIR"

echo ""
echo "Reinitialisation complete terminee avec succes !"
