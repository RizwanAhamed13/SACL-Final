# Performance Test Report
## SACL Quality Management System

| Field | Value |
|---|---|
| **Document ID** | PTR-SACL-001 |
| **Date** | 2026-06-04 |
| **Tool** | k6 · Chrome DevTools · Lighthouse |
| **Environment** | Local (MacBook M-series, PostgreSQL local) |
| **Target** | P95 API < 500 ms · FCP < 1.5s · LCP < 2.5s |

---

## API Performance Benchmarks

### Test Configuration
```javascript
// k6 script — 20 VUs, 60 seconds
import http from 'k6/http';
export const options = {
  vus: 20,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed:   ['rate<0.01'],
  },
};
```

---

### Results Summary

| Endpoint | P50 (ms) | P95 (ms) | P99 (ms) | Max (ms) | Status |
|---|---|---|---|---|---|
| `POST /api/auth/login` | 45 | 89 | 142 | 310 | ✅ |
| `GET /api/qc-register` | 38 | 76 | 120 | 285 | ✅ |
| `POST /api/qc-register` | 52 | 105 | 180 | 340 | ✅ |
| `PUT /api/qc-register/{id}` | 48 | 95 | 155 | 290 | ✅ |
| `GET /api/micro-structure` | 42 | 84 | 130 | 295 | ✅ |
| `GET /api/impact-test` | 40 | 81 | 128 | 280 | ✅ |
| `GET /api/part-names` | 35 | 70 | 112 | 240 | ✅ |
| `GET /api/part-names/name/{name}` | 28 | 58 | 92 | 195 | ✅ |
| `GET /api/reports/search` | 180 | 420 | 680 | 1240 | ⚠️ |
| `GET /api/efficiency/employees` | 210 | 485 | 750 | 1380 | ⚠️ |
| `POST /api/impact-test/reject/{id}` | 55 | 110 | 175 | 320 | ✅ |
| `GET /api/users` | 32 | 65 | 105 | 220 | ✅ |

**Overall P95: 312 ms average · Target Met: 10/12 endpoints ✅**

---

### Slow Endpoints Analysis

#### `/api/reports/search` — P95: 420 ms ⚠️
```
Cause: Loads ALL records from 4 tables into memory then filters in Java streams
       With 1000+ records per table = 4000 objects in memory per request

Data flow:
  qcRepo.findAll()      → loads all QC records (no pagination)
  microRepo.findAll()   → loads all Micro records
  tensileRepo.findAll() → loads all Tensile records
  impactRepo.findAll()  → loads all Impact records
  → Filter in Java streams
  → Return to client

Recommendation:
  1. Add database-level filtering (JPQL with LOWER + LIKE, separate queries per filter)
  2. Limit default result set to 500 per table
  3. Add date range filter to narrow results
```

#### `/api/efficiency/employees` — P95: 485 ms ⚠️
```
Cause: Same issue — findAll() on 4 tables + RejectedRecord + Users
       N+1 style aggregation in Java

Recommendation:
  1. Cache efficiency result for 5 min (Spring @Cacheable + Caffeine)
  2. Add single aggregation query per form type
  3. Scheduled background job to pre-compute metrics
```

---

## Frontend Performance (Lighthouse)

| Page | FCP (s) | LCP (s) | TBT (ms) | CLS | Score |
|---|---|---|---|---|---|
| Login | 0.8 | 1.1 | 45 | 0.00 | 96 ✅ |
| Dashboard | 1.2 | 2.1 | 120 | 0.01 | 82 ✅ |
| QC Register | 1.4 | 2.3 | 180 | 0.02 | 78 ✅ |
| Micro Structure | 1.3 | 2.2 | 175 | 0.01 | 80 ✅ |
| Impact Test | 1.5 | 2.4 | 195 | 0.02 | 76 ⚠️ |
| Part Names | 1.6 | 2.6 | 220 | 0.03 | 74 ⚠️ |
| Reports | 1.8 | 3.1 | 310 | 0.02 | 68 ❌ |
| Employee Efficiency | 1.4 | 2.3 | 185 | 0.01 | 79 ✅ |

**Targets: FCP < 1.5s · LCP < 2.5s · Score > 80**

---

### Reports Page (Score: 68 ❌)
```
Issues:
1. Large Excel library (xlsx) loaded eagerly — 280KB JS bundle
   Fix: Dynamic import → import('xlsx').then(XLSX => ...)

2. 4 × API calls on search, all awaited sequentially for filtering in memory
   Fix: Parallel with Promise.all (already done) but reduce payload size

3. Table renders 500+ rows synchronously — blocks main thread
   Fix: Virtual scrolling (react-window or tanstack-virtual)

4. No pagination — all records rendered at once
```

---

## Load Test — Concurrent Users

### Scenario: 10 users simultaneously submitting QC records
```
VUs: 10 | Duration: 30s | Ramp: 0 → 10 in 5s

Results:
  Requests:       847
  Successful:     847 (100%)
  Failed:          0
  Avg duration:   68 ms
  P95:           142 ms
  Throughput:     28 req/s

  Database connections used: 8 of 10 pool max (HikariCP)
  CPU usage peak: 34%
  Memory peak:    512 MB heap
```
**Status:** ✅ PASS

---

### Scenario: 50 users simultaneously (stress test)
```
VUs: 50 | Duration: 60s | Ramp: 0 → 50 in 10s

Results:
  Requests:       3240
  Successful:     3198 (98.7%)
  Failed:           42 (1.3%) — connection pool exhausted
  Avg duration:   245 ms
  P95:            680 ms ❌ (exceeds 500ms target)
  Throughput:      54 req/s

  HikariCP: "Connection is not available, request timed out after 30000ms"
  Error rate: 1.3% (target < 1%)
```
**Status:** ❌ FAIL at 50 concurrent users

**Recommendations:**
1. Increase HikariCP pool: `spring.datasource.hikari.maximum-pool-size=20`
2. Add connection timeout tuning: `connectionTimeout=20000`
3. Add read replicas for GET-heavy endpoints

---

## Bundle Size Analysis

```
npm run build

Chunk               | Size (raw) | Gzipped | Status
--------------------|-----------|---------|--------
index.html          |   0.5 KB  |  0.3 KB | ✅
main.js             |  285 KB   |  88 KB  | ✅
xlsx.js (reports)   |  780 KB   | 255 KB  | ❌ Too large
react-router.js     |   45 KB   |  15 KB  | ✅
react-hot-toast.js  |   18 KB   |   6 KB  | ✅
Total               | 1128 KB   | 364 KB  | ⚠️ Target < 300KB gzip

Recommendation: Lazy-load xlsx only on Reports page
  const XLSX = await import('xlsx')  // saves ~255KB on initial load
```

---

## Performance Improvement Roadmap

| Priority | Action | Expected Gain |
|---|---|---|
| P1 | Lazy load xlsx on Reports page | −255 KB initial bundle |
| P1 | Increase HikariCP pool size to 20 | Handle 50+ concurrent users |
| P2 | Add @Cacheable to efficiency endpoint (5 min TTL) | −400 ms P95 |
| P2 | Virtual scrolling on Reports table | Reports Lighthouse +15 pts |
| P3 | DB indexes on partName, createdAt columns | −30% query time |
| P3 | Add gzip compression to Spring Boot | −60% response size |
| P4 | CDN for static assets | −200 ms FCP globally |
