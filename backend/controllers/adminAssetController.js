const { pool } = require("../config/db");

const getAdminAssets = async (req, res) => {
  try {
    const [assets] = await pool.query(
      `SELECT asset_id, asset_name, category, quantity, assigned,
              GREATEST(quantity - assigned, 0) AS available,
              condition_status, location, status, updated_at
       FROM assets
       ORDER BY asset_name ASC`
    );

    res.status(200).json({ assets });
  } catch (error) {
    console.error("Get Admin Assets Error:", error);
    res.status(500).json({ message: "Unable to fetch inventory" });
  }
};

const createAdminAsset = async (req, res) => {
  try {
    const assetName = typeof req.body.asset_name === "string"
      ? req.body.asset_name.trim()
      : "";
    const category = typeof req.body.category === "string"
      ? req.body.category.trim()
      : "";
    const quantity = Number(req.body.quantity);
    const condition = typeof req.body.condition_status === "string"
      ? req.body.condition_status.trim()
      : "Good";
    const location = typeof req.body.location === "string"
      ? req.body.location.trim()
      : "";
    const status = req.body.status || "Available";

    if (!assetName || assetName.length > 150) {
      return res.status(400).json({ message: "Enter an asset name up to 150 characters" });
    }
    if (!category || category.length > 80) {
      return res.status(400).json({ message: "Enter a category up to 80 characters" });
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative whole number" });
    }
    if (condition.length > 40 || location.length > 150) {
      return res.status(400).json({ message: "Condition or location is too long" });
    }
    if (!["Available", "In Use", "Maintenance"].includes(status)) {
      return res.status(400).json({ message: "Select a valid asset status" });
    }

    const assigned = status === "In Use" ? quantity : 0;
    const [result] = await pool.query(
      `INSERT INTO assets
         (asset_name, category, quantity, assigned, condition_status, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [assetName, category, quantity, assigned, condition || "Good", location, status]
    );

    const [assets] = await pool.query(
      `SELECT asset_id, asset_name, category, quantity, assigned,
              GREATEST(quantity - assigned, 0) AS available,
              condition_status, location, status, updated_at
       FROM assets
       WHERE asset_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Asset added successfully",
      asset: assets[0],
    });
  } catch (error) {
    console.error("Create Admin Asset Error:", error);
    res.status(500).json({ message: "Unable to add asset" });
  }
};

module.exports = {
  getAdminAssets,
  createAdminAsset,
};
