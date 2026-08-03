-- ============================================================
-- SACL Quality Management System — Safe Migration Script
-- PostgreSQL
-- ============================================================
-- SAFE TO RUN MULTIPLE TIMES — fully idempotent.
-- Uses IF NOT EXISTS everywhere.
-- NEVER drops any table, column, or index.
-- NEVER modifies existing column types.
-- ============================================================

-- ── 1. users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    full_name   VARCHAR(255),
    username    VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),
    email       VARCHAR(255),
    employee_id VARCHAR(255),
    role        VARCHAR(100),
    form_permissions TEXT,
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP
);

-- New columns added during development (safe to run even if they already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id    VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS form_permissions TEXT;

-- Unique index on employee_id (only if not already present)
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_employee_id ON users (employee_id)
    WHERE employee_id IS NOT NULL;

-- ── 2. part_names ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS part_names (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL UNIQUE,
    description             TEXT,
    active                  BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP,
    deleted_at              TIMESTAMP,
    micro_locations         VARCHAR(255),
    mech_locations          VARCHAR(255),

    -- Chemical thresholds
    qc_min_c  DOUBLE PRECISION, qc_max_c  DOUBLE PRECISION,
    qc_min_si DOUBLE PRECISION, qc_max_si DOUBLE PRECISION,
    qc_min_mn DOUBLE PRECISION, qc_max_mn DOUBLE PRECISION,
    qc_min_p  DOUBLE PRECISION, qc_max_p  DOUBLE PRECISION,
    qc_min_s  DOUBLE PRECISION, qc_max_s  DOUBLE PRECISION,
    qc_min_mg DOUBLE PRECISION, qc_max_mg DOUBLE PRECISION,
    qc_min_cu DOUBLE PRECISION, qc_max_cu DOUBLE PRECISION,
    qc_min_cr DOUBLE PRECISION, qc_max_cr DOUBLE PRECISION,
    qc_min_sn DOUBLE PRECISION, qc_max_sn DOUBLE PRECISION,

    -- Micro thresholds
    micro_min_nodularity DOUBLE PRECISION, micro_max_nodularity DOUBLE PRECISION,
    micro_min_count      DOUBLE PRECISION, micro_max_count      DOUBLE PRECISION,
    micro_size           VARCHAR(50),
    micro_min_ferrite    DOUBLE PRECISION, micro_max_ferrite    DOUBLE PRECISION,
    micro_min_pearlite   DOUBLE PRECISION, micro_max_pearlite   DOUBLE PRECISION,
    micro_min_carbide    DOUBLE PRECISION, micro_max_carbide    DOUBLE PRECISION,
    micro_size_min       DOUBLE PRECISION, micro_size_max       DOUBLE PRECISION,

    -- Tensile thresholds
    tensile_min_strength    DOUBLE PRECISION, tensile_max_strength    DOUBLE PRECISION,
    tensile_min_yield       DOUBLE PRECISION, tensile_max_yield       DOUBLE PRECISION,
    tensile_min_yield05     DOUBLE PRECISION, tensile_max_yield05     DOUBLE PRECISION,
    tensile_min_elongation  DOUBLE PRECISION, tensile_max_elongation  DOUBLE PRECISION,
    bar_dia_min             DOUBLE PRECISION, bar_dia_max             DOUBLE PRECISION,

    -- Impact thresholds
    impact_min_spec   DOUBLE PRECISION, impact_max_spec   DOUBLE PRECISION,
    impact_notch_types VARCHAR(255),
    impact_min_unnotch DOUBLE PRECISION, impact_max_unnotch DOUBLE PRECISION,
    impact_min_unotch  DOUBLE PRECISION, impact_max_unotch  DOUBLE PRECISION,
    impact_min_vnotch  DOUBLE PRECISION, impact_max_vnotch  DOUBLE PRECISION,
    impact_min_t_r_a_unotch  DOUBLE PRECISION, impact_max_t_r_a_unotch  DOUBLE PRECISION,
    impact_min_t_r_a_vnotch  DOUBLE PRECISION, impact_max_t_r_a_vnotch  DOUBLE PRECISION,
    impact_min_t_r_a_unnotch DOUBLE PRECISION, impact_max_t_r_a_unnotch DOUBLE PRECISION,
    impact_min_s_b_a_unotch  DOUBLE PRECISION, impact_max_s_b_a_unotch  DOUBLE PRECISION,
    impact_min_s_b_a_vnotch  DOUBLE PRECISION, impact_max_s_b_a_vnotch  DOUBLE PRECISION,
    impact_min_s_b_a_unnotch DOUBLE PRECISION, impact_max_s_b_a_unnotch DOUBLE PRECISION,

    -- Process parameters
    pp_min_pouring_temp     DOUBLE PRECISION, pp_max_pouring_temp     DOUBLE PRECISION,
    pp_min_mg_kgs           DOUBLE PRECISION, pp_max_mg_kgs           DOUBLE PRECISION,
    pp_min_stream_innoculant DOUBLE PRECISION, pp_max_stream_innoculant DOUBLE PRECISION,
    pp_min_p_time_sec       DOUBLE PRECISION, pp_max_p_time_sec       DOUBLE PRECISION,
    pp_min_res_mg_convertor DOUBLE PRECISION, pp_max_res_mg_convertor DOUBLE PRECISION,

    -- Corrective additions
    corr_min_c  DOUBLE PRECISION, corr_max_c  DOUBLE PRECISION,
    corr_min_si DOUBLE PRECISION, corr_max_si DOUBLE PRECISION,
    corr_min_mn DOUBLE PRECISION, corr_max_mn DOUBLE PRECISION,
    corr_min_s  DOUBLE PRECISION, corr_max_s  DOUBLE PRECISION,
    corr_min_cr DOUBLE PRECISION, corr_max_cr DOUBLE PRECISION,
    corr_min_cu DOUBLE PRECISION, corr_max_cu DOUBLE PRECISION,
    corr_min_sn DOUBLE PRECISION, corr_max_sn DOUBLE PRECISION
);

-- New columns added after initial release
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS impact_notch_types  VARCHAR(255);
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS impact_min_unnotch  DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS impact_max_unnotch  DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS impact_min_unotch   DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS impact_max_unotch   DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS impact_min_vnotch   DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS impact_max_vnotch   DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS bar_dia_min         DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS bar_dia_max         DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS micro_size_min      DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS micro_size_max      DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS pp_min_res_mg_convertor DOUBLE PRECISION;
ALTER TABLE part_names ADD COLUMN IF NOT EXISTS pp_max_res_mg_convertor DOUBLE PRECISION;

-- ── 3. qc_register ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qc_register (
    id                      BIGSERIAL PRIMARY KEY,
    disa                    VARCHAR(255),
    date                    DATE,
    part_name               VARCHAR(255),
    date_code               VARCHAR(255),
    heat_code               VARCHAR(255),
    qty_moulds              INTEGER,
    composition_c           DOUBLE PRECISION,
    composition_si          DOUBLE PRECISION,
    composition_mn          DOUBLE PRECISION,
    composition_p           DOUBLE PRECISION,
    composition_s           DOUBLE PRECISION,
    composition_mg_fl       DOUBLE PRECISION,
    composition_cu          DOUBLE PRECISION,
    composition_cr          DOUBLE PRECISION,
    composition_sn          DOUBLE PRECISION,
    time_of_pouring         VARCHAR(255),
    pouring_temp            DOUBLE PRECISION,
    pp_code                 VARCHAR(255),
    treatment_no            VARCHAR(255),
    fc_no_heat_no           VARCHAR(255),
    con_no                  VARCHAR(255),
    tapping_time            VARCHAR(255),
    corrective_c            DOUBLE PRECISION,
    corrective_si           DOUBLE PRECISION,
    corrective_mn           DOUBLE PRECISION,
    corrective_s            DOUBLE PRECISION,
    corrective_cr           DOUBLE PRECISION,
    corrective_cu           DOUBLE PRECISION,
    corrective_sn           DOUBLE PRECISION,
    tapping_wt_kgs          DOUBLE PRECISION,
    mg_kgs                  DOUBLE PRECISION,
    res_mg_convertor_percent DOUBLE PRECISION,
    rec_mg_percent          DOUBLE PRECISION,
    stream_innoculant       DOUBLE PRECISION,
    p_time_sec              DOUBLE PRECISION,
    pouring_temp_start      DOUBLE PRECISION,
    pouring_temp_end        DOUBLE PRECISION,
    p_time_sec_start        DOUBLE PRECISION,
    p_time_sec_end          DOUBLE PRECISION,
    remarks                 TEXT,
    hod_qc                  VARCHAR(255),
    hof_approved_by         VARCHAR(255),
    hod_approved_by         VARCHAR(255),
    created_by              VARCHAR(255),
    status                  VARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at              TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_qc_part_name ON qc_register (part_name);
CREATE INDEX IF NOT EXISTS idx_qc_date     ON qc_register (date);

-- ── 4. micro_structure_analysis ──────────────────────────────
CREATE TABLE IF NOT EXISTS micro_structure_analysis (
    id                  BIGSERIAL PRIMARY KEY,
    inspection_date     DATE,
    part_name           VARCHAR(255),
    date_code           VARCHAR(255),
    heat_code           VARCHAR(255),
    micro_location      VARCHAR(255),
    location_values     TEXT,
    nodularity_percent  DOUBLE PRECISION,
    graphite_type       VARCHAR(50),
    count_nos_per_mm2   DOUBLE PRECISION,
    size                VARCHAR(50),
    ferrite_percent     DOUBLE PRECISION,
    pearlite_percent    DOUBLE PRECISION,
    carbide_percent     DOUBLE PRECISION,
    ferrite_percent_min DOUBLE PRECISION,
    ferrite_percent_max DOUBLE PRECISION,
    pearlite_percent_min DOUBLE PRECISION,
    pearlite_percent_max DOUBLE PRECISION,
    carbide_percent_min  DOUBLE PRECISION,
    carbide_percent_max  DOUBLE PRECISION,
    size_min            DOUBLE PRECISION,
    size_max            DOUBLE PRECISION,
    remarks             TEXT,
    approved_by         VARCHAR(255),
    hof_approved_by     VARCHAR(255),
    hod_approved_by     VARCHAR(255),
    created_by          VARCHAR(255),
    status              VARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at          TIMESTAMP
);

ALTER TABLE micro_structure_analysis ADD COLUMN IF NOT EXISTS micro_location   VARCHAR(255);
ALTER TABLE micro_structure_analysis ADD COLUMN IF NOT EXISTS location_values  TEXT;

CREATE INDEX IF NOT EXISTS idx_micro_part_name        ON micro_structure_analysis (part_name);
CREATE INDEX IF NOT EXISTS idx_micro_inspection_date  ON micro_structure_analysis (inspection_date);

-- ── 5. micro_tensile_test ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS micro_tensile_test (
    id                  BIGSERIAL PRIMARY KEY,
    date_of_inspection  DATE,
    item                VARCHAR(255),
    date_code           VARCHAR(255),
    heat_code           VARCHAR(255),
    mech_location       VARCHAR(255),
    location_values     TEXT,
    bar_dia_mm          DOUBLE PRECISION,
    gauge_length_mm     DOUBLE PRECISION,
    max_load_kn         DOUBLE PRECISION,
    yield_load_kn       DOUBLE PRECISION,
    tensile_strength    DOUBLE PRECISION,
    yield_strength02    DOUBLE PRECISION,
    yield_strength05    DOUBLE PRECISION,
    elongation_percent  DOUBLE PRECISION,
    remarks             TEXT,
    approved_by         VARCHAR(255),
    hof_approved_by     VARCHAR(255),
    hod_approved_by     VARCHAR(255),
    created_by          VARCHAR(255),
    status              VARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at          TIMESTAMP
);

ALTER TABLE micro_tensile_test ADD COLUMN IF NOT EXISTS mech_location   VARCHAR(255);
ALTER TABLE micro_tensile_test ADD COLUMN IF NOT EXISTS location_values TEXT;

CREATE INDEX IF NOT EXISTS idx_tensile_item               ON micro_tensile_test (item);
CREATE INDEX IF NOT EXISTS idx_tensile_date_of_inspection ON micro_tensile_test (date_of_inspection);

-- ── 6. impact_test ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS impact_test (
    id                  BIGSERIAL PRIMARY KEY,
    date_of_inspection  DATE,
    part_name           VARCHAR(255),
    date_code           VARCHAR(255),
    specification       VARCHAR(255),
    observed_value1     DOUBLE PRECISION,
    observed_value2     DOUBLE PRECISION,
    observed_value3     DOUBLE PRECISION,
    test_type           VARCHAR(255),
    notch_type          VARCHAR(50),
    mech_location       VARCHAR(255),
    location_values     TEXT,
    remarks             TEXT,
    approved_by         VARCHAR(255),
    hof_approved_by     VARCHAR(255),
    hod_approved_by     VARCHAR(255),
    created_by          VARCHAR(255),
    status              VARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at          TIMESTAMP
);

ALTER TABLE impact_test ADD COLUMN IF NOT EXISTS location_values TEXT;
ALTER TABLE impact_test ADD COLUMN IF NOT EXISTS mech_location   VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_impact_part_name        ON impact_test (part_name);
CREATE INDEX IF NOT EXISTS idx_impact_date_of_inspection ON impact_test (date_of_inspection);

-- ── 7. rejected_records ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS rejected_records (
    id                  BIGSERIAL PRIMARY KEY,
    form_type           VARCHAR(100),
    original_id         BIGINT,
    data_json           TEXT,
    rejected_by         VARCHAR(255),
    rejection_stage     VARCHAR(10),
    original_created_by VARCHAR(255),
    rejected_at         TIMESTAMP
);

ALTER TABLE rejected_records ADD COLUMN IF NOT EXISTS rejection_stage     VARCHAR(10);
ALTER TABLE rejected_records ADD COLUMN IF NOT EXISTS original_created_by VARCHAR(255);

-- ── Done ──────────────────────────────────────────────────────
-- All tables and columns created safely.
-- Existing data is untouched.
-- Run this script again anytime — it is fully idempotent.
