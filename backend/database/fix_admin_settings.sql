USE `smart_apartment`;

-- Apply this migration to existing databases where Admin Settings cannot load.
-- Safe to rerun: existing preference values and society assignments are kept.

SET @sql = IF(
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'admins'
      AND column_name = 'notification_preferences'
  ),
  'SELECT 1',
  'ALTER TABLE admins ADD COLUMN notification_preferences JSON NULL AFTER society_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'admins'
      AND column_name = 'security_preferences'
  ),
  'SELECT 1',
  'ALTER TABLE admins ADD COLUMN security_preferences JSON NULL AFTER notification_preferences'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Link an unassigned admin only when there is exactly one society.
UPDATE admins a
JOIN (
  SELECT MIN(society_id) AS society_id
  FROM societies
  HAVING COUNT(*) = 1
) s
SET a.society_id = s.society_id
WHERE a.society_id IS NULL;
