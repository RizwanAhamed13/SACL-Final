# Sakthi Autos Quality Management System

Full-stack quality control application for Sakthi Autos / SACL. The system manages production quality records, part standards, approvals, reports, employee efficiency, and user access for foundry quality workflows.

## Features

- JWT-based login and role-aware access control
- QC Register for heat and chemical composition records
- Micro Structure Analysis with part/location-based entries
- Micro Tensile Test and Impact Test records
- Part Name master data with configurable quality thresholds
- HOF/HOD/Admin approval workflow
- Reports search across approved QC, micro, tensile, and impact records
- Employee efficiency and performance feedback views
- Docker-based production deployment with frontend reverse proxy

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios |
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | PostgreSQL for local dev, Microsoft SQL Server for production |
| Build | Maven, npm |
| Deployment | Docker, Docker Compose, Nginx |

## Project Structure

```text
SACL-Final/
├── backend/                 # Spring Boot REST API
│   ├── src/main/java/com/sacl/
│   │   ├── config/          # Security, CORS, password config
│   │   ├── controller/      # API controllers
│   │   ├── dto/             # Request/response DTOs
│   │   ├── exception/       # Global error handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   ├── security/        # JWT and user details services
│   │   └── service/         # Business logic
│   └── src/main/resources/  # Spring profiles and static resources
├── frontend/                # React/Vite app
│   └── src/
│       ├── api/             # Axios client
│       ├── components/      # Shared UI components
│       ├── layouts/         # Main app layout
│       └── pages/           # App screens
├── db/                      # SQL migration scripts
├── docs/                    # Test reports and production checklist
├── scripts/                 # Demo/seed helper scripts
├── docker-compose.yml
└── deploy.sh
```

## Prerequisites

- Java 21
- Maven 3.9+ or the Maven wrapper available in `backend/`
- Node.js 20+
- npm
- Docker and Docker Compose
- PostgreSQL for local development, or SQL Server for production

## Environment Variables

Copy the sample environment file and fill in real production values:

```bash
cp .env.example .env
```

Important variables:

```env
SPRING_PROFILES_ACTIVE=prod
DB_HOST=
DB_PORT=1433
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
DB_ENCRYPT=false
DB_TRUST_CERT=false
JWT_SECRET=
CORS_ORIGINS=http://localhost:9201
```

For production, use a long, random `JWT_SECRET` and set `CORS_ORIGINS` to the frontend URL/domain.

## Local Development

The default backend profile is `dev`, which expects PostgreSQL at `localhost:5432` with database `sacl_quality`.

### 1. Start PostgreSQL

Create a local PostgreSQL database named `sacl_quality`, then adjust `backend/src/main/resources/application-dev.properties` if your username/password differs:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sacl_quality
spring.datasource.username=rizwanahamed
spring.datasource.password=
```

### 2. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API runs on:

```text
http://localhost:8080
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Production With Docker

Production uses the `prod` Spring profile and connects to an external Microsoft SQL Server database.

```bash
cp .env.example .env
# edit .env with SQL Server, JWT, and CORS values

docker compose build --no-cache backend frontend
docker compose up -d
```

Open:

```text
http://localhost
```

Useful Docker commands:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

## Build And Test

Frontend:

```bash
cd frontend
npm install
npm run build
npm run lint
```

Backend:

```bash
cd backend
./mvnw test
./mvnw package
```

## Main API Routes

| Area | Endpoint |
| --- | --- |
| Authentication | `/api/auth/login`, `/api/auth/logout` |
| Users | `/api/users` |
| Part Names | `/api/part-names` |
| QC Register | `/api/qc-register` |
| Micro Structure | `/api/micro-structure` |
| Micro Tensile | `/api/micro-tensile` |
| Impact Test | `/api/impact-test` |
| Reports | `/api/reports/search` |
| Employee Efficiency | `/api/efficiency/employees` |
| Performance Feedback | `/api/performance-feedback` |
| Health | `/actuator/health` |

## Roles

| Role | Purpose |
| --- | --- |
| `ADMIN` | Full system access |
| `HOD` | Department-level review, approvals, reports, part standards |
| `HOF` | First-level approval and review |
| `QC` | Quality record entry |
| `Viewer` | Read-only access |

## Quality Thresholds

Part standards are maintained in the Part Names module. Threshold values are used by the QC, micro structure, tensile, and impact forms to validate entries against configured limits.

Supported threshold groups include:

- Chemical composition values
- Micro structure values
- Mechanical properties
- Process parameters
- Micro and mechanical test locations

## Documentation

Additional project documents are available in `docs/`:

- `docs/01_TEST_PLAN.md`
- `docs/02_API_TEST_REPORT.md`
- `docs/03_UNIT_TEST_REPORT.md`
- `docs/04_SECURITY_TEST_REPORT.md`
- `docs/05_PERFORMANCE_TEST_REPORT.md`
- `docs/06_E2E_UAT_REPORT.md`
- `docs/07_TEST_SUMMARY_REPORT.md`
- `docs/08_BUG_FIX_REPORT.md`
- `docs/PRODUCTION_CHECKLIST.md`

## Deployment Script

The repository includes `deploy.sh` for deployment automation. Review `.env` and the Docker image settings in `docker-compose.yml` before running it on a server.

```bash
./deploy.sh
```
