-- Run against the Smart Apartment database after resolving any existing
-- duplicate Resident flat assignments reported by this migration.

DELIMITER $$
DROP PROCEDURE IF EXISTS ensure_unique_resident_flat$$
CREATE PROCEDURE ensure_unique_resident_flat()
BEGIN
  IF EXISTS (
    SELECT 1
    FROM residents
    WHERE user_type = 'Resident'
      AND block_wing IS NOT NULL
      AND flat_number IS NOT NULL
    GROUP BY block_wing, flat_number
    HAVING COUNT(*) > 1
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Resolve duplicate Resident flat assignments before adding uq_residents_flat';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'residents'
      AND index_name = 'uq_residents_flat'
  ) THEN
    ALTER TABLE residents
      ADD UNIQUE KEY uq_residents_flat (block_wing, flat_number);
  END IF;
END$$
DELIMITER ;

CALL ensure_unique_resident_flat();
DROP PROCEDURE ensure_unique_resident_flat;