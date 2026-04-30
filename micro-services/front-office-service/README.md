# Front Office Service

## Tests

Run all tests:

```bash
npm test
```

Run only unit tests:

```bash
npm run test -- src/tests/unit
```

Run only integration tests:

```bash
npm run test -- src/tests/integration
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Notes

- Unit tests do not use the database; they mock dependencies at interface boundaries.
- Integration tests use the real database and seeded checkout data for user `9999` (`00000000-0000-0000-0000-000000009999`).
- If integration tests fail due to missing seed data, run your seeding workflow for this microservice before re-running tests.
