import { useState } from "react";
import "../../../src/css/auth.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">

      {/* ================= LEFT SIDE ================= */}
      <section className="login-left">

        <div className="left-content">

          <div className="building-icon">
            🏢
          </div>

          <h1>
            Smart <span>Apartment</span>
          </h1>

          <h3>Manage Better. Live Better.</h3>

          <p className="left-description">
            A smart and secure platform to manage your society,
            residents, visitors, maintenance and amenities in one place.
          </p>


          {/* Features */}

          <div className="features">

            <div className="feature">
              <div className="feature-icon">
                👥
              </div>

              <div>
                <h4>Easy Society Management</h4>
                <p>Manage your society efficiently</p>
              </div>
            </div>


            <div className="feature">
              <div className="feature-icon">
                🛡️
              </div>

              <div>
                <h4>Secure Visitor Management</h4>
                <p>Keep your community safe</p>
              </div>
            </div>


            <div className="feature">
              <div className="feature-icon">
                💳
              </div>

              <div>
                <h4>Maintenance & Payment Tracking</h4>
                <p>Track payments and maintenance</p>
              </div>
            </div>


            <div className="feature">
              <div className="feature-icon">
                📅
              </div>

              <div>
                <h4>Amenity Booking</h4>
                <p>Book amenities easily</p>
              </div>
            </div>

          </div>

        </div>

      </section>


      {/* ================= RIGHT SIDE ================= */}

      <section className="login-right">

        <div className="login-card">

          {/* Logo */}

          <div className="login-logo">
            <div className="logo-building">
              🏢
            </div>

            <h2>
              Smart <span>Apartment</span>
            </h2>
          </div>


          {/* Heading */}

          <div className="login-heading">

            <h1>
              Welcome Back! <span>👋</span>
            </h1>

            <p>
              Login to access your account
            </p>

          </div>


          <form>

            {/* ================= ROLE ================= */}

            <div className="form-group">

              <label>
                Login As
              </label>

              <div className="select-wrapper">

                <span className="field-icon">
                  👤
                </span>

                <select defaultValue="">

                  <option value="" disabled>
                    Select your role
                  </option>

                  <option value="resident">
                    Resident
                  </option>

                  <option value="admin">
                    Admin / Committee
                  </option>

                  <option value="security">
                    Security
                  </option>

                  <option value="staff">
                    Staff
                  </option>

                </select>

              </div>

            </div>


            {/* ================= EMAIL ================= */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="field-icon">
                  ✉
                </span>

                <input
                  type="email"
                  placeholder="Enter your email"
                />

              </div>

            </div>


            {/* ================= PASSWORD ================= */}

            <div className="form-group">

              <div className="password-top">

                <label>
                  Password
                </label>

                <a href="#">
                  Forgot Password?
                </a>

              </div>


              <div className="input-wrapper">

                <span className="field-icon">
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>


            {/* ================= REMEMBER ================= */}

            <div className="remember-row">

              <label className="remember">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* ================= LOGIN BUTTON ================= */}

            <button
              type="submit"
              className="login-button"
            >
              <span>
                Login
              </span>

              <span className="arrow">
                →
              </span>

            </button>

          </form>


          {/* ================= REGISTER ================= */}

          <div className="register-text">

            Don't have an account?

            <a href="#">
              Create an account
            </a>

          </div>


          {/* ================= SECURITY ================= */}

          <div className="security">

            <span>
              🛡️
            </span>

            <p>
              Your information is protected and secure
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;