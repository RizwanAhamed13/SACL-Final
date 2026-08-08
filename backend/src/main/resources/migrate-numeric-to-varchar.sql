-- PostgreSQL Migration
-- Convert QC Register numeric columns to VARCHAR(50)
ALTER TABLE qc_register
  ALTER COLUMN composition_c TYPE VARCHAR(50) USING composition_c::varchar,
  ALTER COLUMN composition_si TYPE VARCHAR(50) USING composition_si::varchar,
  ALTER COLUMN composition_mn TYPE VARCHAR(50) USING composition_mn::varchar,
  ALTER COLUMN composition_p TYPE VARCHAR(50) USING composition_p::varchar,
  ALTER COLUMN composition_s TYPE VARCHAR(50) USING composition_s::varchar,
  ALTER COLUMN composition_mg_first TYPE VARCHAR(50) USING composition_mg_first::varchar,
  ALTER COLUMN composition_mg_last TYPE VARCHAR(50) USING composition_mg_last::varchar,
  ALTER COLUMN composition_cu TYPE VARCHAR(50) USING composition_cu::varchar,
  ALTER COLUMN composition_cr TYPE VARCHAR(50) USING composition_cr::varchar,
  ALTER COLUMN composition_sn TYPE VARCHAR(50) USING composition_sn::varchar,
  ALTER COLUMN pouring_temp TYPE VARCHAR(50) USING pouring_temp::varchar,
  ALTER COLUMN tapping_wt_kgs TYPE VARCHAR(50) USING tapping_wt_kgs::varchar,
  ALTER COLUMN mg_kgs TYPE VARCHAR(50) USING mg_kgs::varchar,
  ALTER COLUMN res_mg_convertor_percent TYPE VARCHAR(50) USING res_mg_convertor_percent::varchar,
  ALTER COLUMN rec_mg_percent TYPE VARCHAR(50) USING rec_mg_percent::varchar,
  ALTER COLUMN stream_innoculant TYPE VARCHAR(50) USING stream_innoculant::varchar,
  ALTER COLUMN p_time_sec TYPE VARCHAR(50) USING p_time_sec::varchar,
  ALTER COLUMN corrective_c TYPE VARCHAR(50) USING corrective_c::varchar,
  ALTER COLUMN corrective_si TYPE VARCHAR(50) USING corrective_si::varchar,
  ALTER COLUMN corrective_mn TYPE VARCHAR(50) USING corrective_mn::varchar,
  ALTER COLUMN corrective_s TYPE VARCHAR(50) USING corrective_s::varchar,
  ALTER COLUMN corrective_cr TYPE VARCHAR(50) USING corrective_cr::varchar,
  ALTER COLUMN corrective_cu TYPE VARCHAR(50) USING corrective_cu::varchar,
  ALTER COLUMN corrective_sn TYPE VARCHAR(50) USING corrective_sn::varchar;

-- Convert Micro Structure Analysis numeric columns to VARCHAR(50)
ALTER TABLE micro_structure_analysis
  ALTER COLUMN nodularity_percent TYPE VARCHAR(50) USING nodularity_percent::varchar,
  ALTER COLUMN count_nos_per_mm2 TYPE VARCHAR(50) USING count_nos_per_mm2::varchar,
  ALTER COLUMN ferrite_percent TYPE VARCHAR(50) USING ferrite_percent::varchar,
  ALTER COLUMN pearlite_percent TYPE VARCHAR(50) USING pearlite_percent::varchar,
  ALTER COLUMN carbide_percent TYPE VARCHAR(50) USING carbide_percent::varchar;

-- Convert Micro Tensile Test numeric columns to VARCHAR(50)
ALTER TABLE micro_tensile_test
  ALTER COLUMN bar_dia_mm TYPE VARCHAR(50) USING bar_dia_mm::varchar,
  ALTER COLUMN gauge_length_mm TYPE VARCHAR(50) USING gauge_length_mm::varchar,
  ALTER COLUMN max_load_kn TYPE VARCHAR(50) USING max_load_kn::varchar,
  ALTER COLUMN yield_load_kn TYPE VARCHAR(50) USING yield_load_kn::varchar,
  ALTER COLUMN tensile_strength TYPE VARCHAR(50) USING tensile_strength::varchar,
  ALTER COLUMN yield_strength02 TYPE VARCHAR(50) USING yield_strength02::varchar,
  ALTER COLUMN yield_strength05 TYPE VARCHAR(50) USING yield_strength05::varchar,
  ALTER COLUMN elongation_percent TYPE VARCHAR(50) USING elongation_percent::varchar;

-- Convert Impact Test numeric columns to VARCHAR(50)
ALTER TABLE impact_test
  ALTER COLUMN observed_value1 TYPE VARCHAR(50) USING observed_value1::varchar,
  ALTER COLUMN observed_value2 TYPE VARCHAR(50) USING observed_value2::varchar,
  ALTER COLUMN observed_value3 TYPE VARCHAR(50) USING observed_value3::varchar;
