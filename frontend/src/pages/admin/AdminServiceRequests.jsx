import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Wrench } from "lucide-react";
import {
  SERVICE_REQUEST_DEPARTMENTS,
  canTakeWork,
  departmentsFor
} from "../../constants/workDepartments";
import "../../css/admin.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const AdminServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin session expired. Please log in again.");

      const headers = { Authorization: `Bearer ${token}` };
      const [requestResponse, staffResponse] = await Promise.all([
        fetch("http://localhost:5000/api/admin/service-requests", { headers, signal }),
        fetch("http://localhost:5000/api/admin/staff", { headers, signal }),
      ]);
      const [requestData, staffData] = await Promise.all([
        requestResponse.json(),
        staffResponse.json(),
      ]);

      if (!requestResponse.ok) {
        throw new Error(requestData.message || "Unable to load service requests.");
      }
      if (!staffResponse.ok) {
        throw new Error(staffData.message || "Unable to load staff members.");
      }

      setRequests(requestData.requests || []);
      setStaff(staffData.staff || []);
    } catch (fetchError) {
      if (fetchError.name === "AbortError") return;
      setError(fetchError.message || "Unable to load service requests.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadServiceRequests = async () => {
      await fetchData(controller.signal);
    };
    loadServiceRequests();
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [fetchData]);

  const updateAssignment = async (requestId, staffId) => {
    if (!staffId) return;

    setUpdatingId(requestId);
    setAssignmentError("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/service-requests/${requestId}/assign`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ staff_id: Number(staffId) }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to assign service request.");
      }

      setRequests((current) => current.map((request) =>
        request.service_request_id === requestId
          ? {
              ...request,
              assigned_to: data.assigned_to,
              staff_first_name: staff.find((person) => person.id === data.assigned_to)?.first_name || "",
              staff_last_name: staff.find((person) => person.id === data.assigned_to)?.last_name || "",
            }
          : request
      ));
    } catch (updateError) {
      setAssignmentError(updateError.message || "Unable to assign service request.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) => [
      request.service_request_id,
      request.service_type,
      request.request_description,
      request.first_name,
      request.last_name,
      request.flat_number,
      request.status,
      request.staff_first_name,
      request.staff_last_name,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [requests, searchTerm]);

  const pendingCount = requests.filter((request) => request.status === "Pending").length;
  const assignedCount = requests.filter((request) => request.assigned_to).length;

  return (
    <div className="admin-records-page admin-service-requests-page">
      <header className="admin-records-header">
        <div>
          <span className="admin-records-eyebrow">RESIDENT SERVICES</span>
          <h1>Service Requests</h1>
          <p>Review resident requests and assign them to the right staff member.</p>
        </div>
        <button
          type="button"
          className="admin-records-refresh"
          onClick={() => fetchData()}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </header>

      <section className="admin-records-stats">
        <article>
          <span><Wrench size={18} aria-hidden="true" /></span>
          <div><small>Total requests</small><strong>{loading ? "—" : requests.length}</strong></div>
        </article>
        <article>
          <span>⌛</span>
          <div><small>Pending</small><strong>{loading ? "—" : pendingCount}</strong></div>
        </article>
        <article>
          <span>✓</span>
          <div><small>Assigned to staff</small><strong>{loading ? "—" : assignedCount}</strong></div>
        </article>
      </section>

      {assignmentError && <p className="admin-staff-form-error" role="alert">{assignmentError}</p>}

      <section className="admin-records-card">
        <div className="admin-records-card-header">
          <div>
            <h2>Resident Requests</h2>
            <p>{filteredRequests.length} of {requests.length} requests</p>
          </div>
          <label className="admin-records-search">
            <Search size={16} aria-hidden="true" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search request, resident or staff"
            />
          </label>
        </div>

        {loading ? (
          <div className="admin-records-state">Loading service requests from database...</div>
        ) : error ? (
          <div className="admin-records-state error">
            <strong>Unable to load service requests</strong>
            <p>{error}</p>
            <button type="button" onClick={() => fetchData()}>Try again</button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="admin-records-state">
            {requests.length === 0
              ? "No resident service requests have been submitted yet."
              : "No service requests match this search."}
          </div>
        ) : (
          <div className="admin-records-table-wrap">
            <table className="admin-records-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Resident</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Assigned staff</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const requestId = Number(request.service_request_id);
                  const residentName = `${request.first_name || ""} ${request.last_name || ""}`.trim() || "Resident";
                  // Only staff of the matching type can take this request
                  // (the person already assigned stays in the list).
                  const eligibleStaff = staff.filter(
                    (person) =>
                      canTakeWork(
                        SERVICE_REQUEST_DEPARTMENTS,
                        request.service_type,
                        person.department
                      ) || person.id === request.assigned_to
                  );
                  const neededDepartments = departmentsFor(
                    SERVICE_REQUEST_DEPARTMENTS,
                    request.service_type
                  );
                  return (
                    <tr key={requestId}>
                      <td>
                        <div className="admin-records-person">
                          <span>{request.service_type?.charAt(0)?.toUpperCase() || "S"}</span>
                          <div>
                            <strong>{request.service_type || "Service request"}</strong>
                            <small>Request #{requestId} · {request.request_description || "No description"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{residentName}</strong>
                        <small className="admin-service-request-flat">Flat {request.flat_number || "—"}</small>
                      </td>
                      <td>{request.status || "Pending"}</td>
                      <td>{formatDate(request.request_date)}</td>
                      <td>
                        <select
                          aria-label={`Assign request ${requestId} to staff`}
                          value={request.assigned_to || ""}
                          disabled={updatingId === requestId || eligibleStaff.length === 0}
                          onChange={(event) => updateAssignment(requestId, event.target.value)}
                        >
                          <option value="" disabled>
                            {eligibleStaff.length
                              ? "Select staff"
                              : neededDepartments
                                ? `No ${neededDepartments} staff yet`
                                : "No staff available"}
                          </option>
                          {eligibleStaff.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.first_name} {person.last_name} · {person.department || "No department"}
                            </option>
                          ))}
                        </select>
                        {updatingId === requestId && <small>Saving assignment…</small>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminServiceRequests;
