// Staff types shown in the Staff register / admin staff dropdowns.
// Keep this list in sync with:
//   - frontend/src/constants/staffDepartments.js
//   - the staff.department ENUM (backend/database/update_staff_departments.sql)
const STAFF_DEPARTMENTS = Object.freeze([
  "Maintenance",        // general repair, carpenter, painter
  "Electrical",         // electrician, lift, generator, AC
  "Plumbing",           // plumber, water pump / tank
  "Housekeeping",       // cleaning, garbage, pest control
  "Garden Maintenance",
  "Security",           // guard, gatekeeper, CCTV, parking
  "Facility Supervisor" // looks after all the other staff
]);

module.exports = { STAFF_DEPARTMENTS };
