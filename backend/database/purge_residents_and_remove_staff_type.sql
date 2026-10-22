-- Select the Smart Apartment database before running this migration.
-- Permanently removes Resident accounts and their linked records.

START TRANSACTION;

DELETE booking_addons
FROM booking_addons
JOIN facility_bookings ON facility_bookings.booking_id = booking_addons.booking_id
JOIN residents ON residents.id = facility_bookings.resident_id
WHERE residents.user_type = 'Resident';

DELETE complaints
FROM complaints
LEFT JOIN residents ON residents.id = complaints.resident_id
WHERE residents.user_type = 'Resident';

DELETE payments
FROM payments
JOIN residents ON residents.id = payments.resident_id
WHERE residents.user_type = 'Resident';

DELETE visitors
FROM visitors
JOIN residents ON residents.id = visitors.resident_id
WHERE residents.user_type = 'Resident';

DELETE facility_bookings
FROM facility_bookings
JOIN residents ON residents.id = facility_bookings.resident_id
WHERE residents.user_type = 'Resident';

DELETE FROM residents WHERE user_type = 'Resident';

COMMIT;

SET @drop_staff_type_sql = IF(
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'staff'
      AND column_name = 'staff_type'
  ),
  'ALTER TABLE staff DROP COLUMN staff_type',
  'SELECT 1'
);
PREPARE drop_staff_type_statement FROM @drop_staff_type_sql;
EXECUTE drop_staff_type_statement;
DEALLOCATE PREPARE drop_staff_type_statement;