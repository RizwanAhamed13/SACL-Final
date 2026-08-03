# Production Deployment Checklist
## SACL Quality Management System

---

## Step 1 — Run the migration script on the production DB (ONCE before first deploy)

This script is 100% safe. It uses IF NOT EXISTS everywhere and never drops or changes anything.

```bash
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f db/migration.sql
```

Verify it ran without errors before starting the application.

---

## Step 2 — Set these environment variables on the server

```
DB_URL=jdbc:postgresql://<host>:<port>/<dbname>
DB_USERNAME=<db user>
DB_PASSWORD=<db password>
DB_DRIVER=org.postgresql.Driver
DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect
DB_POOL_SIZE=20

JWT_SECRET=<random string, minimum 64 characters — generate with: openssl rand -base64 64>
JWT_EXPIRATION_MS=36000000

CORS_ORIGINS=https://<your-frontend-domain>

SPRING_PROFILES_ACTIVE=prod
```

---

## Step 3 — Start the backend

```bash
SPRING_PROFILES_ACTIVE=prod java -jar sacl-quality.jar
```

---

## Step 4 — Verify the application started

Check the log for:
```
Started SaclApplication in X seconds
```

Check the health endpoint:
```
curl http://localhost:8080/actuator/health
```

---

## Step 5 — Create the first admin user

If this is a fresh database, insert the first admin:

```sql
INSERT INTO users (full_name, username, employee_id, password, role, active, created_at)
VALUES (
  'Administrator',
  'admin',
  'EMP001',
  '$2a$10$G/3LkMj5SUVRo...',  -- replace with bcrypt hash of your chosen password
  'ADMIN',
  true,
  NOW()
);
```

Or use the existing admin credentials if migrating from dev.

---

## What is safe / not safe

| Action | Safe? | Why |
|---|---|---|
| Run migration.sql twice | YES | IF NOT EXISTS on everything |
| Deploy new version | YES | ddl-auto=none — schema never touched |
| Existing data in tables | YES | Script only adds, never drops |
| Existing tables with extra columns | YES | We never touch unknown columns |
| Downgrade to old version | YES | Old version ignores new columns |
| Change DB password | YES | Update env var and restart |

---

## If something goes wrong

The application will fail to START (not silently corrupt) if:
- DB connection fails — check credentials and firewall
- A required column is missing — run migration.sql again
- JWT_SECRET is not set — set the env var

It will NEVER silently corrupt data because ddl-auto=none.
