# STEP 1
Launch docker BDD

# STEP 2
To install Stripe CLI : use docker if not on MACOS and windows install doesn't work (https://docs.stripe.com/stripe-cli/install?install-method=docker)

```stripe login``` -> See with Marie if account not added as collaborator

```stripe listen --forward-to localhost:3000/webhooks/stripe```

Update gateway .env with given STRIPE_WEBHOOK_SECRET

# STEP 3

// MAC
```./setup.sh```

// WINDOWS
```./setup.bat```

# STEP 3

// MAC
```
./start.sh       # defaults to dev mode
./start.sh dev   # frontend: npm run dev
./start.sh prod  # frontend: npm run build → vite preview --host
```

// WINDOWS
```
./start.bat       # defaults to dev mode
./start.bat dev   # frontend: npm run dev
./start.bat prod  # frontend: npm run build → vite preview --host
```