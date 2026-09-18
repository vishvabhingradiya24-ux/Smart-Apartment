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
    password: "",
    confirm_password: "",
    terms: false
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone ||
      !formData.user_type ||
      !formData.password ||
      !formData.confirm_password
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/resident/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            user_type:
              formData.user_type.charAt(0).toUpperCase() +
              formData.user_type.slice(1),
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
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
              <div className="register-feature-icon">✓</div>

              <div className="register-feature-text">
                <strong>Easy Maintenance & Payments</strong>
                <span>Manage your society payments easily.</span>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-feature-icon">✓</div>

              <div className="register-feature-text">
                <strong>Quick Visitor Management</strong>
                <span>Manage visitors and approvals securely.</span>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-feature-icon">✓</div>

              <div className="register-feature-text">
                <strong>Complaints & Service Requests</strong>
                <span>Raise and track your requests easily.</span>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-feature-icon">✓</div>

              <div className="register-feature-text">
                <strong>Community Notices & Events</strong>
                <span>Stay updated with society activities.</span>
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
              />

            </div>


            <div className="register-form-group">

              <label>User Type</label>

              <select
                className="register-select"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
              >

                <option value="" disabled>
                  Select user type
                </option>

                <option value="resident">
                  Resident
                </option>

                <option value="security">
                  Security
                </option>

                <option value="staff">
                  Staff
                </option>

              </select>

            </div>


            <div className="register-form-group">

              <label>Password</label>

              <div className="register-password">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
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
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
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
              <div style={{ color: "red", marginTop: "10px" }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ color: "green", marginTop: "10px" }}>
                {message}
              </div>
            )}


            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
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