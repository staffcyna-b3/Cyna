#!/bin/bash

# Couleurs pour distinguer les services dans les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Parse mode argument
MODE="${1:-dev}"
if [[ "$MODE" != "dev" && "$MODE" != "prod" ]]; then
  echo -e "${RED}Usage: $0 [dev|prod]${NC}"
  echo -e "  dev  — frontend started with npm run dev (default)"
  echo -e "  prod — frontend built then served with vite preview --host"
  exit 1
fi

echo -e "${GREEN}Démarrage de tous les services en mode '${MODE}'...${NC}"
echo ""

# Fonction pour lancer un service avec un préfixe de log coloré
start_service() {
  local name="$1"
  local dir="$2"
  local color="$3"

  (
    cd "$ROOT_DIR/$dir" || { echo "Dossier introuvable : $dir"; exit 1; }
    npm run dev 2>&1 | while IFS= read -r line; do
      printf "${color}[${name}]${NC} %s\n" "$line"
    done
  ) &
}

start_frontend() {
  local name="frontend        "
  local color="$CYAN"

  (
    cd "$ROOT_DIR/frontend" || { echo "Dossier introuvable : frontend"; exit 1; }
    if [[ "$MODE" == "dev" ]]; then
      npm run dev 2>&1 | while IFS= read -r line; do
        printf "${color}[${name}]${NC} %s\n" "$line"
      done
    else
      printf "${color}[${name}]${NC} Building...\n"
      npm run build 2>&1 | while IFS= read -r line; do
        printf "${color}[${name}]${NC} %s\n" "$line"
      done
      printf "${color}[${name}]${NC} Starting preview...\n"
      npx vite preview --host 2>&1 | while IFS= read -r line; do
        printf "${color}[${name}]${NC} %s\n" "$line"
      done
    fi
  ) &
}

start_service "gateway         " "gateway"                              "$YELLOW"
start_service "back-office     " "micro-services/back-office-service"   "$RED"
start_service "front-office    " "micro-services/front-office-service"  "$BLUE"
start_service "product-service " "micro-services/product-service"       "$MAGENTA"
start_service "payments-service " "micro-services/payments-service"     "$GREEN"
start_frontend

echo -e "${GREEN}Tous les services sont en cours de démarrage.${NC}"
echo -e "Appuyez sur ${RED}Ctrl+C${NC} pour tout arrêter."
echo ""

# Attendre tous les processus fils et les tuer ensemble si Ctrl+C
trap 'echo ""; echo -e "${RED}Arrêt de tous les services...${NC}"; kill 0' SIGINT SIGTERM
wait
