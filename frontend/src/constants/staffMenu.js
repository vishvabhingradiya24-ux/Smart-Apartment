// Side menu of the staff portal, shown according to the staff member's type.
// Each type only gets the pages that can actually hold work for them:
//   - Security only receives Security complaints (no service request type
//     is Security), so Service Requests and Inventory are hidden.
//   - Garden Maintenance receives no complaints or requests, only tasks.
//   - "Maintenance" is the same task list as "Tasks", so it only stays for
//     the Facility Supervisor, who gets every page.

const ITEMS = {
  dashboard: { path: "/staff/dashboard", icon: "📊", label: "Dashboard" },
  complaints: { path: "/staff/complaints", icon: "🛠️", label: "Assigned Complaints" },
  requests: { path: "/staff/service-requests", icon: "📋", label: "Service Requests" },
  tasks: { path: "/staff/tasks", icon: "✅", label: "Tasks" },
  maintenance: { path: "/staff/maintenance", icon: "⚙️", label: "Maintenance" },
  assets: { path: "/staff/assets", icon: "📦", label: "Assets & Inventory" },
  history: { path: "/staff/work-history", icon: "📜", label: "Work History" },
  profile: { path: "/staff/profile", icon: "👤", label: "My Profile" }
};

const EVERYTHING = [
  "dashboard",
  "complaints",
  "requests",
  "tasks",
  "maintenance",
  "assets",
  "history",
  "profile"
];

const FIELD_STAFF = [
  "dashboard",
  "complaints",
  "requests",
  "tasks",
  "assets",
  "history",
  "profile"
];

const MENU_BY_DEPARTMENT = {
  Maintenance: FIELD_STAFF,
  Electrical: FIELD_STAFF,
  Plumbing: FIELD_STAFF,
  Housekeeping: FIELD_STAFF,
  Security: ["dashboard", "complaints", "tasks", "history", "profile"],
  "Garden Maintenance": ["dashboard", "tasks", "assets", "history", "profile"],
  "Facility Supervisor": EVERYTHING
};

// A staff member who has not chosen a type yet (older accounts) gets a
// short menu; an unknown type falls back to every page.
const NO_TYPE_MENU = ["dashboard", "tasks", "history", "profile"];

export const staffMenuFor = (department) => {
  const keys = department
    ? MENU_BY_DEPARTMENT[department] || EVERYTHING
    : NO_TYPE_MENU;

  return keys.map((key) => ({ key, ...ITEMS[key] }));
};
