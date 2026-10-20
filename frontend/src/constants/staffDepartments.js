// Staff types shown in the Staff register / profile / admin staff dropdowns.
// Keep this list in sync with backend/constants/staffDepartments.js and the
// staff.department ENUM (backend/database/update_staff_departments.sql).
export const STAFF_DEPARTMENTS = [
  "Maintenance",        // general repair, carpenter, painter
  "Electrical",         // electrician, lift, generator, AC
  "Plumbing",           // plumber, water pump / tank
  "Housekeeping",       // cleaning, garbage, pest control
  "Garden Maintenance",
  "Security",           // guard, gatekeeper, CCTV, parking
  "Facility Supervisor" // looks after all the other staff
];
