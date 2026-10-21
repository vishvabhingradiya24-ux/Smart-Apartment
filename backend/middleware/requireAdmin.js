const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || req.user?.user_type || "").trim().toLowerCase();

  if (role !== "admin") {
    console.warn(`Admin access denied on ${req.method} ${req.originalUrl}: token role is "${role || "unknown"}"`);
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
};

module.exports = requireAdmin;
