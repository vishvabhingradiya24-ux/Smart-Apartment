USE `smart_apartment`;

SET @add_staff_department_sql = IF(
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'staff'
      AND column_name = 'department'
  ),
  'SELECT 1',
  'ALTER TABLE staff ADD COLUMN department ENUM(''Maintenance'', ''Electrical'', ''Plumbing'', ''Housekeeping'', ''Garden Maintenance'', ''Security'', ''Facility Supervisor'') NULL AFTER phone'
);
PREPARE add_staff_department_statement FROM @add_staff_department_sql;
EXECUTE add_staff_department_statement;
DEALLOCATE PREPARE add_staff_department_statement;
