const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_FORMAT = /^[0-9]{10}$/;

// Each helper returns an error message, or "" when the value is acceptable.

const getEmailError = (email) => {
  const value = typeof email === "string" ? email.trim() : "";

  if (!value) {
    return "Email is required";
  }

  if (value !== value.toLowerCase()) {
    return "Email must be in lowercase letters only (no capital letters)";
  }

  if (!EMAIL_FORMAT.test(value)) {
    return "Please enter a valid email address";
  }

  return "";
};

const getPhoneError = (phone) => {
  const value = typeof phone === "string" ? phone.trim() : String(phone ?? "");

  if (!PHONE_FORMAT.test(value)) {
    return "Phone number must be exactly 10 digits";
  }

  return "";
};

module.exports = { getEmailError, getPhoneError };
