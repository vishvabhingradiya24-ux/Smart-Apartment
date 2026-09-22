import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_type: "",
    block_wing: "",
    flat_number: "",
    staff_type: "",
    password: "",
    confirm_password: "",
    terms: false
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleUserTypeChange = (e) => {
    const userType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      user_type: userType,
      block_wing: "",
      flat_number: "",
      staff_type: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const form = e.currentTarget;
    const formValues = new FormData(form);

    const first_name = String(
      formValues.get("first_name") || ""
    ).trim();

    const last_name = String(
      formValues.get("last_name") || ""
    ).trim();

    const email = String(
      formValues.get("email") || ""
    ).trim();

    const phone = String(
      formValues.get("phone") || ""
    ).trim();

    const user_type = String(
      formValues.get("user_type") || ""
    ).trim();

    const block_wing = String(
      formValues.get("block_wing") || ""
    ).trim();

    const flat_number = String(
      formValues.get("flat_number") || ""
    ).trim();

    const staff_type = String(
      formValues.get("staff_type") || ""
    ).trim();

    const password = String(
      formValues.get("password") || ""
    );

    const confirm_password = String(
      formValues.get("confirm_password") || ""
    );

    const terms = form.elements.terms.checked;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone ||
      !user_type ||
      !password ||
      !confirm_password
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (user_type === "Resident") {
      if (!block_wing || !flat_number) {
        setError("Please fill Block/Wing and Flat Number.");
        return;
      }
    }

    if (user_type === "Staff") {
      if (!staff_type) {
        setError("Please select Staff Type.");
        return;
      }
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!terms) {
      setError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const isResident = user_type === "Resident";

      const registerURL = isResident
        ? "http://localhost:5000/api/resident/register"
        : "http://localhost:5000/api/staff/register";

      const requestBody = isResident
        ? {
            first_name,
            last_name,
            email,
            phone,
            user_type,
            block_wing,
            flat_number,
            password
          }
        : {
            first_name,
            last_name,
            email,
            phone,
            user_type,
            staff_type,
            password
          };

      console.log("Registration Request:", requestBody);

      const response = await fetch(registerURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setMessage(
        data.message || "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Registration Error:", error);

      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-left">

        <div className="register-left-content">

          <div className="auth-brand">

            <div className="auth-logo">
              🏠
            </div>

            <div>
              <h2>Smart Apartment</h2>
              <span>Smart Living. Better Community.</span>
            </div>

          </div>

          <div className="register-features">

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div className="register-feature-text">

                <strong>
                  Easy Maintenance & Payments
                </strong>

                <span>
                  Manage your society payments easily.
                </span>

              </div>

            </div>

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div className="register-feature-text">

                <strong>
                  Quick Visitor Management
                </strong>

                <span>
                  Manage visitors and approvals securely.
                </span>

              </div>

            </div>

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div className="register-feature-text">

                <strong>
                  Complaints & Service Requests
                </strong>

                <span>
                  Raise and track your requests easily.
                </span>

              </div>

            </div>

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div className="register-feature-text">

                <strong>
                  Community Notices & Events
                </strong>

                <span>
                  Stay updated with society activities.
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      <div className="register-right">

        <div className="register-card">

          <div className="register-heading">

            <h1>Create Account</h1>

            <p>
              Register to access your Smart Apartment account
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="register-row">

              <div className="register-form-group">

                <label>First Name</label>

                <input
                  type="text"
                  name="first_name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="register-form-group">

                <label>Last Name</label>

                <input
                  type="text"
                  name="last_name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="register-form-group">

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            <div className="register-form-group">

              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

            </div>

            <div className="register-form-group">

              <label>Register As</label>

              <select
                className="register-select"
                name="user_type"
                value={formData.user_type}
                onChange={handleUserTypeChange}
                required
              >

                <option value="" disabled>
                  Select role
                </option>

                <option value="Resident">
                  Resident
                </option>

                <option value="Staff">
                  Staff
                </option>

              </select>

            </div>

            {formData.user_type === "Resident" && (

              <div className="register-row">

                <div className="register-form-group">

                  <label>Block / Wing</label>

                  <select
                    className="register-select"
                    name="block_wing"
                    value={formData.block_wing}
                    onChange={handleChange}
                    required
                  >

                    <option value="" disabled>
                      Select block / wing
                    </option>

                    <option value="A Wing">
                      A Wing
                    </option>

                    <option value="B Wing">
                      B Wing
                    </option>

                    <option value="C Wing">
                      C Wing
                    </option>

                    <option value="D Wing">
                      D Wing
                    </option>

                  </select>

                </div>

                <div className="register-form-group">

                  <label>Flat Number</label>

                  <input
                    type="text"
                    name="flat_number"
                    placeholder="e.g. A-101"
                    value={formData.flat_number}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            )}

            {formData.user_type === "Staff" && (

              <div className="register-form-group">

                <label>Staff Type</label>

                <select
                  className="register-select"
                  name="staff_type"
                  value={formData.staff_type}
                  onChange={handleChange}
                  required
                >

                  <option value="" disabled>
                    Select staff type
                  </option>

                  <option value="Security Staff">
                    Security Staff
                  </option>

                  <option value="Maintenance Staff">
                    Maintenance Staff
                  </option>

                  <option value="Housekeeping Staff">
                    Housekeeping Staff
                  </option>

                  <option value="Reception Staff">
                    Reception Staff
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            )}

            <div className="register-form-group">

              <label>Password</label>

              <div className="register-password">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            <div className="register-form-group">

              <label>Confirm Password</label>

              <div className="register-password">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            <label className="register-terms">

              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />

              <span>
                I agree to the Terms & Conditions and Privacy Policy
              </span>

            </label>

            {error && (

              <div
                style={{
                  color: "red",
                  marginTop: "10px"
                }}
              >
                {error}
              </div>

            )}

            {message && (

              <div
                style={{
                  color: "green",
                  marginTop: "10px"
                }}
              >
                {message}
              </div>

            )}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign In
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;