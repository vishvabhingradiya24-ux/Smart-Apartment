const { pool } = require("../config/db");

// Allows a request only for staff members of the given type(s).
//
// The staff type is read from the database on every request (not from the
// login token), so a change made by the admin applies immediately and a
// staff member can never act as another type by keeping an old token.
const requireStaffDepartment = (...allowed) => async (req, res, next) => {
  try {
    if (req.user?.role !== "Staff") {
      return res.status(403).json({ message: "Staff access required" });
    }

    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, department FROM staff WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Staff account not found" });
    }

    if (!allowed.includes(rows[0].department)) {
      return res.status(403).json({
        message: `Only ${allowed.join(" or ")} staff can use this feature`
      });
    }

    req.staff = rows[0];
    next();
  } catch (error) {
    console.error("Staff department check error:", error);
    res.status(500).json({ message: "Unable to check staff access" });
  }
};

module.exports = requireStaffDepartment;
