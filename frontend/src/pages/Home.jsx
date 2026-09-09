import "../css/home.css";

function Home() {
  return (
    <div className="home-page">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-logo">⌂</div>
          <div>
            <h2>Smart Apartment</h2>
            <span>Society Management</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#home" className="active">Home</a>
          <a href="#about">About Society</a>
          <a href="#facilities">Facilities</a>
          <a href="#contact">Contact Us</a>
        </div>

        <div className="nav-buttons">
          <a href="/login" className="login-btn">Login</a>
          <a href="/register" className="register-btn">Register</a>
        </div>
      </nav>


      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-tag">
            🏠 Smart Society Management
          </div>

          <h1>
            Manage Your Society
            <span>Smarter & Easier</span>
          </h1>

          <p>
            A modern and secure platform to simplify apartment and society
            management. Handle residents, visitors, maintenance, payments
            and amenities — all in one place.
          </p>

          <div className="hero-buttons">
            <a href="/register" className="primary-btn">
              Get Started →
            </a>

            <a href="#features" className="secondary-btn">
              Explore Features
            </a>
          </div>

          <div className="hero-stats">

            <div className="stat">
              <div className="stat-icon">👥</div>
              <div>
                <strong>500+</strong>
                <span>Residents</span>
              </div>
            </div>

            <div className="stat">
              <div className="stat-icon">🏢</div>
              <div>
                <strong>50+</strong>
                <span>Facilities</span>
              </div>
            </div>

            <div className="stat">
              <div className="stat-icon">🛡️</div>
              <div>
                <strong>24/7</strong>
                <span>Security</span>
              </div>
            </div>

          </div>

        </div>

        <div className="hero-image">
          <div className="hero-overlay"></div>
        </div>

      </section>


      {/* FEATURES */}
      <section className="features" id="features">

        <div className="section-heading">
          <span>OUR FEATURES</span>
          <h2>Everything You Need, In One Place</h2>
          <p>
            Simplify daily tasks and enjoy a better living experience
            with our smart features.
          </p>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon green">👥</div>
            <h3>Resident Management</h3>
            <p>
              Easily manage resident information and records.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">👤</div>
            <h3>Visitor Management</h3>
            <p>
              Track and verify visitors with ease.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">💳</div>
            <h3>Online Payments</h3>
            <p>
              Pay maintenance and other dues securely.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">🔧</div>
            <h3>Maintenance</h3>
            <p>
              Raise and track maintenance requests.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon cyan">📅</div>
            <h3>Amenities Booking</h3>
            <p>
              Book common amenities in just a few clicks.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon red">🛡️</div>
            <h3>Security & Safety</h3>
            <p>
              A safer community for everyone.
            </p>
          </div>

        </div>

      </section>


      {/* ABOUT */}
      <section className="about" id="about">

        <div className="about-image">
          <div className="about-badge">
            <div className="badge-icon">👥</div>
            <div>
              <strong>A Better Community</strong>
              <p>
                Together we build a safer and happier society.
              </p>
            </div>
          </div>
        </div>

        <div className="about-content">

          <span>ABOUT US</span>

          <h2>
            Building Smarter
            <strong>Communities</strong>
          </h2>

          <p>
            Smart Apartment is designed to bring convenience, security
            and transparency to residential societies. Our platform helps
            residents, committees and management work together for a
            better living experience.
          </p>

          <div className="about-points">
            <span>✓ Easy to Use</span>
            <span>✓ Secure & Reliable</span>
            <span>✓ 24/7 Support</span>
          </div>

          <a href="#contact" className="learn-btn">
            Learn More →
          </a>

        </div>

      </section>


      {/* FACILITIES */}
      <section className="facilities" id="facilities">

        <div className="section-heading">
          <span>SOCIETY FACILITIES</span>
          <h2>Everything Your Society Offers</h2>
        </div>

        <div className="facility-grid">

          <div className="facility-card">
            <span>🏊</span>
            <h3>Swimming Pool</h3>
          </div>

          <div className="facility-card">
            <span>🏋️</span>
            <h3>Gym</h3>
          </div>

          <div className="facility-card">
            <span>🎉</span>
            <h3>Community Hall</h3>
          </div>

          <div className="facility-card">
            <span>🌳</span>
            <h3>Garden</h3>
          </div>

        </div>

      </section>


      {/* CONTACT / CTA */}
      <section className="cta" id="contact">

        <div>
          <span>SMARTER LIVING STARTS HERE</span>

          <h2>
            Make Your Society
            <strong>Smarter Today.</strong>
          </h2>

          <p>
            Manage your society, connect with residents and simplify
            everyday operations from one platform.
          </p>

          <a href="/register">
            Create Your Account →
          </a>
        </div>

      </section>


      {/* FOOTER */}
      <footer>

        <div className="footer-content">

          <div>
            <h2>Smart <span>Apartment</span></h2>
            <p>
              Smart management for better community living.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#about">About Society</a>
            <a href="#facilities">Facilities</a>
          </div>

          <div>
            <h4>Contact Us</h4>
            <p>📧 support@smartapartment.com</p>
            <p>📞 +91 98765 43210</p>
          </div>

        </div>

        <div className="footer-bottom">
          © 2026 Smart Apartment. All Rights Reserved.
        </div>

      </footer>

    </div>
  );
}

export default Home;