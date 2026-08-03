# Sakthi Autos — Project Handout (Claude Context Memory)

> Drop this file into any new Claude session and say "read HANDOUT.md" to get full context instantly.

---

## Project Overview

**Sakthi Autos Quality Control System (SACL)**  
A full-stack internal quality management system for a foundry/casting unit. Manages QC records, micro-structure analysis, tensile testing, impact testing, part standards, and user management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router, Axios, React Hot Toast |
| Backend | Spring Boot 3, Spring Data JPA, Spring Security |
| Database | Microsoft SQL Server (via Docker) |
| Dev Server | Vite (HMR) + Spring Boot DevTools (auto-restart) |
| Production | Docker + docker-compose |

---

## How to Run — DEVELOPMENT MODE (fast, no Docker rebuild)

Run these in **3 separate terminals**. This is the correct way to develop.

### Terminal 1 — Database only (Docker, one-time setup)
```bash
# First time — create the container:
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Pass123" \
  -p 1433:1433 --name sacl-db \
  -v sacl_mssql_data:/var/opt/mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Every time after that — just start it:
docker start sacl-db

# Check it's running:
docker ps | grep sacl-db
```

### Terminal 2 — Backend (Spring Boot, auto-restarts on save)
```bash
cd /Users/rizwanahamed/Desktop/Sakthi_Autos-Production/backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
# Spring DevTools is installed — backend auto-restarts when you save Java files
```

### Terminal 3 — Frontend (Vite, instant hot reload)
```bash
cd /Users/rizwanahamed/Desktop/Sakthi_Autos-Production/frontend
npm run dev
# Runs on http://localhost:5173
# Changes to .jsx files reflect instantly in browser — no restart needed
```

**Open browser at → http://localhost:5173**

---

## How to Run — PRODUCTION (Docker, final deployment)

```bash
cd /Users/rizwanahamed/Desktop/Sakthi_Autos-Production

# First time or after code changes — rebuild and start:
docker-compose build --no-cache backend frontend && docker-compose up -d

# Every time after that (no code changes) — just start:
docker-compose up -d

# Stop everything:
docker-compose down

# Logs:
docker-compose logs -f backend
docker-compose logs -f frontend
```
**Open browser at → http://localhost:80**

---

## Project File Structure

```
Sakthi_Autos-Production/
├── backend/
│   ├── src/main/java/com/sacl/
│   │   ├── controller/        ← REST endpoints
│   │   ├── model/             ← JPA entities (DB tables)
│   │   ├── repository/        ← Spring Data repos
│   │   └── service/           ← Business logic
│   └── src/main/resources/
│       ├── application.properties   ← DB config (port 8080, ddl-auto=update)
│       └── static/forms/      ← Legacy HTML forms (not used in React flow)
│
└── frontend/src/
    ├── pages/
    │   ├── PartNames.jsx       ← Admin: configure part standards & thresholds
    │   ├── QcRegister.jsx      ← Daily heat composition log
    │   ├── MicroStructure.jsx  ← Nodularity / matrix analysis per location
    │   ├── MicroTensile.jsx    ← Tensile strength test per location
    │   ├── ImpactTest.jsx      ← Charpy impact test per location
    │   ├── Reports.jsx         ← Reports view
    │   └── UserManagement.jsx  ← Admin: manage users
    ├── components/
    │   ├── PartNameSelect.jsx  ← Reusable part name dropdown
    │   └── ConfirmModal.jsx
    └── context/AuthContext.jsx ← Login / role state
```

---

## Database Config

```
Host:     localhost:1433
Database: sacl_quality
Username: sa
Password: YourStrong!Pass123
DDL:      ddl-auto=update  ← Hibernate auto-creates/alters tables on startup
```

---

## Roles & Access

| Role | Access |
|---|---|
| ADMIN | Everything |
| HOD | Approve records, view all, edit Part Names |
| HOF | First-level approval on QC/Micro/Tensile/Impact records |
| QC | Create/enter records |
| Viewer | Read-only |

---

## Part Names — Threshold System (Admin)

`PartNames.jsx` is the admin form where you set quality standards for each part. These thresholds are stored in the `part_names` DB table and fetched live in every form to validate entries.

### Threshold Sections → Which Forms They Apply To

#### 1. Metal Composition Thresholds (%)
→ **QC Register** (`QcRegister.jsx`) — Chemical Composition section  
Fields: C, Si, Mn, P, S, Mg F/L, Cu, Cr, Sn  
DB columns: `qcMinC/qcMaxC`, `qcMinSi/qcMaxSi`, `qcMinMn/qcMaxMn`, `qcMinP/qcMaxP`, `qcMinS/qcMaxS`, `qcMinMg/qcMaxMg`, `qcMinCu/qcMaxCu`, `qcMinCr/qcMaxCr`, `qcMinSn/qcMaxSn`

#### 2. Micro Structure Thresholds
→ **Micro Structure Analysis** (`MicroStructure.jsx`)  
Fields: Nodularity/Graphite Type %, Count (Nos/mm²), Ferrite %, Pearlite %, Carbide %, Nodule Size (display only)  
DB columns: `microMinNodularity/microMaxNodularity`, `microMinCount/microMaxCount`, `microMinFerrite/microMaxFerrite`, `microMinPearlite/microMaxPearlite`, `microMinCarbide/microMaxCarbide`, `microSize`

#### 3. Mechanical Properties
→ **Tensile Test** (`MicroTensile.jsx`) and **Impact Test** (`ImpactTest.jsx`)  
Fields: Tensile Strength, Yield 0.2% Strength, Yield 0.5% Strength, Elongation Percentage, Impact Strength  
DB columns: `tensileMinStrength/tensileMaxStrength`, `tensileMinYield/tensileMaxYield`, `tensileMinYield05/tensileMaxYield05`, `tensileMinElongation/tensileMaxElongation`, `impactMinSpec/impactMaxSpec`

#### 4. Process Parameter Thresholds
→ **QC Register** (`QcRegister.jsx`) — Process Parameters section  
Fields: Pouring Temp °C, Mg (Kgs), Stream Inoculant (gms/s), P.Time (sec)  
DB columns: `ppMinPouringTemp/ppMaxPouringTemp`, `ppMinMgKgs/ppMaxMgKgs`, `ppMinStreamInnoculant/ppMaxStreamInnoculant`, `ppMinPTimeSec/ppMaxPTimeSec`

---

## Location System

### Micro Locations (MicroStructure form)
Configured per part in PartNames admin (checkboxes).  
Options: **TRA, SBA, LBJ, BORE, SBA.CA, LBJ.CA**  
DB field: `microLocations` (comma-separated string, e.g. `"TRA,SBA,LBJ"`)

**Behaviour in MicroStructure form:**  
- If part has locations configured → form shows ALL locations as stacked cards, user fills each, saves one DB record per location simultaneously.
- If no locations → single generic entry form.
- Edit mode always shows single record.

### Mechanical Locations (Tensile + Impact forms)
Configured per part in PartNames admin (checkboxes).  
Options: **TRA, SBA**  
DB field: `mechLocations` (comma-separated string)

**Behaviour in MicroTensile and ImpactTest forms:**  
Same pattern — if part has mechLocations, shows TRA/SBA cards stacked vertically, saves one record per location.

---

## Key Backend Models

### PartName.java (`part_names` table)
All threshold fields + location config. Key fields added recently:
- `mechLocations` — TRA/SBA for tensile/impact
- `tensileMinYield05` / `tensileMaxYield05` — Yield 0.5% threshold
- `ppMin*/ppMax*` — Process parameter thresholds (4 params)

### MicroTensileTest.java (`micro_tensile_test` table)
- `yieldStrength05` — Yield @0.5% test result
- `mechLocation` — which location this record belongs to

### ImpactTest.java (`impact_test` table)
- `mechLocation` — which location this record belongs to

### MicroStructureAnalysis.java (`micro_structure_analysis` table)
- `microLocation` — which location this record belongs to (TRA, SBA, etc.)

---

## Recent Changes Summary (what was built in this session)

1. **PartNames form** — "Internal Code/Desc" renamed to "Date Code"
2. **PartNames form** — Yield 0.5% Strength (Min/Max) added to Mechanical Properties
3. **PartNames form** — "Nodularity" renamed to "Nodularity/Graphite Type"
4. **PartNames form** — All mechanical labels now have "Strength" suffix; Elongation = "Elongation Percentage"
5. **PartNames form** — Corrective Addition thresholds section removed; replaced with Process Parameter Thresholds
6. **QcRegister** — Pouring Temp, Mg Kgs, Stream Inoculant, P.Time now show/validate against thresholds
7. **PartNames form** — Threshold UI redesigned: compact **range-row** layout (`Label [Min] — [Max]`) instead of scattered grid
8. **PartNames form** — Added Mechanical Locations checkboxes (TRA, SBA)
9. **MicroStructure form** — Per-location batch entry: all configured locations shown as stacked cards, saves one record per location
10. **MicroTensile form** — Per-location batch entry using `mechLocations`; Yield @0.5% field added
11. **ImpactTest form** — Per-location batch entry using `mechLocations`
12. **Spring DevTools** added to pom.xml for faster backend dev cycle

---

## Pending / Next Steps (to discuss)

- Reports page — needs updating to reflect per-location records and new fields
- Corrective Addition thresholds were removed from PartNames UI but DB columns still exist — decide if to keep or migrate data
- The `version: '3.8'` in docker-compose.yml is deprecated (harmless warning)

---

## Important Notes for Claude

- `ddl-auto=update` — Hibernate adds new columns automatically on backend restart. No manual SQL migrations needed for model additions.
- Thresholds are fetched per-part via `/api/part-names/name/{partName}` endpoint.
- Validation is **client-side only** (red highlight + block save) — not enforced server-side.
- The `locKey()` helper in MicroStructure/MicroTensile/ImpactTest converts `SBA.CA` → `SBACA` for safe JS object key names.
- Edit mode in all forms always shows single-record data. Multi-location is only for new entries.
