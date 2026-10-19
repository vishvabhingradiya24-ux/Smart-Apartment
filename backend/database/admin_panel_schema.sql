USE `smart_apartment`;

-- Creates the core tables first, then applies the admin and application schema.

CREATE TABLE IF NOT EXISTS admins (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  society_id INT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS residents (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  user_type VARCHAR(30) NOT NULL,
  block_wing VARCHAR(10) NULL,
  flat_number VARCHAR(10) NULL,
  ownership_type ENUM('Owner', 'Rent') NULL,
  password VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_residents_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  department ENUM('Maintenance', 'Electrical', 'Plumbing', 'Housekeeping', 'Garden Maintenance') NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_staff_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_reset_otps_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS societies (
  society_id INT NOT NULL AUTO_INCREMENT,
  society_name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL DEFAULT '',
  contact_email VARCHAR(150) NOT NULL DEFAULT '',
  contact_phone VARCHAR(30) NOT NULL DEFAULT '',
  total_blocks INT NOT NULL DEFAULT 0,
  total_flats INT NOT NULL DEFAULT 0,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (society_id),
  UNIQUE KEY uq_societies_name (society_name)
);

INSERT INTO societies
  (society_name, address, contact_email, contact_phone, total_blocks, total_flats)
SELECT 'Green Valley Apartment', 'Ahmedabad, Gujarat', 'admin@greenvalley.com', '+91 98765 43210', 4, 240
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM societies);

DELIMITER $$
DROP PROCEDURE IF EXISTS ensure_admin_schema_column$$
CREATE PROCEDURE ensure_admin_schema_column(
  IN target_table VARCHAR(64),
  IN target_column VARCHAR(64),
  IN column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = target_table
      AND column_name = target_column
  ) THEN
    SET @admin_schema_sql = CONCAT(
      'ALTER TABLE `', REPLACE(target_table, '`', '``'),
      '` ADD COLUMN `', REPLACE(target_column, '`', '``'),
      '` ', column_definition
    );
    PREPARE admin_schema_statement FROM @admin_schema_sql;
    EXECUTE admin_schema_statement;
    DEALLOCATE PREPARE admin_schema_statement;
  END IF;
END$$
DELIMITER ;

CALL ensure_admin_schema_column('admins', 'phone', 'VARCHAR(30) NULL AFTER email');
CALL ensure_admin_schema_column('admins', 'society_id', 'INT NULL AFTER phone');
CALL ensure_admin_schema_column('admins', 'notification_preferences', 'JSON NULL AFTER society_id');
CALL ensure_admin_schema_column('admins', 'security_preferences', 'JSON NULL AFTER notification_preferences');
CALL ensure_admin_schema_column('residents', 'ownership_type', "ENUM('Owner', 'Rent') NULL AFTER flat_number");
CALL ensure_admin_schema_column('residents', 'is_active', 'TINYINT(1) NOT NULL DEFAULT 1 AFTER ownership_type');
CALL ensure_admin_schema_column('residents', 'reset_otp_hash', 'VARCHAR(255) NULL AFTER is_active');
CALL ensure_admin_schema_column('residents', 'reset_otp_expires_at', 'DATETIME NULL AFTER reset_otp_hash');
CALL ensure_admin_schema_column('residents', 'reset_otp_attempts', 'INT NOT NULL DEFAULT 0 AFTER reset_otp_expires_at');
DROP PROCEDURE ensure_admin_schema_column;

DELIMITER $$
DROP PROCEDURE IF EXISTS migrate_admin_preferences$$
CREATE PROCEDURE migrate_admin_preferences()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'admin_preferences'
  ) THEN
    SET @admin_preferences_migration_sql =
      'UPDATE admins a
       INNER JOIN admin_preferences p ON p.admin_id = a.id
       SET a.notification_preferences = COALESCE(a.notification_preferences, p.notification_preferences),
           a.security_preferences = COALESCE(a.security_preferences, p.security_preferences)';
    PREPARE admin_preferences_migration_statement FROM @admin_preferences_migration_sql;
    EXECUTE admin_preferences_migration_statement;
    DEALLOCATE PREPARE admin_preferences_migration_statement;
  END IF;
END$$
DELIMITER ;

CALL migrate_admin_preferences();
DROP PROCEDURE migrate_admin_preferences;
DROP TABLE IF EXISTS admin_preferences;

DELIMITER $$
DROP PROCEDURE IF EXISTS migrate_password_reset_otps$$
CREATE PROCEDURE migrate_password_reset_otps()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'password_reset_otps'
  ) THEN
    SET @password_reset_otp_migration_sql =
      'UPDATE residents r
       INNER JOIN (
         SELECT p.email, p.otp_hash, p.expires_at, p.attempts
         FROM password_reset_otps p
         INNER JOIN (
           SELECT email, MAX(id) AS id
           FROM password_reset_otps
           GROUP BY email
         ) latest ON latest.id = p.id
       ) otp ON otp.email = r.email
       SET r.reset_otp_hash = COALESCE(r.reset_otp_hash, otp.otp_hash),
           r.reset_otp_expires_at = COALESCE(r.reset_otp_expires_at, otp.expires_at),
           r.reset_otp_attempts = otp.attempts
       WHERE r.reset_otp_hash IS NULL';
    PREPARE password_reset_otp_migration_statement FROM @password_reset_otp_migration_sql;
    EXECUTE password_reset_otp_migration_statement;
    DEALLOCATE PREPARE password_reset_otp_migration_statement;
  END IF;
END$$
DELIMITER ;

CALL migrate_password_reset_otps();
DROP PROCEDURE migrate_password_reset_otps;
DROP TABLE IF EXISTS password_reset_otps;

DELIMITER $$
DROP PROCEDURE IF EXISTS ensure_resident_validation_constraints$$
CREATE PROCEDURE ensure_resident_validation_constraints()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'residents'
      AND constraint_name = 'chk_residents_names'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE residents
      ADD CONSTRAINT chk_residents_names CHECK (
        COALESCE(user_type, '') <> 'Resident'
        OR (
          first_name IS NOT NULL AND CHAR_LENGTH(TRIM(first_name)) BETWEEN 1 AND 100
          AND last_name IS NOT NULL AND CHAR_LENGTH(TRIM(last_name)) BETWEEN 1 AND 100
          AND TRIM(first_name) REGEXP '^[[:alpha:]][[:alpha:] .''-]*$'
          AND TRIM(last_name) REGEXP '^[[:alpha:]][[:alpha:] .''-]*$'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'residents'
      AND constraint_name = 'chk_residents_email'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE residents
      ADD CONSTRAINT chk_residents_email CHECK (
        COALESCE(user_type, '') <> 'Resident'
        OR (
          email IS NOT NULL
          AND CHAR_LENGTH(TRIM(email)) BETWEEN 3 AND 150
          AND TRIM(email) REGEXP '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
        )
      );
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'residents'
      AND constraint_name = 'chk_residents_phone'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE residents DROP CHECK chk_residents_phone;
  END IF;
  ALTER TABLE residents
    ADD CONSTRAINT chk_residents_phone CHECK (
      COALESCE(user_type, '') <> 'Resident'
      OR (
        phone IS NOT NULL
        AND CHAR_LENGTH(phone) = 10
        AND phone REGEXP '^[0-9]{10}$'
      )
    );

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'residents'
      AND constraint_name = 'chk_residents_assignment'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE residents
      ADD CONSTRAINT chk_residents_assignment CHECK (
        COALESCE(user_type, '') <> 'Resident'
        OR (
          block_wing IS NOT NULL AND block_wing IN ('A', 'B', 'C', 'D')
          AND flat_number IS NOT NULL AND flat_number REGEXP '^[1-5]0[1-4]$'
          AND ownership_type IS NOT NULL AND ownership_type IN ('Owner', 'Rent')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'residents'
      AND non_unique = 0
    GROUP BY index_name
    HAVING COUNT(*) = 1 AND MAX(column_name = 'email') = 1
  ) THEN
    ALTER TABLE residents ADD UNIQUE KEY uq_residents_email (email);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'residents'
      AND index_name = 'uq_residents_flat'
  ) THEN
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

    ALTER TABLE residents ADD UNIQUE KEY uq_residents_flat (block_wing, flat_number);
  END IF;
END$$
DELIMITER ;

CALL ensure_resident_validation_constraints();
DROP PROCEDURE ensure_resident_validation_constraints;

UPDATE admins
SET society_id = (SELECT society_id FROM societies ORDER BY society_id LIMIT 1)
WHERE society_id IS NULL
  AND id > 0;

DELIMITER $$
DROP PROCEDURE IF EXISTS ensure_admin_society_foreign_key$$
CREATE PROCEDURE ensure_admin_society_foreign_key()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'admins'
      AND constraint_name = 'fk_admins_society'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE admins
      ADD CONSTRAINT fk_admins_society
      FOREIGN KEY (society_id) REFERENCES societies(society_id)
      ON DELETE SET NULL;
  END IF;
END$$
DELIMITER ;

CALL ensure_admin_society_foreign_key();
DROP PROCEDURE ensure_admin_society_foreign_key;

CREATE TABLE IF NOT EXISTS admin_notification_reads (
  admin_id INT NOT NULL,
  notification_id VARCHAR(100) NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id, notification_id),
  CONSTRAINT fk_admin_notification_reads_admin
    FOREIGN KEY (admin_id) REFERENCES admins(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT NOT NULL AUTO_INCREMENT,
  resident_id INT NOT NULL,
  complaint_title VARCHAR(200) NOT NULL,
  complaint_description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  user_id INT NULL,
  assigned_staff_id INT NULL,
  resolution_details TEXT NULL,
  complaint_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (complaint_id),
  KEY idx_complaints_resident (resident_id),
  KEY idx_complaints_staff (assigned_staff_id),
  KEY idx_complaints_status_date (status, complaint_date),
  CONSTRAINT fk_complaints_resident
    FOREIGN KEY (resident_id) REFERENCES residents(id),
  CONSTRAINT fk_complaints_staff
    FOREIGN KEY (assigned_staff_id) REFERENCES staff(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id INT NOT NULL AUTO_INCREMENT,
  resident_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  billing_month VARCHAR(40) NOT NULL,
  due_date DATE NULL,
  paid_date DATETIME NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  payment_method VARCHAR(80) NULL,
  transaction_id VARCHAR(150) NULL,
  razorpay_order_id VARCHAR(150) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_resident_due (resident_id, due_date),
  KEY idx_payments_status_created (status, created_at),
  CONSTRAINT fk_payments_resident
    FOREIGN KEY (resident_id) REFERENCES residents(id)
);

CREATE TABLE IF NOT EXISTS visitors (
  visitor_id INT NOT NULL AUTO_INCREMENT,
  resident_id INT NOT NULL,
  visitor_name VARCHAR(150) NOT NULL,
  contact_number VARCHAR(30) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  visit_date DATE NOT NULL,
  expected_time TIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  entry_time DATETIME NULL,
  exit_time DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (visitor_id),
  KEY idx_visitors_resident_date (resident_id, visit_date),
  KEY idx_visitors_status_date (status, visit_date),
  CONSTRAINT fk_visitors_resident
    FOREIGN KEY (resident_id) REFERENCES residents(id)
);

CREATE TABLE IF NOT EXISTS facilities (
  facility_id INT NOT NULL AUTO_INCREMENT,
  facility_name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  location VARCHAR(150) NULL,
  availability_status VARCHAR(30) NOT NULL DEFAULT 'Available',
  base_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  charge_period VARCHAR(40) NOT NULL DEFAULT 'Per Booking',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (facility_id),
  KEY idx_facilities_status_name (availability_status, facility_name)
);

CREATE TABLE IF NOT EXISTS facility_addons (
  addon_id INT NOT NULL AUTO_INCREMENT,
  addon_name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  charge_type VARCHAR(30) NOT NULL DEFAULT 'Fixed',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (addon_id),
  KEY idx_facility_addons_status_name (status, addon_name)
);

CREATE TABLE IF NOT EXISTS facility_bookings (
  booking_id INT NOT NULL AUTO_INCREMENT,
  facility_id INT NOT NULL,
  resident_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  number_of_people INT NOT NULL,
  additional_requirements TEXT NULL,
  facility_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  additional_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_id),
  KEY idx_facility_bookings_slot (facility_id, booking_date, status),
  KEY idx_facility_bookings_resident (resident_id, booking_date),
  CONSTRAINT fk_facility_bookings_facility
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id),
  CONSTRAINT fk_facility_bookings_resident
    FOREIGN KEY (resident_id) REFERENCES residents(id)
);

CREATE TABLE IF NOT EXISTS booking_addons (
  booking_addon_id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  addon_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (booking_addon_id),
  KEY idx_booking_addons_booking (booking_id),
  CONSTRAINT fk_booking_addons_booking
    FOREIGN KEY (booking_id) REFERENCES facility_bookings(booking_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_booking_addons_addon
    FOREIGN KEY (addon_id) REFERENCES facility_addons(addon_id)
);

CREATE TABLE IF NOT EXISTS service_requests (
  service_request_id INT NOT NULL AUTO_INCREMENT,
  resident_id INT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  request_description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  assigned_to INT NULL,
  request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_date DATETIME NULL,
  PRIMARY KEY (service_request_id),
  KEY idx_service_requests_resident_date (resident_id, request_date),
  KEY idx_service_requests_staff_status (assigned_to, status),
  CONSTRAINT fk_service_requests_resident
    FOREIGN KEY (resident_id) REFERENCES residents(id),
  CONSTRAINT fk_service_requests_staff
    FOREIGN KEY (assigned_to) REFERENCES staff(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  task_id INT NOT NULL AUTO_INCREMENT,
  task_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  assigned_to INT NOT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'Normal',
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  due_date DATE NULL,
  started_at DATETIME NULL,
  completed_date DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id),
  KEY idx_tasks_assigned_status_created (assigned_to, status, created_at),
  CONSTRAINT fk_tasks_staff
    FOREIGN KEY (assigned_to) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS assets (
  asset_id INT NOT NULL AUTO_INCREMENT,
  asset_name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  assigned INT NOT NULL DEFAULT 0,
  condition_status VARCHAR(40) NOT NULL DEFAULT 'Good',
  location VARCHAR(150) NOT NULL DEFAULT '',
  status ENUM('Available', 'In Use', 'Maintenance') NOT NULL DEFAULT 'Available',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (asset_id),
  CONSTRAINT chk_assets_quantity CHECK (quantity >= 0),
  CONSTRAINT chk_assets_assigned CHECK (assigned >= 0 AND assigned <= quantity)
);

CREATE TABLE IF NOT EXISTS notices (
  notice_id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  notice_type VARCHAR(100) NOT NULL,
  posted_by INT NULL,
  publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATETIME NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notice_id),
  KEY idx_notices_status_publish (status, publish_date),
  CONSTRAINT fk_notices_admin
    FOREIGN KEY (posted_by) REFERENCES admins(id)
    ON DELETE SET NULL
);
