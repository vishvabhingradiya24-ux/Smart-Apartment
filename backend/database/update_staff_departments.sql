USE `smart_apartment`;

-- Adds the "Security" and "Facility Supervisor" staff types to the staff table.
-- Safe to run more than once. Existing staff keep their current type.
-- Every developer must run this once on their own MySQL database after
-- pulling this change, otherwise registering those two types will fail.

ALTER TABLE staff
  MODIFY COLUMN department ENUM(
    'Maintenance',
    'Electrical',
    'Plumbing',
    'Housekeeping',
    'Garden Maintenance',
    'Security',
    'Facility Supervisor'
  ) NULL;
