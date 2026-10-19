USE `smart_apartment`;

DELIMITER $$
DROP PROCEDURE IF EXISTS ensure_task_started_at$$
CREATE PROCEDURE ensure_task_started_at()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'tasks'
      AND column_name = 'started_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN started_at DATETIME NULL AFTER due_date;
  END IF;
END$$
DELIMITER ;

CALL ensure_task_started_at();
DROP PROCEDURE ensure_task_started_at;

UPDATE tasks
SET started_at = CURRENT_TIMESTAMP
WHERE status = 'In Progress'
  AND started_at IS NULL;
