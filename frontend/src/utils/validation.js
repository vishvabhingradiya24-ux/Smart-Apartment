const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each helper returns an error message, or "" when the value is acceptable.
// Keep these rules in sync with backend/utils/validation.js.

export const getEmailError = (email) => {
  const value = String(email || "").trim();

  if (!value) {
    return "Email is required";
  }

  if (value !== value.toLowerCase()) {
    return "Email must be in lowercase letters only (no capital letters)";
  }

  if (!EMAIL_FORMAT.test(value)) {
    return "Enter a valid email address (for example name@gmail.com)";
  }

  return "";
};

export const getPhoneError = (phone) => {
  const value = String(phone || "");

  if (!value) {
    return "Phone number is required";
  }

  if (!/^[0-9]{10}$/.test(value)) {
    return `Phone number must be exactly 10 digits (${value.length}/10)`;
  }

  return "";
};
