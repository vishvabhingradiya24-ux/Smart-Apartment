const { pool } = require("../config/db");
const { STAFF_DEPARTMENTS } = require("../constants/staffDepartments");

// Public, read-only data for the marketing Home page.
// Only counts and society / facility details are returned. No resident,
// staff or visitor names, contact details or money amounts ever leave here.

const CACHE_MS = 30 * 1000;
let cache = { at: 0, data: null };

const toNumber = (value) => Number(value) || 0;

const shortText = (value, max = 40) =>
  String(value || "").trim().slice(0, max);

const dayLabel = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short"
  });

const complaintText = (row) => {
  const topic = shortText(row.category) || "Society";
  const status = String(row.status || "").toLowerCase();

  if (status === "resolved") return `${topic} complaint resolved`;
  if (status === "in progress") return `${topic} complaint in progress`;
  if (status === "assigned") return `${topic} complaint assigned`;

  return `${topic} complaint raised`;
};

const requestText = (row) => {
  const topic = shortText(row.service_type) || "Service";
  const status = String(row.status || "").toLowerCase();

  if (status === "completed") return `${topic} request completed`;
  if (status === "in progress") return `${topic} request in progress`;

  return `${topic} request raised`;
};

const visitorText = (row) => {
  const status = shortText(row.status, 20).toLowerCase();

  return status ? `Visitor ${status}` : "Visitor registered";
};

const getOverview = async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.at < CACHE_MS) {
      return res.json(cache.data);
    }

    const [
      [societyRows],
      [[residents]],
      [[staff]],
      [[facilityCount]],
      [facilityRows],
      [[notices]],
      [[complaints]],
      [[requests]],
      [[visitors]],
      [visitorDays],
      [complaintDays],
      [requestDays],
      [recentComplaints],
      [recentRequests],
      [recentVisitors],
      [staffByDepartment]
    ] = await Promise.all([
      pool.query(
        `SELECT society_name, address, contact_email, contact_phone,
                total_blocks, total_flats
         FROM societies
         WHERE status = 'Active'
         ORDER BY society_id ASC
         LIMIT 1`
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM residents
         WHERE user_type = 'Resident' AND is_active = 1`
      ),
      pool.query(`SELECT COUNT(*) AS total FROM staff`),
      pool.query(`SELECT COUNT(*) AS total FROM facilities`),
      pool.query(
        `SELECT facility_id, facility_name, description, location,
                availability_status
         FROM facilities
         ORDER BY facility_name ASC
         LIMIT 8`
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM notices
         WHERE status = 'Active'
           AND (expiry_date IS NULL OR expiry_date >= NOW())
           AND publish_date <= NOW()`
      ),
      pool.query(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(status = 'Resolved'), 0) AS resolved
         FROM complaints`
      ),
      pool.query(
        `SELECT COALESCE(SUM(status IN ('Pending', 'In Progress')), 0) AS open_total
         FROM service_requests`
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM visitors
         WHERE DATE(visit_date) = CURDATE()`
      ),
      pool.query(
        `SELECT DATE_FORMAT(visit_date, '%Y-%m-%d') AS day, COUNT(*) AS total
         FROM visitors
         WHERE DATE(visit_date) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         GROUP BY day`
      ),
      pool.query(
        `SELECT DATE_FORMAT(complaint_date, '%Y-%m-%d') AS day, COUNT(*) AS total
         FROM complaints
         WHERE DATE(complaint_date) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         GROUP BY day`
      ),
      pool.query(
        `SELECT DATE_FORMAT(request_date, '%Y-%m-%d') AS day, COUNT(*) AS total
         FROM service_requests
         WHERE DATE(request_date) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         GROUP BY day`
      ),
      pool.query(
        `SELECT category, status, complaint_date AS at
         FROM complaints ORDER BY complaint_date DESC LIMIT 4`
      ),
      pool.query(
        `SELECT service_type, status, request_date AS at
         FROM service_requests ORDER BY request_date DESC LIMIT 4`
      ),
      pool.query(
        `SELECT status, created_at AS at
         FROM visitors ORDER BY created_at DESC LIMIT 4`
      ),
      pool.query(
        `SELECT department, COUNT(*) AS total
         FROM staff
         GROUP BY department`
      )
    ]);

    // Last 7 days (oldest first), each day = visitors + complaints + requests.
    const perDay = new Map();

    [visitorDays, complaintDays, requestDays].forEach((rows) => {
      rows.forEach(({ day, total }) => {
        perDay.set(day, (perDay.get(day) || 0) + toNumber(total));
      });
    });

    const activity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));

      const iso = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");

      return { date: iso, label: dayLabel(iso), count: perDay.get(iso) || 0 };
    });

    const recent = [
      ...recentComplaints.map((row) => ({
        type: "complaint",
        text: complaintText(row),
        at: row.at
      })),
      ...recentRequests.map((row) => ({
        type: "request",
        text: requestText(row),
        at: row.at
      })),
      ...recentVisitors.map((row) => ({
        type: "visitor",
        text: visitorText(row),
        at: row.at
      }))
    ]
      .filter((item) => item.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 4)
      .map((item) => ({
        type: item.type,
        text: item.text,
        at: new Date(item.at).toISOString()
      }));

    const society = societyRows[0]
      ? {
          name: societyRows[0].society_name,
          address: societyRows[0].address,
          contactEmail: societyRows[0].contact_email,
          contactPhone: societyRows[0].contact_phone,
          totalBlocks: toNumber(societyRows[0].total_blocks),
          totalFlats: toNumber(societyRows[0].total_flats)
        }
      : null;

    const data = {
      society,
      stats: {
        residents: toNumber(residents.total),
        staff: toNumber(staff.total),
        facilities: toNumber(facilityCount.total),
        activeNotices: toNumber(notices.total),
        complaintsTotal: toNumber(complaints.total),
        complaintsResolved: toNumber(complaints.resolved),
        openRequests:
          toNumber(complaints.total) -
          toNumber(complaints.resolved) +
          toNumber(requests.open_total),
        visitorsToday: toNumber(visitors.total)
      },
      activity,
      recent,
      departments: STAFF_DEPARTMENTS.map((name) => ({
        name,
        staff: toNumber(
          staffByDepartment.find((row) => row.department === name)?.total
        )
      })),
      facilities: facilityRows.map((row) => ({
        id: row.facility_id,
        name: row.facility_name,
        description: shortText(row.description, 90),
        location: shortText(row.location, 60),
        available: row.availability_status === "Available"
      }))
    };

    cache = { at: Date.now(), data };

    return res.json(data);
  } catch (error) {
    console.error("Public overview error:", error);

    return res.status(500).json({
      message: "Unable to load society overview"
    });
  }
};

module.exports = { getOverview };
