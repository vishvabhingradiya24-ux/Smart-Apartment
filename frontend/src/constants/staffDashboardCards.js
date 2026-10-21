// Stat cards shown at the top of the staff dashboard, per staff type
// (see the Staff Roles guide: each type sees the numbers that matter to it).

const card = (title, value, description, icon, className, path) => ({
  title,
  value,
  description,
  icon,
  className,
  path
});

// `display` turns a raw number into what the card shows (a number, "…" while
// loading or "—" when the data could not be loaded).
export function buildDashboardCards({ department, counts, security, supervisor, display }) {
  const c = counts || {};

  const complaintCard = card(
    "Assigned Complaints",
    display(c.complaints_total),
    `${display(c.complaints_open)} open cases`,
    "🛠️",
    "blue",
    "/staff/complaints"
  );

  const requestCard = card(
    "Service Requests",
    display(c.service_requests_total),
    `${display(c.service_requests_open)} open requests`,
    "📋",
    "orange",
    "/staff/service-requests"
  );

  const taskCards = (assignedTitle) => [
    card(assignedTitle, display(c.tasks_total), `${display(c.tasks_overdue)} overdue`, "📌", "blue", "/staff/tasks"),
    card("Pending Tasks", display(c.tasks_pending), "Waiting to start", "⏳", "orange", "/staff/tasks"),
    card("In Progress", display(c.tasks_in_progress), "Being worked on", "🔧", "green", "/staff/tasks"),
    card("Completed Tasks", display(c.tasks_completed), "Finished work", "✅", "purple", "/staff/work-history")
  ];

  switch (department) {
    case "Maintenance":
    case "Electrical":
    case "Plumbing":
      return [complaintCard, requestCard, ...taskCards("Assigned Tasks")];

    case "Housekeeping":
      return [...taskCards("Assigned Cleaning Tasks"), complaintCard, requestCard];

    case "Garden Maintenance":
      return taskCards("Assigned Tasks");

    case "Security": {
      const s = security || {};

      return [
        card("Today's Visitors", display(s.visitors_today), "Registered for today", "🚪", "blue", "/staff/visitors"),
        card("Expected Visitors", display(s.expected_today), "Not arrived yet", "🕘", "orange", "/staff/visitors"),
        card("Currently Inside", display(s.inside_now), "Entered, not exited", "🏢", "green", "/staff/visitors"),
        card("Pending Security Tasks", display(c.tasks_pending), `${display(c.tasks_in_progress)} in progress`, "🛡️", "purple", "/staff/tasks"),
        complaintCard
      ];
    }

    case "Facility Supervisor": {
      const s = supervisor || {};

      return [
        card("Total Staff", display(s.total_staff), "Registered staff members", "👥", "blue", "/staff/supervisor/staff"),
        card("Assigned Tasks", display(s.tasks_total), "Across all staff", "📌", "green", "/staff/supervisor/tasks"),
        card("Pending", display(s.tasks_pending), "Waiting to start", "⏳", "orange", "/staff/supervisor/tasks"),
        card("In Progress", display(s.tasks_in_progress), "Being worked on", "🔧", "blue", "/staff/supervisor/tasks"),
        card("Completed", display(s.tasks_completed), "Finished by staff", "✅", "purple", "/staff/supervisor/tasks"),
        card("Overdue", display(s.tasks_overdue), "Past the deadline", "⚠️", "orange", "/staff/supervisor/tasks"),
        card("Awaiting Verification", display(s.awaiting_verification), "Completed, not checked", "🔍", "green", "/staff/supervisor/verification")
      ];
    }

    default:
      return [
        complaintCard,
        requestCard,
        card("Pending Tasks", display(c.tasks_pending), `${display(c.tasks_in_progress)} in progress`, "✅", "green", "/staff/tasks"),
        card("Completed Tasks", display(c.tasks_completed), "Assigned tasks completed", "📦", "purple", "/staff/work-history")
      ];
  }
}
