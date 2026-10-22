// Which staff type can take which kind of work.
//
// A complaint can only be assigned to a staff member of
// the matching staff type, so a Maintenance staff member never receives
// Security work and the other way round. Staff only see the work assigned to
// them, so each staff member sees only their own department's work.
//
// Rules:
//   - A "Facility Supervisor" can take any work.
//   - Categories that are not listed (for example "Other") can go to anyone.
//
// Keep this file in sync with backend/constants/workDepartments.js.

export const SUPERVISOR = "Facility Supervisor";

// Resident complaint category -> staff types that can handle it
export const COMPLAINT_CATEGORY_DEPARTMENTS = {
  Maintenance: ["Maintenance"],
  Plumbing: ["Plumbing"],
  Electrical: ["Electrical"],
  Cleaning: ["Housekeeping"],
  Security: ["Security"]
};

export const canTakeWork = (rules, category, staffDepartment) => {
  const allowed = rules[category];

  if (!allowed) return true;
  if (staffDepartment === SUPERVISOR) return true;

  return allowed.includes(staffDepartment);
};

// "Plumbing" / "Plumbing or Electrical" - used in helper texts.
export const departmentsFor = (rules, category) =>
  rules[category] ? rules[category].join(" or ") : "";

const matching = (rules, department) =>
  Object.entries(rules)
    .filter(([, departments]) => departments.includes(department))
    .map(([category]) => category);

// "A", "A and B", "A, B and C"
const joinList = (items) =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
    : items[0];

// One sentence telling a staff member what kind of work they receive.
export const workSummary = (department) => {
  if (department === SUPERVISOR) {
    return "all complaints and tasks, and you check that staff work is done properly";
  }

  if (department === "Security") {
    return "visitor entry and exit, Security complaints, plus tasks and other work given by the admin";
  }

  const complaints = matching(COMPLAINT_CATEGORY_DEPARTMENTS, department);
  const parts = [];

  if (complaints.length) parts.push(`${joinList(complaints)} complaints`);

  const own = parts.length ? `${parts.join(", ")}, plus ` : "";

  return `${own}tasks and other work given by the admin`;
};
