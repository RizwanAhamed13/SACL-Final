-- ============================================================
-- SACL Quality Management System — SQL Server Migration
-- MS SQL Server 2019 / 2022 / 2025
-- ============================================================
-- NOTE: You do NOT need to run this manually.
--       Hibernate (ddl-auto=update) auto-creates everything on first startup.
--       This file is a REFERENCE ONLY and a safety net.
--
-- If you ever need to run it manually, it is 100% safe:
--   - Uses IF NOT EXISTS / IF COL_LENGTH checks everywhere
--   - NEVER drops tables, columns, or data
--   - Can be run multiple times without any side effect
-- ============================================================

-- ── 1. users ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='mcetbcs043_users' AND xtype='U')
CREATE TABLE mcetbcs043_users (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name       NVARCHAR(255),
    username        NVARCHAR(255) NOT NULL,
    password        NVARCHAR(255),
    email           NVARCHAR(255),
    employee_id     NVARCHAR(255),
    role            NVARCHAR(100),
    form_permissions NVARCHAR(MAX),
    active          BIT DEFAULT 1,
    created_at      DATETIME2
);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='uq_users_username' AND object_id=OBJECT_ID('mcetbcs043_users'))
    ALTER TABLE mcetbcs043_users ADD CONSTRAINT uq_users_username UNIQUE (username);

IF COL_LENGTH('mcetbcs043_users','employee_id') IS NULL
    ALTER TABLE mcetbcs043_users ADD employee_id NVARCHAR(255);

IF COL_LENGTH('mcetbcs043_users','form_permissions') IS NULL
    ALTER TABLE mcetbcs043_users ADD form_permissions NVARCHAR(MAX);

-- ── 2. part_names ─────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='mcetbcs043_part_names' AND xtype='U')
CREATE TABLE mcetbcs043_part_names (
    id                       BIGINT IDENTITY(1,1) PRIMARY KEY,
    name                     NVARCHAR(255) NOT NULL,
    description              NVARCHAR(MAX),
    active                   BIT DEFAULT 1,
    created_at               DATETIME2,
    deleted_at               DATETIME2,
    micro_locations          NVARCHAR(255),
    mech_locations           NVARCHAR(255),
    impact_notch_types       NVARCHAR(255),
    -- Chemical
    qc_min_c  FLOAT, qc_max_c  FLOAT, qc_min_si FLOAT, qc_max_si FLOAT,
    qc_min_mn FLOAT, qc_max_mn FLOAT, qc_min_p  FLOAT, qc_max_p  FLOAT,
    qc_min_s  FLOAT, qc_max_s  FLOAT, qc_min_mg FLOAT, qc_max_mg FLOAT,
    qc_min_cu FLOAT, qc_max_cu FLOAT, qc_min_cr FLOAT, qc_max_cr FLOAT,
    qc_min_sn FLOAT, qc_max_sn FLOAT,
    -- Micro
    micro_min_nodularity FLOAT, micro_max_nodularity FLOAT,
    micro_min_count FLOAT,      micro_max_count FLOAT,
    micro_size NVARCHAR(50),
    micro_min_ferrite FLOAT,    micro_max_ferrite FLOAT,
    micro_min_pearlite FLOAT,   micro_max_pearlite FLOAT,
    micro_min_carbide FLOAT,    micro_max_carbide FLOAT,
    micro_size_min FLOAT,       micro_size_max FLOAT,
    -- Tensile
    tensile_min_strength FLOAT,   tensile_max_strength FLOAT,
    tensile_min_yield FLOAT,      tensile_max_yield FLOAT,
    tensile_min_yield05 FLOAT,    tensile_max_yield05 FLOAT,
    tensile_min_elongation FLOAT, tensile_max_elongation FLOAT,
    bar_dia_min FLOAT, bar_dia_max FLOAT,
    -- Impact (generic + per-notch)
    impact_min_spec FLOAT, impact_max_spec FLOAT,
    impact_min_unnotch FLOAT, impact_max_unnotch FLOAT,
    impact_min_unotch  FLOAT, impact_max_unotch  FLOAT,
    impact_min_vnotch  FLOAT, impact_max_vnotch  FLOAT,
    impact_min_t_r_a_unotch  FLOAT, impact_max_t_r_a_unotch  FLOAT,
    impact_min_t_r_a_vnotch  FLOAT, impact_max_t_r_a_vnotch  FLOAT,
    impact_min_t_r_a_unnotch FLOAT, impact_max_t_r_a_unnotch FLOAT,
    impact_min_s_b_a_unotch  FLOAT, impact_max_s_b_a_unotch  FLOAT,
    impact_min_s_b_a_vnotch  FLOAT, impact_max_s_b_a_vnotch  FLOAT,
    impact_min_s_b_a_unnotch FLOAT, impact_max_s_b_a_unnotch FLOAT,
    -- Process params
    pp_min_pouring_temp FLOAT,      pp_max_pouring_temp FLOAT,
    pp_min_mg_kgs FLOAT,            pp_max_mg_kgs FLOAT,
    pp_min_stream_innoculant FLOAT, pp_max_stream_innoculant FLOAT,
    pp_min_p_time_sec FLOAT,        pp_max_p_time_sec FLOAT,
    pp_min_res_mg_convertor FLOAT,  pp_max_res_mg_convertor FLOAT,
    -- Corrective
    corr_min_c FLOAT, corr_max_c FLOAT, corr_min_si FLOAT, corr_max_si FLOAT,
    corr_min_mn FLOAT,corr_max_mn FLOAT,corr_min_s FLOAT,  corr_max_s FLOAT,
    corr_min_cr FLOAT,corr_max_cr FLOAT,corr_min_cu FLOAT, corr_max_cu FLOAT,
    corr_min_sn FLOAT,corr_max_sn FLOAT
);

-- Add new columns if missing (for existing installations)
IF COL_LENGTH('mcetbcs043_part_names','impact_notch_types') IS NULL  ALTER TABLE mcetbcs043_part_names ADD impact_notch_types NVARCHAR(255);
IF COL_LENGTH('mcetbcs043_part_names','impact_min_unnotch')  IS NULL ALTER TABLE mcetbcs043_part_names ADD impact_min_unnotch FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','impact_max_unnotch')  IS NULL ALTER TABLE mcetbcs043_part_names ADD impact_max_unnotch FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','impact_min_unotch')   IS NULL ALTER TABLE mcetbcs043_part_names ADD impact_min_unotch  FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','impact_max_unotch')   IS NULL ALTER TABLE mcetbcs043_part_names ADD impact_max_unotch  FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','impact_min_vnotch')   IS NULL ALTER TABLE mcetbcs043_part_names ADD impact_min_vnotch  FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','impact_max_vnotch')   IS NULL ALTER TABLE mcetbcs043_part_names ADD impact_max_vnotch  FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','bar_dia_min')          IS NULL ALTER TABLE mcetbcs043_part_names ADD bar_dia_min        FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','bar_dia_max')          IS NULL ALTER TABLE mcetbcs043_part_names ADD bar_dia_max        FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','micro_size_min')       IS NULL ALTER TABLE mcetbcs043_part_names ADD micro_size_min     FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','micro_size_max')       IS NULL ALTER TABLE mcetbcs043_part_names ADD micro_size_max     FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','pp_min_res_mg_convertor') IS NULL ALTER TABLE mcetbcs043_part_names ADD pp_min_res_mg_convertor FLOAT;
IF COL_LENGTH('mcetbcs043_part_names','pp_max_res_mg_convertor') IS NULL ALTER TABLE mcetbcs043_part_names ADD pp_max_res_mg_convertor FLOAT;

-- ── 3. qc_register ───────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='mcetbcs043_qc_register' AND xtype='U')
CREATE TABLE mcetbcs043_qc_register (
    id                       BIGINT IDENTITY(1,1) PRIMARY KEY,
    disa                     NVARCHAR(255),
    date                     DATE,
    part_name                NVARCHAR(255),
    date_code                NVARCHAR(255),
    heat_code                NVARCHAR(255),
    qty_moulds               INT,
    composition_c            FLOAT, composition_si   FLOAT,
    composition_mn           FLOAT, composition_p    FLOAT,
    composition_s            FLOAT, composition_mg_fl FLOAT,
    composition_cu           FLOAT, composition_cr   FLOAT,
    composition_sn           FLOAT,
    time_of_pouring          NVARCHAR(255),
    pouring_temp             FLOAT,
    pp_code                  NVARCHAR(255),
    treatment_no             NVARCHAR(255),
    fc_no_heat_no            NVARCHAR(255),
    con_no                   NVARCHAR(255),
    tapping_time             NVARCHAR(255),
    corrective_c             FLOAT, corrective_si    FLOAT,
    corrective_mn            FLOAT, corrective_s     FLOAT,
    corrective_cr            FLOAT, corrective_cu    FLOAT,
    corrective_sn            FLOAT,
    tapping_wt_kgs           FLOAT,
    mg_kgs                   FLOAT,
    res_mg_convertor_percent FLOAT,
    rec_mg_percent           FLOAT,
    stream_innoculant        FLOAT,
    p_time_sec               FLOAT,
    pouring_temp_start       FLOAT, pouring_temp_end FLOAT,
    p_time_sec_start         FLOAT, p_time_sec_end   FLOAT,
    remarks                  NVARCHAR(MAX),
    hod_qc                   NVARCHAR(255),
    hof_approved_by          NVARCHAR(255),
    hod_approved_by          NVARCHAR(255),
    created_by               NVARCHAR(255),
    status                   NVARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at               DATETIME2
);

-- ── 4. micro_structure_analysis ──────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='mcetbcs043_micro_structure_analysis' AND xtype='U')
CREATE TABLE mcetbcs043_micro_structure_analysis (
    id                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    inspection_date      DATE,
    part_name            NVARCHAR(255),
    date_code            NVARCHAR(255),
    heat_code            NVARCHAR(255),
    micro_location       NVARCHAR(255),
    location_values      NVARCHAR(MAX),
    nodularity_percent   FLOAT,
    graphite_type        NVARCHAR(50),
    count_nos_per_mm2    FLOAT,
    size                 NVARCHAR(50),
    ferrite_percent      FLOAT, ferrite_percent_min  FLOAT, ferrite_percent_max  FLOAT,
    pearlite_percent     FLOAT, pearlite_percent_min FLOAT, pearlite_percent_max FLOAT,
    carbide_percent      FLOAT, carbide_percent_min  FLOAT, carbide_percent_max  FLOAT,
    size_min             FLOAT, size_max             FLOAT,
    remarks              NVARCHAR(MAX),
    approved_by          NVARCHAR(255),
    hof_approved_by      NVARCHAR(255),
    hod_approved_by      NVARCHAR(255),
    created_by           NVARCHAR(255),
    status               NVARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at           DATETIME2
);

IF COL_LENGTH('mcetbcs043_micro_structure_analysis','micro_location')  IS NULL ALTER TABLE mcetbcs043_micro_structure_analysis ADD micro_location  NVARCHAR(255);
IF COL_LENGTH('mcetbcs043_micro_structure_analysis','location_values') IS NULL ALTER TABLE mcetbcs043_micro_structure_analysis ADD location_values NVARCHAR(MAX);

-- ── 5. micro_tensile_test ─────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='mcetbcs043_micro_tensile_test' AND xtype='U')
CREATE TABLE mcetbcs043_micro_tensile_test (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    date_of_inspection  DATE,
    item                NVARCHAR(255),
    date_code           NVARCHAR(255),
    heat_code           NVARCHAR(255),
    mech_location       NVARCHAR(255),
    location_values     NVARCHAR(MAX),
    bar_dia_mm          FLOAT,
    gauge_length_mm     FLOAT,
    max_load_kn         FLOAT,
    yield_load_kn       FLOAT,
    tensile_strength    FLOAT,
    yield_strength02    FLOAT,
    yield_strength05    FLOAT,
    elongation_percent  FLOAT,
    remarks             NVARCHAR(MAX),
    approved_by         NVARCHAR(255),
    hof_approved_by     NVARCHAR(255),
    hod_approved_by     NVARCHAR(255),
    created_by          NVARCHAR(255),
    status              NVARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at          DATETIME2
);

IF COL_LENGTH('mcetbcs043_micro_tensile_test','mech_location')  IS NULL ALTER TABLE mcetbcs043_micro_tensile_test ADD mech_location  NVARCHAR(255);
IF COL_LENGTH('mcetbcs043_micro_tensile_test','location_values') IS NULL ALTER TABLE mcetbcs043_micro_tensile_test ADD location_values NVARCHAR(MAX);

-- ── 6. impact_test ────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='mcetbcs043_impact_test' AND xtype='U')
CREATE TABLE mcetbcs043_impact_test (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    date_of_inspection  DATE,
    part_name           NVARCHAR(255),
    date_code           NVARCHAR(255),
    specification       NVARCHAR(255),
    observed_value1     FLOAT,
    observed_value2     FLOAT,
    observed_value3     FLOAT,
    test_type           NVARCHAR(255),
    notch_type          NVARCHAR(50),
    mech_location       NVARCHAR(255),
    location_values     NVARCHAR(MAX),
    remarks             NVARCHAR(MAX),
    approved_by         NVARCHAR(255),
    hof_approved_by     NVARCHAR(255),
    hod_approved_by     NVARCHAR(255),
    created_by          NVARCHAR(255),
    status              NVARCHAR(50) DEFAULT 'QC_ENTRY',
    created_at          DATETIME2
);

IF COL_LENGTH('mcetbcs043_impact_test','location_values') IS NULL ALTER TABLE mcetbcs043_impact_test ADD location_values NVARCHAR(MAX);
IF COL_LENGTH('mcetbcs043_impact_test','mech_location')   IS NULL ALTER TABLE mcetbcs043_impact_test ADD mech_location  NVARCHAR(255);
IF COL_LENGTH('mcetbcs043_impact_test','notch_type')      IS NULL ALTER TABLE mcetbcs043_impact_test ADD notch_type      NVARCHAR(50);

-- ── 7. rejected_records ───────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='mcetbcs043_rejected_records' AND xtype='U')
CREATE TABLE mcetbcs043_rejected_records (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    form_type           NVARCHAR(100),
    original_id         BIGINT,
    data_json           NVARCHAR(MAX),
    rejected_by         NVARCHAR(255),
    rejection_stage     NVARCHAR(10),
    original_created_by NVARCHAR(255),
    rejected_at         DATETIME2
);

IF COL_LENGTH('mcetbcs043_rejected_records','rejection_stage')      IS NULL ALTER TABLE mcetbcs043_rejected_records ADD rejection_stage     NVARCHAR(10);
IF COL_LENGTH('mcetbcs043_rejected_records','original_created_by') IS NULL ALTER TABLE mcetbcs043_rejected_records ADD original_created_by NVARCHAR(255);
