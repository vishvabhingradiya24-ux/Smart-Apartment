// Side menu of the staff portal, shown according to the staff member's type.
// It follows the "Staff Roles, Responsibilities and Role-Based Dashboard
// Guide": every type sees the pages it needs and nothing else.
//
//   Maintenance, Electrical, Plumbing   complaints, requests, tasks, report an issue
//   Housekeeping                        cleaning complaints / requests and tasks
//   Garden Maintenance                  tasks only
//   Security                            visitors, incident reports, security complaints, tasks
//   Facility Supervisor                 staff overview, task management, complaint
//                                       monitoring, work verification, reports, incidents

const ITEMS = {
  dashboard: { path: "/staff/dashboard", icon: "📊", label: "Dashboard" },
  visitors: { path: "/staff/visitors", icon: "🚪", label: "Visitors" },
  report: { path: "/staff/report-issue", icon: "📝", label: "Report an Issue" },
  complaints: { path: "/staff/complaints", icon: "🛠️", label: "Assigned Complaints" },
  requests: { path: "/staff/service-requests", icon: "📋", label: "Service Requests" },
  tasks: { path: "/staff/tasks", icon: "✅", label: "Tasks" },
  assets: { path: "/staff/assets", icon: "📦", label: "Assets & Inventory" },
  history: { path: "/staff/work-history", icon: "📜", label: "Work History" },
  notifications: { path: "/staff/notifications", icon: "🔔", label: "Notifications" },
  profile: { path: "/staff/profile", icon: "👤", label: "My Profile" },

  svStaff: { path: "/staff/supervisor/staff", icon: "👥", label: "Staff Overview" },
  svTasks: { path: "/staff/supervisor/tasks", icon: "🗂️", label: "Task Management" },
  svComplaints: { path: "/staff/supervisor/complaints", icon: "📡", label: "Complaint Monitoring" },
  svVerification: { path: "/staff/supervisor/verification", icon: "🔍", label: "Work Verification" },
  svReports: { path: "/staff/supervisor/reports", icon: "📈", label: "Reports" },
  svIncidents: { path: "/staff/supervisor/incidents", icon: "🚨", label: "Incident Reports" }
};

const TECHNICAL_STAFF = [
  "dashboard",
  "complaints",
  "requests",
  "tasks",
  "report",
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
    "requests",
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
    "report",
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
    "svIncidents",
    "complaints",
    "requests",
    "tasks",
    "assets",
    "history",
    "notifications",
    "profile"
  ]
};

// A staff member who has not chosen a type yet (older accounts) gets a
// short menu; an unknown type falls back to the general pages.
const NO_TYPE_MENU = ["dashboard", "tasks", "history", "notifications", "profile"];

const GENERAL_MENU = [
  "dashboard",
  "complaints",
  "requests",
  "tasks",
  "assets",
  "history",
  "notifications",
  "profile"
];

export const staffMenuFor = (department) => {
  const keys = department
    ? MENU_BY_DEPARTMENT[department] || GENERAL_MENU
    : NO_TYPE_MENU;

  return keys.map((key) => {
    const item = { key, ...ITEMS[key] };

    // Security files incident reports; everyone else reports issues.
    if (key === "report" && department === "Security") {
      return { ...item, icon: "🚨", label: "Incident Report" };
    }

    return item;
  });
};
