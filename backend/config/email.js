const nodemailer = require("nodemailer");
require("dotenv").config();

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const service = process.env.SMTP_SERVICE || (host ? undefined : "gmail");
const secure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : port === 465;

const transporter = user && pass
  ? nodemailer.createTransport({
    ...(host ? { host, port, secure } : { service }),
    auth: { user, pass },
  })
  : null;

module.exports = transporter;
