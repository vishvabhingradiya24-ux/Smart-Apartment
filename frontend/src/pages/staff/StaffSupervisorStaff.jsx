import { useMemo, useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { STAFF_DEPARTMENTS } from "../../constants/staffDepartments";
import { useStaffApi } from "../../utils/staffApi";

function StaffSupervisorStaff() {
  const { data, error, loading, reload } = useStaffApi("/supervisor/staff");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const staff = useMemo(() => data?.staff || [], [data]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((person) => {
      const matchesType = type === "All" || person.department === type;
      const matchesSearch =
        !query ||
        `${person.first_name} ${person.last_name} ${person.email} ${person.phone}`
          .toLowerCase()
          .includes(query);

      return matchesType && matchesSearch;
    });
  }, [staff, search, type]);

  const available = staff.filter((person) => person.work_status === "Available").length;

  return (
    <StaffLayout
      badge="FACILITY SUPERVISOR"
      title="Staff Overview"
      subtitle="Every staff member, their work status and how much work they have."
      actions={
        <button type="button" className="sx-btn sx-btn-ghost" onClick={reload}>
          ↻ Refresh
        </button>
      }
    >
      <section className="stats-grid">
        <div className="stat-card stat-active">
          <div className="stat-icon inventory-icon">👥</div>

          <div className="stat-info">
            <h3>Total Staff</h3>
            <span className="stat-value">{staff.length}</span>
            <small>Registered staff members</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available-icon">✓</div>

          <div className="stat-info">
            <h3>Available</h3>
            <span className="stat-value">{available}</span>
            <small>Free to take new work</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon maintenance-icon">🔧</div>

          <div className="stat-info">
            <h3>Busy</h3>
            <span className="stat-value">{staff.length - available}</span>
            <small>Working on tasks right now</small>
          </div>
        </div>
      </section>

      <section className="controls-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-svg">🔍</span>

          <input
            type="text"
            className="search-input"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {["All", ...STAFF_DEPARTMENTS].map((item) => (
            <button
              key={item}
              type="button"
              className={`filter-tab-btn ${type === item ? "active" : ""}`}
              onClick={() => setType(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="sx-card">
        {error && <p className="sx-alert sx-alert-error">{error}</p>}

        {loading ? (
          <div className="sx-empty">Loading staff...</div>
        ) : visible.length === 0 ? (
          <div className="sx-empty">
            <strong>No staff found</strong>
            Try a different search or staff type.
          </div>
        ) : (
          <div className="sx-table-wrap">
            <table className="sx-table">
              <thead>
                <tr>
                  <th>Staff member</th>
                  <th>Staff type</th>
                  <th>Work status</th>
                  <th>Pending</th>
                  <th>In progress</th>
                  <th>Completed</th>
                  <th>Overdue</th>
                  <th>Open complaints / requests</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <strong>
                        {person.first_name} {person.last_name}
                      </strong>
                      <small>
                        {person.phone} · {person.email}
                      </small>
                    </td>

                    <td>{person.department || "Not set"}</td>

                    <td>
                      <span
                        className={`sx-pill ${person.work_status === "Busy" ? "sx-pill-amber" : "sx-pill-green"}`}
                      >
                        {person.work_status}
                      </span>
                    </td>

                    <td>{person.tasks_pending}</td>
                    <td>{person.tasks_in_progress}</td>
                    <td>{person.tasks_completed}</td>

                    <td>
                      {person.tasks_overdue > 0 ? (
                        <span className="sx-pill sx-pill-red">{person.tasks_overdue}</span>
                      ) : (
                        0
                      )}
                    </td>

                    <td>
                      {person.complaints_open} / {person.requests_open}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </StaffLayout>
  );
}

export default StaffSupervisorStaff;
