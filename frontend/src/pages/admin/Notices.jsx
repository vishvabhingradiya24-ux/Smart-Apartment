import { useState } from "react";
import "../../css/notices.css";

const Notices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [notices] = useState([
    {
      id: "NT001",
      title: "Monthly Maintenance Schedule",
      description:
        "Monthly maintenance work will be carried out in all blocks as per the scheduled maintenance plan.",
      category: "Maintenance",
      audience: "All Residents",
      publishDate: "18 Sep 2026",
      status: "Published",
      createdBy: "Admin",
    },
    {
      id: "NT002",
      title: "Water Supply Interruption",
      description:
        "Water supply will remain unavailable for a limited period due to scheduled pipeline maintenance.",
      category: "Important",
      audience: "All Residents",
      publishDate: "20 Sep 2026",
      status: "Published",
      createdBy: "Admin",
    },
    {
      id: "NT003",
      title: "Society Committee Meeting",
      description:
        "The monthly society committee meeting will be conducted in the community hall.",
      category: "Meeting",
      audience: "Committee Members",
      publishDate: "22 Sep 2026",
      status: "Published",
      createdBy: "Committee",
    },
    {
      id: "NT004",
      title: "Security Gate Instructions",
      description:
        "Residents are requested to cooperate with security personnel and follow visitor verification procedures.",
      category: "Security",
      audience: "All Residents",
      publishDate: "24 Sep 2026",
      status: "Draft",
      createdBy: "Admin",
    },
    {
      id: "NT005",
      title: "Lift Maintenance Notice",
      description:
        "Block B lift will remain under maintenance during the scheduled service period.",
      category: "Maintenance",
      audience: "Block B Residents",
      publishDate: "25 Sep 2026",
      status: "Published",
      createdBy: "Admin",
    },
  ]);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || notice.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All" || notice.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalNotices = notices.length;

  const publishedNotices = notices.filter(
    (notice) => notice.status === "Published"
  ).length;

  const draftNotices = notices.filter(
    (notice) => notice.status === "Draft"
  ).length;

  const importantNotices = notices.filter(
    (notice) => notice.category === "Important"
  ).length;

  const handleAction = (action, notice) => {
    alert(`${action} selected for "${notice.title}"`);
  };

  return (
    <div className="notices-page">
      {/* Header */}
      <div className="notices-header">
        <div>
          <span className="notices-overline">COMMUNICATION MANAGEMENT</span>

          <h1>Notices</h1>

          <p>
            Create, publish and manage important society notices and
            announcements.
          </p>
        </div>

        <button
          className="add-notice-btn"
          onClick={() => alert("Create Notice form will open here.")}
        >
          <span>＋</span>
          Create Notice
        </button>
      </div>

      {/* Statistics */}
      <div className="notice-stats-grid">
        <div className="notice-stat-card">
          <div className="notice-stat-icon">📢</div>

          <div>
            <span>Total Notices</span>
            <strong>{totalNotices}</strong>
          </div>
        </div>

        <div className="notice-stat-card">
          <div className="notice-stat-icon">✅</div>

          <div>
            <span>Published</span>
            <strong>{publishedNotices}</strong>
          </div>
        </div>

        <div className="notice-stat-card">
          <div className="notice-stat-icon">📝</div>

          <div>
            <span>Drafts</span>
            <strong>{draftNotices}</strong>
          </div>
        </div>

        <div className="notice-stat-card">
          <div className="notice-stat-icon">⚠️</div>

          <div>
            <span>Important</span>
            <strong>{importantNotices}</strong>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="notice-toolbar">
        <div className="notice-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search notice, ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="notice-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Important">Important</option>
          <option value="Meeting">Meeting</option>
          <option value="Security">Security</option>
        </select>

        <select
          className="notice-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Notice Table */}
      <div className="notices-card">
        <div className="notices-card-header">
          <div>
            <h2>Society Notices</h2>

            <p>
              Manage important announcements and information for residents.
            </p>
          </div>

          <span className="notice-record-count">
            {filteredNotices.length} Records
          </span>
        </div>

        <div className="notices-table-wrapper">
          <table className="notices-table">
            <thead>
              <tr>
                <th>Notice ID</th>
                <th>Notice</th>
                <th>Category</th>
                <th>Audience</th>
                <th>Publish Date</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredNotices.length > 0 ? (
                filteredNotices.map((notice) => (
                  <tr key={notice.id}>
                    <td>
                      <span className="notice-id">{notice.id}</span>
                    </td>

                    <td>
                      <div className="notice-title-cell">
                        <div className="notice-avatar">📢</div>

                        <div>
                          <strong>{notice.title}</strong>

                          <p>{notice.description}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`notice-category ${notice.category.toLowerCase()}`}
                      >
                        {notice.category}
                      </span>
                    </td>

                    <td>
                      <span className="notice-audience">
                        👥 {notice.audience}
                      </span>
                    </td>

                    <td>
                      <span className="notice-date">
                        📅 {notice.publishDate}
                      </span>
                    </td>

                    <td>
                      <span className="created-by">
                        {notice.createdBy}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`notice-status ${notice.status.toLowerCase()}`}
                      >
                        {notice.status}
                      </span>
                    </td>

                    <td>
                      <div className="notice-actions">
                        <button
                          className="notice-action-btn view"
                          onClick={() => handleAction("View", notice)}
                          title="View"
                        >
                          👁️
                        </button>

                        <button
                          className="notice-action-btn edit"
                          onClick={() => handleAction("Edit", notice)}
                          title="Edit"
                        >
                          ✏️
                        </button>

                        {notice.status === "Draft" && (
                          <button
                            className="notice-action-btn publish"
                            onClick={() => handleAction("Publish", notice)}
                            title="Publish"
                          >
                            📢
                          </button>
                        )}

                        <button
                          className="notice-action-btn delete"
                          onClick={() => handleAction("Delete", notice)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-notices">
                    No notices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publishing Information */}
      <div className="notice-bottom-grid">
        <div className="notice-info-card">
          <div className="notice-info-icon">📢</div>

          <div>
            <h3>Publish Notice</h3>

            <p>
              Published notices can be made available to residents through
              their dashboards for important society communication.
            </p>

            <button
              onClick={() => alert("Create and publish notice will open here.")}
            >
              Create Notice →
            </button>
          </div>
        </div>

        <div className="notice-info-card">
          <div className="notice-info-icon">🔔</div>

          <div>
            <h3>Resident Communication</h3>

            <p>
              Notices can communicate maintenance schedules, meetings,
              security instructions, repairs and other important updates.
            </p>

            <button
              onClick={() => alert("Notice activity will open here.")}
            >
              View Activity →
            </button>
          </div>
        </div>
      </div>

      {/* Implementation Note */}
      <div className="notice-note">
        <span>💡</span>

        <div>
          <strong>Implementation Note</strong>

          <p>
            Current notices are demo/static data. Backend API, MySQL storage,
            publishing workflow and resident dashboard integration will be
            connected during the backend integration phase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notices;