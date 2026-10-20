// Which staff type can take which kind of work.
//
// A complaint or service request can only be assigned to a staff member of the
// matching staff type, so a Maintenance staff member never receives Security
// work and the other way round. Because staff only see the work assigned to
// them, each staff member ends up seeing only their own department's work.
//
// Rules:
//   - A "Facility Supervisor" can take any work.
//   - Categories that are not listed here (for example "Other") can go to anyone.
//
// Keep this file in sync with frontend/src/constants/workDepartments.js.

const SUPERVISOR = "Facility Supervisor";

// Resident complaint category -> staff types that can handle it
const COMPLAINT_CATEGORY_DEPARTMENTS = Object.freeze({
  Maintenance: ["Maintenance"],
  Plumbing: ["Plumbing"],
  Electrical: ["Electrical"],
  Cleaning: ["Housekeeping"],
  Security: ["Security"]
});

// Resident service request type -> staff types that can handle it
const SERVICE_REQUEST_DEPARTMENTS = Object.freeze({
  Electrician: ["Electrical"],
  Maintenance: ["Maintenance"],
  Plumber: ["Plumbing"],
  Cleaning: ["Housekeeping"],
  Carpenter: ["Maintenance"]
});

const canTakeWork = (rules, category, staffDepartment) => {
  const allowed = rules[category];

  if (!allowed) return true;
  if (staffDepartment === SUPERVISOR) return true;

  return allowed.includes(staffDepartment);
};

// Clear message for the admin when an assignment is refused.
const mismatchMessage = (workName, category, rules, staffDepartment) => {
  if (!staffDepartment) {
    return "This staff member has not chosen a staff type yet. Ask them to set it in their profile first.";
  }

  const allowed = rules[category] || [];

  return `${category} ${workName} can only be assigned to ${allowed.join(" or ")} staff or a ${SUPERVISOR}. This person is in ${staffDepartment}.`;
};

module.exports = {
  SUPERVISOR,
  COMPLAINT_CATEGORY_DEPARTMENTS,
  SERVICE_REQUEST_DEPARTMENTS,
  canTakeWork,
  mismatchMessage
};
