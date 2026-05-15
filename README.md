# CYNA - Guide de démarrage

## STEP 1 — Base de données

Lancer Docker avec la base MySQL :

```bash
docker-compose up -d
```

## STEP 2 — Stripe CLI

Installer la Stripe CLI : utiliser Docker si pas sur macOS (l'install Windows peut ne pas fonctionner).
Doc : https://docs.stripe.com/stripe-cli/install?install-method=docker

```bash
stripe login
```
> Voir avec Marie si ton compte n'est pas encore ajouté comme collaborateur.

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

Mettre à jour `gateway/.env` avec le `STRIPE_WEBHOOK_SECRET` affiché.

## STEP 3 — Installation des dépendances, migrations et seeders

**macOS / Linux**
```bash
./scripts/setup.sh
```

**Windows**
```bat
.\scripts\setup.bat
```

## STEP 4 — Lancer tous les services

**macOS / Linux**
```bash
./scripts/start.sh        # mode dev par défaut
./scripts/start.sh dev    # frontend: npm run dev
./scripts/start.sh prod   # frontend: npm run build → vite preview --host
```

**Windows**
```bat
.\scripts\start.bat        # mode dev par défaut
.\scripts\start.bat dev    # frontend: npm run dev
.\scripts\start.bat prod   # frontend: npm run build → vite preview --host
```

## Scripts disponibles

| Script | Description |
|---|---|
| `scripts/setup` | Installe les dépendances, exécute les migrations et les seeders |
| `scripts/start` | Lance tous les services en parallèle (gateway, microservices, frontend) |
| `scripts/backup` | Sauvegarde la base MySQL vers `backups/` |
| `scripts/restore` | Restaure depuis un fichier `.sql` ou réinitialise complètement la base |

### Backup / Restore

```bash
# Sauvegarde
./scripts/backup.sh
./scripts/backup.sh --docker   # via container Docker

# Restauration depuis un fichier
./scripts/restore.sh backups/backup_cyna_20240101_120000.sql

# Réinitialisation complète (supprime et recrée la base)
./scripts/restore.sh
```
