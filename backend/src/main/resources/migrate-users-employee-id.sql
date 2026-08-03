-- Migration: replace auto-generated Long 'id' PK with String 'employee_id' PK
-- Run this ONCE against sacl_quality before restarting the application.
-- After this script runs, Hibernate ddl-auto=update will recreate the table correctly
-- and SaclApplication will seed the admin user with employeeId = 'EMP001'.

-- Drop dependent foreign keys first if any exist
-- (add ALTER TABLE statements here if other tables reference dbo.users)

DROP TABLE IF EXISTS [dbo].[users];

-- Hibernate will recreate the table on next startup with employee_id as PK (VARCHAR).
