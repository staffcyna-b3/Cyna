# STEP 1
launch docker BDD

# STEP 2
To install Stripe CLI : use docker if not on MACOS and windows install doesn't work (https://docs.stripe.com/stripe-cli/install?install-method=docker)

```stripe login``` -> See with Marie if account not added as collaborator

```stripe listen --forward-to localhost:3000/webhooks/stripe```

update gateway .env with given STRIPE_WEBHOOK_SECRET

# STEP 3

// MAC
```./setup.sh```

// WINDOWS
```./setup.bat```

# STEP 3

// MAC
```./start.sh```

// WINDOWS
```./start.bat```