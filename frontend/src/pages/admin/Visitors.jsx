import { useState } from "react";
import "../../css/visitors.css";

const Visitors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Temporary demo data.
  // Backend + MySQL integration will be added later.
  const visitors = [
    {
      visitorId: "VIS1001",
      visitorName: "Rahul Mehta",
      contact: "9876543210",
      flatNumber: "A-101",
      residentName: "Radhe Patel",
      purpose: "Family Visit",
      approvalStatus: "Approved",
      entryTime: "10:15 AM",
      exitTime: "12:20 PM",
      visitorType: "Visitor",
    },
    {
      visitorId: "VIS1002",
      visitorName: "Amit Sharma",
      contact: "9825012345",
      flatNumber: "A-204",
      residentName: "Neha Shah",
      purpose: "Courier Delivery",
      approvalStatus: "Approved",
      entryTime: "11:05 AM",
      exitTime: "11:20 AM",
      visitorType: "Delivery",
    },
    {
      visitorId: "VIS1003",
      visitorName: "Kunal Desai",
      contact: "9898989898",
      flatNumber: "B-102",
      residentName: "Amit Joshi",
      purpose: "Personal Visit",
      approvalStatus: "Pending",
      entryTime: "-",
      exitTime: "-",
      visitorType: "Visitor",
    },
    {
      visitorId: "VIS1004",
      visitorName: "Rakesh Kumar",
      contact: "9812345678",
      flatNumber: "B-305",
      residentName: "Pooja Mehta",
      purpose: "Plumbing Service",
      approvalStatus: "Approved",
      entryTime: "09:30 AM",
      exitTime: "-",
      visitorType: "Service",
    },
    {
      visitorId: "VIS1005",
      visitorName: "Priya Shah",
      contact: "9909876543",
      flatNumber: "C-201",
      residentName: "Karan Desai",
      purpose: "Friend Visit",
      approvalStatus: "Rejected",
      entryTime: "-",
      exitTime: "-",
      visitorType: "Visitor",
    },
    {
      visitorId: "VIS1006",
      visitorName: "Delivery Partner",
      contact: "9988776655",
      flatNumber: "C-402",
      residentName: "Riya Patel",
      purpose: "Food Delivery",
      approvalStatus: "Approved",
      entryTime: "01:15 PM",
      exitTime: "01:25 PM",
      visitorType: "Delivery",
    },
  ];

  const filteredVisitors = visitors.filter((visitor) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      visitor.visitorId.toLowerCase().includes(search) ||
      visitor.visitorName.toLowerCase().includes(search) ||
      visitor.contact.toLowerCase().includes(search) ||
      visitor.flatNumber.toLowerCase().includes(search) ||
      visitor.residentName.toLowerCase().includes(search) ||
      visitor.purpose.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      visitor.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalVisitors = visitors.length;

  const approvedVisitors = visitors.filter(
    (visitor) => visitor.approvalStatus === "Approved"
  );

  const pendingVisitors = visitors.filter(
    (visitor) => visitor.approvalStatus === "Pending"
  );

  const insideVisitors = visitors.filter(
    (visitor) =>
      visitor.entryTime !== "-" && visitor.exitTime === "-"
  );

  const deliveryVisitors = visitors.filter(
    (visitor) => visitor.visitorType === "Delivery"
  );

  const handleView = (visitor) => {
    alert(
      `Visitor Details\n\nVisitor ID: ${visitor.visitorId}\nName: ${visitor.visitorName}\nContact: ${visitor.contact}\nFlat: ${visitor.flatNumber}\nResident: ${visitor.residentName}\nPurpose: ${visitor.purpose}\nApproval: ${visitor.approvalStatus}\nEntry: ${visitor.entryTime}\nExit: ${visitor.exitTime}`
    );
  };

  const handleVerify = (visitor) => {
    if (visitor.approvalStatus === "Approved") {
      alert(`${visitor.visitorName} is already approved.`);
    } else {
      alert(
        `Visitor verification will be connected with resident approval later.`
      );
    }
  };

  const handleExit = (visitor) => {
    if (visitor.entryTime === "-") {
      alert("Visitor has not entered the premises.");
      return;
    }

    if (visitor.exitTime !== "-") {
      alert("Visitor exit is already recorded.");
      return;
    }

    alert(`Exit recorded for ${visitor.visitorName}.`);
  };

  return (
    <div className="visitors-page">
      {/* Header */}
      <div className="visitors-header">
        <div>
          <p className="visitors-overline">SECURITY & VISITOR MANAGEMENT</p>

          <h1>Visitors Management</h1>

          <p className="visitors-subtitle">
            Monitor visitor entry, exit, approval and gate activity.
          </p>
        </div>

        <button
          className="visitor-add-btn"
          onClick={() =>
            alert("Add visitor form will be connected with backend later.")
          }
        >
          + Record Visitor
        </button>
      </div>

      {/* Summary Cards */}
      <div className="visitor-stats-grid">
        <div className="visitor-stat-card">
          <div className="visitor-stat-icon blue">👥</div>

          <div>
            <p>Total Visitors</p>
            <h2>{totalVisitors}</h2>
            <span>Visitor records</span>
          </div>
        </div>

        <div className="visitor-stat-card">
          <div className="visitor-stat-icon green">✓</div>

          <div>
            <p>Approved</p>
            <h2>{approvedVisitors.length}</h2>
            <span>Approved visitors</span>
          </div>
        </div>

        <div className="visitor-stat-card">
          <div className="visitor-stat-icon orange">⏳</div>

          <div>
            <p>Pending Verification</p>
            <h2>{pendingVisitors.length}</h2>
            <span>Awaiting approval</span>
          </div>
        </div>

        <div className="visitor-stat-card">
          <div className="visitor-stat-icon purple">🚪</div>

          <div>
            <p>Currently Inside</p>
            <h2>{insideVisitors.length}</h2>
            <span>Exit not recorded</span>
          </div>
        </div>
      </div>

      {/* Gate Activity */}
      <section className="gate-activity-section">
        <div className="gate-activity-header">
          <div>
            <h2>Gate Activity</h2>

            <p>
              Quick overview of current visitor and delivery activity.
            </p>
          </div>

          <span className="gate-live">
            <span className="live-dot"></span>
            Live Activity
          </span>
        </div>

        <div className="gate-activity-grid">
          <div className="gate-activity-card">
            <div className="gate-activity-icon">🚶</div>

            <div>
              <span>Visitors Inside</span>
              <strong>{insideVisitors.length}</strong>
            </div>
          </div>

          <div className="gate-activity-card">
            <div className="gate-activity-icon">📦</div>

            <div>
              <span>Deliveries</span>
              <strong>{deliveryVisitors.length}</strong>
            </div>
          </div>

          <div className="gate-activity-card">
            <div className="gate-activity-icon">🔐</div>

            <div>
              <span>Pending Verification</span>
              <strong>{pendingVisitors.length}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Visitor Records */}
      <section className="visitors-section">
        <div className="visitors-section-header">
          <div>
            <h2>Visitor Records</h2>

            <p>
              Search and review visitor entry, exit and approval information.
            </p>
          </div>

          <span className="visitor-record-count">
            {filteredVisitors.length} Records
          </span>
        </div>

        {/* Search & Filter */}
        <div className="visitors-toolbar">
          <div className="visitor-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search visitor, resident, flat or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="visitor-filter">
            <label>Approval</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="visitors-table-wrapper">
          <table className="visitors-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Resident / Flat</th>
                <th>Purpose</th>
                <th>Type</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor.visitorId}>
                    <td>
                      <div className="visitor-person">
                        <div className="visitor-avatar">
                          {visitor.visitorName.charAt(0)}
                        </div>

                        <div>
                          <strong>{visitor.visitorName}</strong>

                          <small>
                            {visitor.visitorId} • {visitor.contact}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="resident-flat">
                        <strong>{visitor.residentName}</strong>
                        <span>{visitor.flatNumber}</span>
                      </div>
                    </td>

                    <td>
                      <span className="purpose-text">
                        {visitor.purpose}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`visitor-type type-${visitor.visitorType.toLowerCase()}`}
                      >
                        {visitor.visitorType === "Delivery"
                          ? "📦"
                          : visitor.visitorType === "Service"
                          ? "🔧"
                          : "👤"}{" "}
                        {visitor.visitorType}
                      </span>
                    </td>

                    <td>
                      <span className="time-text">
                        {visitor.entryTime}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          visitor.exitTime === "-"
                            ? "exit-pending"
                            : "time-text"
                        }
                      >
                        {visitor.exitTime}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`approval-status approval-${visitor.approvalStatus.toLowerCase()}`}
                      >
                        {visitor.approvalStatus === "Approved"
                          ? "✓"
                          : visitor.approvalStatus === "Pending"
                          ? "⏳"
                          : "✕"}{" "}
                        {visitor.approvalStatus}
                      </span>
                    </td>

                    <td>
                      <div className="visitor-actions">
                        <button
                          className="visitor-action view"
                          onClick={() => handleView(visitor)}
                          title="View Visitor"
                        >
                          👁️
                        </button>

                        <button
                          className="visitor-action verify"
                          onClick={() => handleVerify(visitor)}
                          title="Verify Visitor"
                        >
                          ✓
                        </button>

                        <button
                          className="visitor-action exit"
                          onClick={() => handleExit(visitor)}
                          title="Record Exit"
                        >
                          🚪
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-visitor-data">
                    <div>
                      <span>🔎</span>
                      <h3>No visitors found</h3>
                      <p>
                        Try changing your search or approval filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visitor Management Information */}
      <section className="visitor-info-card">
        <div className="visitor-info-icon">🛡️</div>

        <div>
          <h3>Visitor Security</h3>

          <p>
            Security personnel can verify visitors, record entry and exit
            information, manage deliveries, review visitor history and handle
            visitors who are not pre-approved.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Visitors;