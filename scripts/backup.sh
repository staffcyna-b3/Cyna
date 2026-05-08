#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
ENV_FILE="$ROOT_DIR/gateway/.env"
DOCKER_CONTAINER="mySql"

USE_DOCKER=0
for arg in "$@"; do
    [ "$arg" = "--docker" ] && USE_DOCKER=1
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

BACKUP_DIR="$ROOT_DIR/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "Sauvegarde de la base '$DB_NAME' vers $BACKUP_FILE..."

if [ "$USE_DOCKER" = "1" ]; then
    docker exec "$DOCKER_CONTAINER" mysqldump -u "$DB_USER" $PASS_ARG \
        --single-transaction --routines --triggers --set-gtid-purged=OFF \
        "$DB_NAME" > "$BACKUP_FILE"
else
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" $PASS_ARG \
        --single-transaction --routines --triggers --set-gtid-purged=OFF \
        "$DB_NAME" > "$BACKUP_FILE"
fi

echo "Backup cree: $BACKUP_FILE"
echo "Taille: $(du -sh "$BACKUP_FILE" | cut -f1)"
