// Side menu of the staff portal, shown according to the staff member's type.
// It follows the "Staff Roles, Responsibilities and Role-Based Dashboard
// Guide": every type sees the pages it needs and nothing else.
//
//   Maintenance, Electrical, Plumbing   complaints, tasks
//   Housekeeping                        cleaning complaints and tasks
//   Garden Maintenance                  tasks only
//   Security                            visitors, security complaints, tasks
//   Facility Supervisor                 staff overview, task management, complaint
//                                       monitoring, work verification, reports

const ITEMS = {
  dashboard: { path: "/staff/dashboard", icon: "📊", label: "Dashboard" },
  visitors: { path: "/staff/visitors", icon: "🚪", label: "Visitors" },
  complaints: { path: "/staff/complaints", icon: "🛠️", label: "Assigned Complaints" },
  tasks: { path: "/staff/tasks", icon: "✅", label: "Tasks" },
  assets: { path: "/staff/assets", icon: "📦", label: "Assets & Inventory" },
  history: { path: "/staff/work-history", icon: "📜", label: "Work History" },
  notifications: { path: "/staff/notifications", icon: "🔔", label: "Notifications" },
  profile: { path: "/staff/profile", icon: "👤", label: "My Profile" },

  svStaff: { path: "/staff/supervisor/staff", icon: "👥", label: "Staff Overview" },
  svTasks: { path: "/staff/supervisor/tasks", icon: "🗂️", label: "Task Management" },
  svComplaints: { path: "/staff/supervisor/complaints", icon: "📡", label: "Complaint Monitoring" },
  svVerification: { path: "/staff/supervisor/verification", icon: "🔍", label: "Work Verification" },
  svReports: { path: "/staff/supervisor/reports", icon: "📈", label: "Reports" }
};

const TECHNICAL_STAFF = [
  "dashboard",
  "complaints",
  "tasks",
  "assets",
  "history",
  "notifications",
  "profile"
];

const MENU_BY_DEPARTMENT = {
  Maintenance: TECHNICAL_STAFF,
  Electrical: TECHNICAL_STAFF,
  Plumbing: TECHNICAL_STAFF,
  Housekeeping: [
    "dashboard",
    "complaints",
    "tasks",
    "assets",
    "history",
    "notifications",
    "profile"
  ],
  "Garden Maintenance": ["dashboard", "tasks", "assets", "history", "notifications", "profile"],
  Security: [
    "dashboard",
    "visitors",
    "complaints",
    "tasks",
    "history",
    "notifications",
    "profile"
  ],
  "Facility Supervisor": [
    "dashboard",
    "svStaff",
    "svTasks",
    "svComplaints",
    "svVerification",
    "svReports",
    "complaints",
    "tasks",
    "assets",
    "history",
    "notifications",
    "profile"
  ]
};

const GENERAL_MENU = [
  "dashboard",
  "complaints",
  "tasks",
  "assets",
  "history",
  "notifications",
  "profile"
];

const SECURITY_SIDEBAR_MENU = ["dashboard", "visitors", "notifications", "profile"];
const STAFF_SIDEBAR_MENU = [
  "dashboard",
  "complaints",
  "tasks",
  "assets",
  "history",
  "notifications",
  "profile"
];

export const staffSidebarMenuFor = (department) => {
  const normalizedDepartment = String(department || "").trim().toLowerCase();
  const keys =
    normalizedDepartment === "security"
      ? SECURITY_SIDEBAR_MENU
      : STAFF_SIDEBAR_MENU;

  return keys.map((key) => {
    const item = { key, ...ITEMS[key] };

    if (key === "complaints") {
      return { ...item, label: "Assigned Complaints" };
    }
    if (key === "tasks") {
      return { ...item, label: "Tasks" };
    }

    return item;
  });
};

export const staffMenuFor = (department) => {
  const normalizedDepartment = String(department || "").trim().toLowerCase();
  const matchedDepartment = Object.keys(MENU_BY_DEPARTMENT).find(
    (name) => name.toLowerCase() === normalizedDepartment
  );
  const keys = normalizedDepartment
    ? MENU_BY_DEPARTMENT[matchedDepartment] || GENERAL_MENU
    : GENERAL_MENU;

  return keys.map((key) => {
    const item = { key, ...ITEMS[key] };

    return item;
  });
};
