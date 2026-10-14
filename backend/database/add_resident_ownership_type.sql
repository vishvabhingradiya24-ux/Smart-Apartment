-- Prefer admin_panel_schema.sql for a complete setup. This standalone migration is repeatable.
DELIMITER $$
DROP PROCEDURE IF EXISTS ensure_resident_ownership_type$$
CREATE PROCEDURE ensure_resident_ownership_type()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'residents'
      AND column_name = 'ownership_type'
  ) THEN
    ALTER TABLE residents
      ADD COLUMN ownership_type ENUM('Owner', 'Rent') NULL AFTER flat_number;
  END IF;
END$$
DELIMITER ;

CALL ensure_resident_ownership_type();
DROP PROCEDURE ensure_resident_ownership_type;
