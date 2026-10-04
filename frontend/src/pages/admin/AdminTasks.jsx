import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin_task.css";

const AdminTask = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    due_date: "",
  });

  // ================= FETCH TASKS =================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to fetch tasks");
      }

      setTasks(data?.tasks || data || []);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
      setError(err.message || "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH STAFF =================

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/staff/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStaffList(data || []);
      }
    } catch (error) {
      console.error("Fetch Staff Error:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, []);

  // ================= CREATE TASK =================

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/tasks",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to create task"
        );
      }

      alert("Task created successfully!");

      setShowModal(false);

      setFormData({
        task_name: "",
        description: "",
        assigned_to: "",
        priority: "Medium",
        due_date: "",
      });

      fetchTasks();
    } catch (error) {
      console.error("Create Task Error:", error);

      alert(error.message || "Unable to create task");
    }
  };

  // ================= FILTER =================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        String(task.task_id || "")
          .toLowerCase()
          .includes(search) ||
        String(task.task_name || "")
          .toLowerCase()
          .includes(search) ||
        String(task.description || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  // ================= STATS =================

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const progressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  // ================= DATE =================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-task-page">

      {/* ================= HEADER ================= */}

      <header className="task-page-header">

        <div>
          <span className="task-overline">
            TASK MANAGEMENT
          </span>

          <h1>Tasks</h1>

          <p>
            Create, assign and monitor staff tasks.
          </p>
        </div>

        <div className="task-header-actions">

          <button
            className="task-refresh-btn"
            onClick={fetchTasks}
          >
            ↻ Refresh
          </button>

          <button
            className="create-task-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Task
          </button>

        </div>

      </header>

      {/* ================= STATS ================= */}

      <section className="task-stats-grid">

        <div className="task-stat-card">
          <div className="task-stat-icon total">
            📋
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
            <small>All assigned tasks</small>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon pending">
            ⏳
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingTasks}</strong>
            <small>Waiting to start</small>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon progress">
            🔄
          </div>

          <div>
            <span>In Progress</span>
            <strong>{progressTasks}</strong>
            <small>Currently working</small>
          </div>
        </div>

        <div className="task-stat-card">
          <div className="task-stat-icon completed">
            ✅
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedTasks}</strong>
            <small>Finished tasks</small>
          </div>
        </div>

      </section>

      {/* ================= TABLE CARD ================= */}

      <section className="task-table-card">

        <div className="task-table-top">

          <div>
            <span className="section-label">
              STAFF WORK
            </span>

            <h2>Assigned Tasks</h2>

            <p>
              Manage tasks assigned to apartment staff.
            </p>
          </div>

        </div>

        {/* CONTROLS */}

        <div className="task-controls">

          <div className="task-search">
            🔍

            <input
              type="text"
              placeholder="Search task..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <div className="task-filters">

            {[
              "All",
              "Pending",
              "In Progress",
              "Completed",
            ].map((status) => (
              <button
                key={status}
                className={
                  statusFilter === status
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(status)
                }
              >
                {status}
              </button>
            ))}

          </div>

        </div>

        {/* ================= TABLE ================= */}

        {loading ? (

          <div className="task-empty">
            <div>⏳</div>
            <h3>Loading Tasks...</h3>
            <p>
              Please wait while tasks are loading.
            </p>
          </div>

        ) : error ? (

          <div className="task-empty">
            <div>⚠️</div>
            <h3>Unable to Load Tasks</h3>
            <p>{error}</p>

            <button onClick={fetchTasks}>
              Try Again
            </button>
          </div>

        ) : filteredTasks.length === 0 ? (

          <div className="task-empty">
            <div>📭</div>

            <h3>No Tasks Found</h3>

            <p>
              Create a task and assign it to staff.
            </p>

            <button
              onClick={() => setShowModal(true)}
            >
              + Create First Task
            </button>
          </div>

        ) : (

          <div className="task-table-wrapper">

            <table className="admin-task-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>TASK</th>
                  <th>ASSIGNED TO</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>DUE DATE</th>
                </tr>
              </thead>

              <tbody>

                {filteredTasks.map((task) => (

                  <tr key={task.task_id}>

                    <td>
                      <span className="task-id">
                        #{task.task_id}
                      </span>
                    </td>

                    <td>
                      <div className="task-name-cell">

                        <strong>
                          {task.task_name}
                        </strong>

                        <small>
                          {task.description ||
                            "No description"}
                        </small>

                      </div>
                    </td>

                    <td>

                      <div className="assigned-staff">

                        <div className="staff-avatar">
                          👤
                        </div>

                        <span>
                          {task.assigned_to ||
                            "Not Assigned"}
                        </span>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`priority-badge ${String(
                          task.priority || ""
                        ).toLowerCase()}`}
                      >
                        {task.priority || "Medium"}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`task-status ${String(
                          task.status || ""
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {task.status || "Pending"}
                      </span>

                    </td>

                    <td>
                      <div className="due-date">
                        📅 {formatDate(task.due_date)}
                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* ================= CREATE TASK MODAL ================= */}

      {showModal && (

        <div
          className="task-modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="task-modal-header">

              <div>
                <span>NEW TASK</span>
                <h2>Create Task</h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>

            </div>

            <form onSubmit={handleCreateTask}>

              <div className="form-group">

                <label>
                  Task Name
                </label>

                <input
                  type="text"
                  placeholder="Enter task name"
                  value={formData.task_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      task_name: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows="4"
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Assign Staff
                  </label>

                  <select
                    value={formData.assigned_to}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assigned_to: e.target.value,
                      })
                    }
                    required
                  >

                    <option value="">
                      Select Staff
                    </option>

                    {staffList.map((staff) => (

                      <option
                        key={staff.id}
                        value={staff.id}
                      >
                        {staff.first_name}{" "}
                        {staff.last_name} —{" "}
                        {staff.staff_type}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>

                  </select>

                </div>

              </div>

              <div className="form-group">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      due_date: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="task-modal-actions">

                <button
                  type="button"
                  className="cancel-task-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-task-btn"
                >
                  ✓ Create Task
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminTask;