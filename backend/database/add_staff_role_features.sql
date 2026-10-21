USE `smart_apartment`;

-- Staff role features: work notes, accepting work, supervisor verification,
-- staff notifications, security visitor tracking and incident reports.
--
-- Run this once on your own MySQL database (after admin_panel_schema.sql).
-- It is safe to run more than once: columns and tables are only added when
-- they are missing, and no existing data is changed.

-- tasks.location
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'location'), 'SELECT 1', 'ALTER TABLE tasks ADD COLUMN location VARCHAR(150) NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tasks.work_notes
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'work_notes'), 'SELECT 1', 'ALTER TABLE tasks ADD COLUMN work_notes TEXT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tasks.accepted_at
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'accepted_at'), 'SELECT 1', 'ALTER TABLE tasks ADD COLUMN accepted_at DATETIME NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tasks.created_by_staff_id
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'created_by_staff_id'), 'SELECT 1', 'ALTER TABLE tasks ADD COLUMN created_by_staff_id INT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tasks.verified_at
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'verified_at'), 'SELECT 1', 'ALTER TABLE tasks ADD COLUMN verified_at DATETIME NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tasks.verified_by_staff_id
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'verified_by_staff_id'), 'SELECT 1', 'ALTER TABLE tasks ADD COLUMN verified_by_staff_id INT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tasks.verification_note
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'verification_note'), 'SELECT 1', 'ALTER TABLE tasks ADD COLUMN verification_note TEXT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- complaints.priority
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'complaints' AND column_name = 'priority'), 'SELECT 1', 'ALTER TABLE complaints ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT ''Medium''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- complaints.assigned_at
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'complaints' AND column_name = 'assigned_at'), 'SELECT 1', 'ALTER TABLE complaints ADD COLUMN assigned_at DATETIME NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- complaints.accepted_at
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'complaints' AND column_name = 'accepted_at'), 'SELECT 1', 'ALTER TABLE complaints ADD COLUMN accepted_at DATETIME NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- service_requests.assigned_at
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'service_requests' AND column_name = 'assigned_at'), 'SELECT 1', 'ALTER TABLE service_requests ADD COLUMN assigned_at DATETIME NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- service_requests.accepted_at
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'service_requests' AND column_name = 'accepted_at'), 'SELECT 1', 'ALTER TABLE service_requests ADD COLUMN accepted_at DATETIME NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- service_requests.work_notes
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'service_requests' AND column_name = 'work_notes'), 'SELECT 1', 'ALTER TABLE service_requests ADD COLUMN work_notes TEXT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- visitors.visitor_type
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'visitors' AND column_name = 'visitor_type'), 'SELECT 1', 'ALTER TABLE visitors ADD COLUMN visitor_type VARCHAR(30) NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- visitors.registered_by_staff_id
SET @sql = IF(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'visitors' AND column_name = 'registered_by_staff_id'), 'SELECT 1', 'ALTER TABLE visitors ADD COLUMN registered_by_staff_id INT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Notifications shown to staff (new assignments, reopened work, ...)
CREATE TABLE IF NOT EXISTS staff_notifications (
  id INT NOT NULL AUTO_INCREMENT,
  staff_id INT NOT NULL,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NULL,
  link VARCHAR(150) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_staff_notifications_staff (staff_id, is_read, created_at),
  CONSTRAINT fk_staff_notifications_staff
    FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE
);

-- Incident reports (Security) and issue reports (technical staff) sent to the
-- Facility Supervisor and Admin
CREATE TABLE IF NOT EXISTS incident_reports (
  report_id INT NOT NULL AUTO_INCREMENT,
  reporter_staff_id INT NULL,
  report_type VARCHAR(20) NOT NULL DEFAULT 'Incident',
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(150) NULL,
  occurred_at DATETIME NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status VARCHAR(20) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id),
  KEY idx_incident_reports_status (status, created_at)
);
