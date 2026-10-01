const db = require("../config/db");

const createNotice = async (req, res) => {
  try {
    const { title, description, notice_type, publish_date, expiry_date } =
      req.body;

    if (!title || !description || !notice_type) {
      return res.status(400).json({
        success: false,
        message: "Title, description and notice type are required",
      });
    }

    const postedBy = req.user.id;

    const [result] = await db.query(
      `INSERT INTO notices
      (title, description, notice_type, posted_by, publish_date, expiry_date, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [
        title,
        description,
        notice_type,
        postedBy,
        publish_date || new Date(),
        expiry_date || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice_id: result.insertId,
    });
  } catch (error) {
    console.error("Create notice error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create notice",
    });
  }
};

const getAllNotices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        n.notice_id,
        n.title,
        n.description,
        n.notice_type,
        n.posted_by,
        n.publish_date,
        n.expiry_date,
        n.status,
        a.name AS posted_by_name
      FROM notices n
      LEFT JOIN admins a ON n.posted_by = a.id
      ORDER BY n.publish_date DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get notices error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
};

const getActiveNotices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        n.notice_id,
        n.title,
        n.description,
        n.notice_type,
        n.publish_date,
        n.expiry_date,
        n.status,
        a.name AS posted_by_name
      FROM notices n
      LEFT JOIN admins a ON n.posted_by = a.id
      WHERE n.status = 'Active'
        AND (n.expiry_date IS NULL OR n.expiry_date >= NOW())
        AND n.publish_date <= NOW()
      ORDER BY n.publish_date DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get active notices error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch active notices",
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      notice_type,
      publish_date,
      expiry_date,
      status,
    } = req.body;

    await db.query(
      `UPDATE notices
       SET title = ?,
           description = ?,
           notice_type = ?,
           publish_date = ?,
           expiry_date = ?,
           status = ?
       WHERE notice_id = ?`,
      [
        title,
        description,
        notice_type,
        publish_date,
        expiry_date || null,
        status || "Active",
        id,
      ]
    );

    res.json({
      success: true,
      message: "Notice updated successfully",
    });
  } catch (error) {
    console.error("Update notice error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notice",
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM notices WHERE notice_id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notice",
    });
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getActiveNotices,
  updateNotice,
  deleteNotice,
};