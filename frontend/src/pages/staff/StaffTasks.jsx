
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "../../css/staff/staff_tasks.css";
import "../../css/staff/staff_shared_theme.css";
import { useNavigate } from "react-router-dom";
import StaffNav from "../../components/StaffNav";
import WorkNotesModal from "../../components/WorkNotesModal";
import { useStaffDepartment } from "../../hooks/useStaffDepartment";

function StaffTasks() {
  const navigate = useNavigate();
  const department = useStaffDepartment();

  // Label of the "start" button follows the staff type (PDF guide).
  const startLabel =
    department === "Housekeeping"
      ? "Start Cleaning"
      : department === "Garden Maintenance"
        ? "Start Task"
        : "Start Work";

  const [notesTask, setNotesTask] = useState(null);
  const [verificationEnabled, setVerificationEnabled] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  // ================= STAFF DATA =================

  const [staff] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const firstName = staff?.first_name || staff?.name || "Staff";
  const lastName = staff?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase() || "S";

  // ================= STATES =================

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // ================= FETCH TASKS =================

  

  const fetchTasks = useCallback(async (signal) => {
    try {

      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/staff/tasks",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to fetch tasks"
        );
      }

      const formattedTasks = (data?.tasks || []).map((item) => ({
        id: String(item.task_id),

        title:
          item.task_name || "Untitled Task",

        description:
          item.description ||
          "No description provided.",

        assignedTo:
          item.assigned_to ?? null,

        priority:
          item.priority || "Normal",

        status:
          item.status || "Pending",

        dueDate:
          item.due_date
            ? new Date(
                item.due_date
              ).toLocaleDateString()
            : "-",

        completedDate:
          item.completed_date
            ? new Date(
                item.completed_date
              ).toLocaleDateString()
            : null,

        location: item.location || "",
        workNotes: item.work_notes || "",
        acceptedAt: item.accepted_at || null,
        verifiedAt: item.verified_at || null,
        verificationNote: item.verification_note || "",

        createdDate:
          item.created_at
            ? new Date(
                item.created_at
              ).toLocaleDateString()
            : "-",

        assignedDate:
          item.created_at
            ? new Date(
                item.created_at
              ).toLocaleDateString()
            : "-",
      }));

      setTasks(formattedTasks);
      setVerificationEnabled(Boolean(data?.verification_enabled));
    } catch (err) {
      // AbortController error ignore karo
      if (err.name === "AbortError") {
        return;
      }

      console.error(
        "Fetch Staff Tasks Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load tasks."
      );

      setTasks([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // ================= LOAD TASKS =================

  useEffect(() => {
    const controller = new AbortController();

    const loadTasks = async () => {
      await fetchTasks(controller.signal);
    };
    loadTasks();

    return () => {
      controller.abort();
    };
  }, [fetchTasks]);

  // ================= FILTER + SEARCH =================

  const filteredTasks = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        String(task.id || "")
          .toLowerCase()
          .includes(search) ||

        String(task.title || "")
          .toLowerCase()
          .includes(search) ||

        String(task.description || "")
          .toLowerCase()
          .includes(search) ||

        String(task.priority || "")
          .toLowerCase()
          .includes(search) ||

        String(task.status || "")
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        activeFilter === "All" ||
        task.status === activeFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    tasks,
    searchTerm,
    activeFilter,
  ]);

  // ================= STATISTICS =================

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) =>
      task.status === "Pending"
  ).length;

  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status === "In Progress"
    ).length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status === "Completed"
    ).length;

  // ================= LOGOUT =================

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("staffToken");
    sessionStorage.removeItem("residentToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("staff");

    navigate("/login");
  };

  // ================= NAVIGATION =================

  const handleNavigation = (path) => {
    navigate(path);
  };

  // ================= UPDATE TASK STATUS =================

  const updateTaskStatus = async (
    taskId,
    newStatus,
    workNotes
  ) => {
    setUpdatingTaskId(String(taskId));
    try {
      const token =
        sessionStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return false;
      }

      const response = await fetch(
        `http://localhost:5000/api/staff/tasks/${taskId}/status`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
            ...(workNotes ? { work_notes: workNotes } : {}),
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "UPDATE TASK STATUS RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update task status"
        );
      }

      // Update UI immediately
      setTasks(
        (previousTasks) =>
          previousTasks.map((task) =>
            task.id ===
            String(taskId)
              ? {
                  ...task,

                  status:
                    newStatus,

                  completedDate:
                    newStatus ===
                    "Completed"
                      ? new Date().toLocaleDateString()
                      : null,
                }
              : task
          )
      );
      fetchTasks();
      return true;
    } catch (error) {
      console.error(
        "Update Task Status Error:",
        error
      );

      alert(
        error?.message ||
          "Unable to update task status"
      );

      // Database mathi fresh data
      // fari load karo
      fetchTasks();
      return false;
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // ================= ACCEPT TASK =================

  const acceptTask = async (taskId) => {
    setAcceptingId(String(taskId));

    try {
      const response = await fetch(
        `http://localhost:5000/api/staff/tasks/${taskId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to accept task");
      }

      await fetchTasks();
    } catch (err) {
      alert(err?.message || "Unable to accept task");
    } finally {
      setAcceptingId(null);
    }
  };

  // ================= VIEW TASK =================

  const handleViewTask = (task) => {
    alert(
      `Task Details\n\n` +
        `Task ID: ${task.id}\n` +
        `Task Name: ${task.title}\n` +
        `Description: ${task.description}\n` +
        `Priority: ${task.priority}\n` +
        `Status: ${task.status}\n` +
        `Due Date: ${task.dueDate}\n` +
        `Location: ${task.location || "-"}\n` +
        `Accepted: ${task.acceptedAt ? new Date(task.acceptedAt).toLocaleString() : "Not yet"}\n` +
        `Work Notes: ${task.workNotes || "-"}\n` +
        (task.status === "Completed"
          ? `Verification: ${task.verifiedAt ? "Approved by supervisor" : "Waiting for supervisor"}\n`
          : "") +
        (task.verificationNote
          ? `Supervisor Note: ${task.verificationNote}\n`
          : "") +
        `Created Date: ${task.createdDate}`
    );
  };

  // ================= RESET =================

  const handleReset = () => {
    setSearchTerm("");
    setActiveFilter("All");
  };

  // ================= UI =================

  return (
    <div className="modern-staff-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="modern-sidebar">

        <div className="brand-header">

          <div className="brand-icon">
            🏢
          </div>

          <div className="brand-info">
            <h3>
              Smart Apartment
            </h3>

            <span>
              Staff Portal
            </span>
          </div>

        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>
                <StaffNav onNavigate={handleNavigation} />

        {/* ================= SIDEBAR USER ================= */}

        <div className="sidebar-footer">

          <div className="user-profile-summary">

            <div className="avatar-circle">
              {initials}
            </div>

            <div className="user-details">

              <strong>
                {fullName}
              </strong>

              <small>{department || "Staff Member"}</small>

            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="modern-main-content">

        {/* ================= HEADER ================= */}

        <header className="top-header">

          <div className="header-title">

            <span className="badge-tag">
              TASK MANAGEMENT
            </span>

            <h1>
              My Tasks
            </h1>

            <p>
              View, manage and complete
              your assigned daily tasks.
            </p>

          </div>

          <div className="header-actions">


          </div>

        </header>

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          <div className="stat-card stat-active">

            <div className="stat-icon task-icon">
              ✅
            </div>

            <div className="stat-info">

              <h3>
                Total Tasks
              </h3>

              <span className="stat-value">
                {totalTasks}
              </span>

              <small>
                All database tasks
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon pending-icon">
              ⏳
            </div>

            <div className="stat-info">

              <h3>
                Pending
              </h3>

              <span className="stat-value">
                {pendingTasks}
              </span>

              <small>
                Need attention
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon progress-icon">
              🔄
            </div>

            <div className="stat-info">

              <h3>
                In Progress
              </h3>

              <span className="stat-value">
                {inProgressTasks}
              </span>

              <small>
                Currently working
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon completed-icon">
              🏆
            </div>

            <div className="stat-info">

              <h3>
                Completed
              </h3>

              <span className="stat-value">
                {completedTasks}
              </span>

              <small>
                Successfully completed
              </small>

            </div>

          </div>

        </section>

        {/* ================= CONTROLS ================= */}

        <section className="controls-bar">

          <div className="search-input-wrapper">

            <span className="search-icon-svg">
              🔍
            </span>

            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ✕
              </button>
            )}

          </div>

          <div className="filter-tabs">

            {[
              "All",
              "Pending",
              "In Progress",
              "Completed",
            ].map((filter) => (

              <button
                key={filter}
                className={`filter-tab-btn ${
                  activeFilter === filter
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(
                    filter
                  )
                }
              >
                {filter}
              </button>

            ))}

          </div>

        </section>

        {/* ================= TASK TABLE ================= */}

        <section className="table-container">

          <div className="table-header">

            <div>

              <h2>
                Assigned Tasks
              </h2>

              <p>
                {filteredTasks.length} task
                {filteredTasks.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            <button
              className="refresh-btn"
              onClick={() =>
                fetchTasks()
              }
            >
              ↻ Refresh
            </button>

          </div>

          {/* ================= LOADING ================= */}

          {loading ? (

            <div className="empty-state">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>
                Loading Tasks...
              </h3>

              <p>
                Please wait while tasks
                are being loaded from
                database.
              </p>

            </div>

          ) : error ? (

            <div className="empty-state">

              <div className="empty-icon">
                ⚠️
              </div>

              <h3>
                Unable to Load Tasks
              </h3>

              <p>
                {error}
              </p>

              <button
                className="empty-reset-btn"
                onClick={() =>
                  fetchTasks()
                }
              >
                Try Again
              </button>

            </div>

          ) : filteredTasks.length > 0 ? (

            <div className="table-scroll">

              <table className="custom-table">

                <thead>

                  <tr>

                    <th>
                      TASK ID
                    </th>

                    <th>
                      TASK DETAILS
                    </th>

                    <th>
                      PRIORITY
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      DUE DATE
                    </th>

                    <th>
                      ASSIGNED TO
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTasks.map(
                    (task) => (

                      <tr
                        key={task.id}
                      >

                        <td>

                          <span className="id-badge">
                            {task.id}
                          </span>

                        </td>

                        <td>

                          <div className="task-cell">

                            <strong>
                              {task.title}
                            </strong>

                            <p>
                              {task.description}
                            </p>

                            {task.location && (
                              <small>📍 {task.location}</small>
                            )}

                            {task.workNotes && (
                              <div className="sx-notes-box">
                                <strong>Your notes:</strong> {task.workNotes}
                              </div>
                            )}

                            {task.verificationNote && task.status !== "Completed" && (
                              <div className="sx-notes-box is-warning">
                                <strong>Reopened by supervisor:</strong> {task.verificationNote}
                              </div>
                            )}

                          </div>

                        </td>

                        <td>

                          <span
                            className={`priority-pill ${String(
                              task.priority
                            ).toLowerCase()}`}
                          >
                            {task.priority}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-select ${String(
                              task.status
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {task.status}
                          </span>

                        </td>

                        <td>

                          <div className="date-cell">

                            <strong>
                              {task.dueDate}
                            </strong>

                            <small>
                              Assigned:{" "}
                              {
                                task.assignedDate
                              }
                            </small>

                          </div>

                        </td>

                        <td>

                          <span>
                            {task.assignedTo ||
                              "Not Assigned"}
                          </span>

                        </td>

                        <td>

                          <div className="task-row-actions">
                            <button
                              className="action-btn"
                              type="button"
                              onClick={() =>
                                handleViewTask(
                                  task
                                )
                              }
                            >
                              View
                            </button>
                            {task.status === "Pending" && !task.acceptedAt && (
                              <button
                                className="action-btn"
                                type="button"
                                disabled={acceptingId === task.id}
                                onClick={() => acceptTask(task.id)}
                              >
                                {acceptingId === task.id ? "Accepting..." : "Accept Task"}
                              </button>
                            )}
                            {task.status === "Pending" && (
                              <button
                                className="task-status-action-btn task-status-action-btn--start"
                                type="button"
                                disabled={updatingTaskId === task.id}
                                onClick={() => updateTaskStatus(task.id, "In Progress")}
                              >
                                {updatingTaskId === task.id ? "Updating..." : startLabel}
                              </button>
                            )}
                            {task.status === "In Progress" && (
                              <button
                                className="task-status-action-btn task-status-action-btn--complete"
                                type="button"
                                disabled={updatingTaskId === task.id}
                                onClick={() => setNotesTask(task)}
                              >
                                {updatingTaskId === task.id ? "Updating..." : "Mark Completed"}
                              </button>
                            )}
                            {task.status === "Completed" && (
                              <span className="task-completed-label">
                                {task.verifiedAt
                                  ? "✓ Completed and verified"
                                  : verificationEnabled
                                    ? "✓ Completed - waiting for verification"
                                    : "✓ Completed"}
                              </span>
                            )}
                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="empty-state">

              <div className="empty-icon">
                📭
              </div>

              <h3>
                No Tasks Found
              </h3>

              <p>
                There are currently no
                tasks assigned to this
                staff member.
              </p>

              <button
                className="empty-reset-btn"
                onClick={
                  handleReset
                }
              >
                Reset Filters
              </button>

            </div>

          )}

        </section>

      </main>

      {notesTask && (
        <WorkNotesModal
          title="Mark task as completed"
          description={notesTask.title}
          confirmLabel="Mark Completed"
          initialNotes={notesTask.workNotes}
          busy={updatingTaskId === notesTask.id}
          onCancel={() => setNotesTask(null)}
          onConfirm={async (notes) => {
            const done = await updateTaskStatus(notesTask.id, "Completed", notes);

            if (done) setNotesTask(null);
          }}
        />
      )}

    </div>
  );
}

export default StaffTasks;
