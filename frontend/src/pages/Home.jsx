import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  Dumbbell,
  Mail,
  Menu,
  PartyPopper,
  Phone,
  ShieldCheck,
  Trees,
  UserCheck,
  Users,
  Waves,
  Wrench,
  X
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import Reveal from "../components/Reveal";
import { useCountUp, useInView } from "../hooks/useInView";
import courtyardPhoto from "../assets/community-courtyard.jpg";
import exteriorPhoto from "../assets/apartment.jpg";
import livingRoomPhoto from "../assets/resident-community.jpg";
import "../css/brand.css";
import "../css/home.css";

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "about", label: "About Society" },
  { id: "facilities", label: "Facilities" },
  { id: "contact", label: "Contact Us" }
];

const FEATURES = [
  {
    icon: Users,
    tone: "green",
    title: "Resident Management",
    text: "Easily manage resident information, flats and records in one place."
  },
  {
    icon: UserCheck,
    tone: "blue",
    title: "Visitor Management",
    text: "Track, approve and verify every visitor at the gate with ease."
  },
  {
    icon: CreditCard,
    tone: "purple",
    title: "Online Payments",
    text: "Pay maintenance and other society dues securely, anytime."
  },
  {
    icon: Wrench,
    tone: "amber",
    title: "Maintenance",
    text: "Raise complaints and service requests and follow them to the end."
  },
  {
    icon: CalendarDays,
    tone: "teal",
    title: "Amenities Booking",
    text: "Book the hall, gym or pool in just a few clicks."
  },
  {
    icon: ShieldCheck,
    tone: "rose",
    title: "Security and Safety",
    text: "A safer, better informed community for every family."
  }
];

const FACILITIES = [
  { icon: Waves, name: "Swimming Pool", note: "Open 6 AM - 9 PM", bg: "pool" },
  { icon: Dumbbell, name: "Gym", note: "Fully equipped", bg: "gym" },
  { icon: PartyPopper, name: "Community Hall", note: "Events and parties", bg: "hall" },
  { icon: Trees, name: "Garden", note: "Green walking trails", bg: "garden" }
];

const FOLLOW_CURSOR = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
};

function Stat({ icon: Icon, target, suffix = "", text, label }) {
  const { ref, inView } = useInView({ threshold: 0.6 });
  const value = useCountUp(target || 0, inView);

  return (
    <div className="sa-stat" ref={ref}>
      <span className="sa-stat-icon">
        <Icon size={20} aria-hidden="true" />
      </span>

      <div>
        <strong>{text || `${value}${suffix}`}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function DashboardMock() {
  const { ref, inView } = useInView({ threshold: 0.3 });
  const bars = [38, 62, 48, 80, 58, 92, 70];

  return (
    <div
      className={`sa-mock ${inView ? "is-visible" : ""}`}
      ref={ref}
      aria-hidden="true"
    >
      <div className="sa-mock-bar">
        <i />
        <i />
        <i />
        <span>Society overview</span>
      </div>

      <div className="sa-mock-stats">
        <div>
          <small>Dues collected</small>
          <strong>₹4.8L</strong>
        </div>
        <div>
          <small>Open requests</small>
          <strong>12</strong>
        </div>
        <div>
          <small>Visitors today</small>
          <strong>38</strong>
        </div>
      </div>

      <div className="sa-mock-chart">
        {bars.map((height, index) => (
          <span
            key={index}
            style={{ "--h": `${height}%`, "--d": `${index * 90}ms` }}
          />
        ))}
      </div>

      <ul className="sa-mock-list">
        <li>
          <span className="sa-mock-dot green">
            <Check size={14} />
          </span>
          Lift complaint resolved
          <small>2m ago</small>
        </li>
        <li>
          <span className="sa-mock-dot blue">
            <UserCheck size={14} />
          </span>
          Visitor approved at Gate 1
          <small>9m ago</small>
        </li>
        <li>
          <span className="sa-mock-dot amber">
            <CreditCard size={14} />
          </span>
          Maintenance paid - A 204
          <small>21m ago</small>
        </li>
      </ul>
    </div>
  );
}

function Home() {
  const visualRef = useRef(null);

  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 12
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    NAV_LINKS.forEach(({ id }) => {
      const section = document.getElementById(id);

      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleHeroMove = (event) => {
    const node = visualRef.current;

    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    node.style.setProperty("--mx", x.toFixed(3));
    node.style.setProperty("--my", y.toFixed(3));
  };

  const handleHeroLeave = () => {
    const node = visualRef.current;

    if (!node) return;

    node.style.setProperty("--mx", "0");
    node.style.setProperty("--my", "0");
  };

  return (
    <div className="sa-brand sa-home">

      {/* NAVBAR */}
      <header className={`sa-nav ${scrolled || menuOpen ? "is-scrolled" : ""}`}>
        <div className="sa-container sa-nav-inner">
          <BrandLogo />

          <nav className="sa-nav-links" aria-label="Main">
            {NAV_LINKS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={active === id ? "is-active" : ""}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="sa-nav-actions">
            <Link to="/login" className="sa-btn sa-btn-ghost">
              Login
            </Link>

            <Link to="/register" className="sa-btn sa-btn-primary">
              Register
            </Link>

            <button
              type="button"
              className="sa-menu-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="sa-mobile-menu">
            {NAV_LINKS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={active === id ? "is-active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}

            <div className="sa-mobile-actions">
              <Link to="/login" className="sa-btn sa-btn-ghost">
                Login
              </Link>

              <Link to="/register" className="sa-btn sa-btn-primary">
                Register
              </Link>
            </div>
          </div>
        )}
      </header>


      {/* HERO */}
      <section className="sa-hero" id="home">
        <div className="sa-container sa-hero-grid">

          <div className="sa-hero-copy">
            <span className="sa-pill">
              <i className="sa-pill-dot" />
              Smart society management
            </span>

            <h1>
              Manage your society
              <span className="sa-gradient-text">smarter and easier</span>
            </h1>

            <p className="sa-lead">
              A modern and secure platform to simplify apartment and society
              management. Handle residents, visitors, maintenance, payments and
              amenities, all in one place.
            </p>

            <div className="sa-hero-actions">
              <Link to="/register" className="sa-btn sa-btn-primary sa-btn-lg">
                Get started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <a href="#features" className="sa-btn sa-btn-ghost sa-btn-lg">
                Explore features
              </a>
            </div>

            <div className="sa-stats">
              <Stat icon={Users} target={500} suffix="+" label="Residents" />
              <Stat icon={Building2} target={50} suffix="+" label="Facilities" />
              <Stat icon={ShieldCheck} text="24/7" label="Security" />
            </div>
          </div>

          <div
            className="sa-hero-visual"
            ref={visualRef}
            onMouseMove={handleHeroMove}
            onMouseLeave={handleHeroLeave}
          >
            <div className="sa-hero-photo">
              <img
                src={courtyardPhoto}
                alt="Modern apartment buildings with a green courtyard"
              />
            </div>

            <div className="sa-hero-photo-2">
              <img
                src={livingRoomPhoto}
                alt="Bright living room inside an apartment"
              />
            </div>

            <div className="sa-float sa-float-1">
              <span className="sa-float-icon green">
                <ShieldCheck size={18} />
              </span>
              <div>
                <strong>Visitor approved</strong>
                <small>Courier - Gate 2</small>
              </div>
            </div>

            <div className="sa-float sa-float-2">
              <span className="sa-float-icon blue">
                <CreditCard size={18} />
              </span>
              <div>
                <strong>₹2,500 paid</strong>
                <small>Maintenance - Flat A 204</small>
              </div>
            </div>

            <div className="sa-float sa-float-3">
              <span className="sa-float-icon amber">
                <BellRing size={18} />
              </span>
              <div>
                <strong>New notice</strong>
                <small>Water tank cleaning</small>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* FEATURES */}
      <section className="sa-section" id="features">
        <div className="sa-container">

          <Reveal className="sa-section-head">
            <span className="sa-eyebrow">Our features</span>
            <h2>Everything you need, in one place</h2>
            <p>
              Simplify daily tasks and enjoy a better living experience with
              our smart features.
            </p>
          </Reveal>

          <div className="sa-feature-grid">
            {FEATURES.map(({ icon: Icon, tone, title, text }, index) => (
              <Reveal key={title} delay={(index % 3) * 90} className="sa-cell">
                <article
                  className={`sa-feature tone-${tone}`}
                  onMouseMove={FOLLOW_CURSOR}
                >
                  <span className="sa-feature-icon">
                    <Icon size={26} aria-hidden="true" />
                  </span>

                  <h3>{title}</h3>
                  <p>{text}</p>

                  <Link to="/register" className="sa-feature-link">
                    Get started
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>

        </div>
      </section>


      {/* ABOUT */}
      <section className="sa-section sa-about" id="about">
        <div className="sa-container sa-about-grid">

          <Reveal className="sa-about-visual">
            <div className="sa-about-photo">
              <img
                src={exteriorPhoto}
                alt="Apartment blocks with landscaped walkways"
              />
            </div>

            <DashboardMock />

            <div className="sa-about-badge">
              <span className="sa-about-badge-icon">
                <Users size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>A better community</strong>
                <p>Together we build a safer and happier society.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="sa-about-copy">
            <span className="sa-eyebrow">About us</span>

            <h2>
              Building smarter <span className="sa-gradient-text">communities</span>
            </h2>

            <p>
              Smart Apartment is designed to bring convenience, security and
              transparency to residential societies. Our platform helps
              residents, committees and management work together for a better
              living experience.
            </p>

            <ul className="sa-points">
              <li>
                <Check size={16} aria-hidden="true" /> Easy to use
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> Secure and reliable
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> 24/7 support
              </li>
            </ul>

            <a href="#contact" className="sa-btn sa-btn-primary sa-btn-lg">
              Learn more
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </Reveal>

        </div>
      </section>


      {/* FACILITIES */}
      <section className="sa-section" id="facilities">
        <div className="sa-container">

          <Reveal className="sa-section-head">
            <span className="sa-eyebrow">Society facilities</span>
            <h2>Everything your society offers</h2>
            <p>Book your favourite spaces in a few taps from your dashboard.</p>
          </Reveal>

          <div className="sa-facility-grid">
            {FACILITIES.map(({ icon: Icon, name, note, bg }, index) => (
              <Reveal key={name} delay={index * 90} className="sa-cell">
                <article className={`sa-facility bg-${bg}`}>
                  <span className="sa-facility-ghost" aria-hidden="true">
                    <Icon size={150} strokeWidth={1.2} />
                  </span>

                  <span className="sa-facility-icon">
                    <Icon size={26} aria-hidden="true" />
                  </span>

                  <h3>{name}</h3>
                  <p>{note}</p>

                  <Link to="/login" className="sa-facility-cta">
                    Book now
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>

        </div>
      </section>


      {/* CTA / CONTACT */}
      <section className="sa-section sa-cta-section" id="contact">
        <div className="sa-container">
          <Reveal className="sa-cta">
            <div className="sa-cta-copy">
              <span className="sa-eyebrow sa-eyebrow-light">
                Smarter living starts here
              </span>

              <h2>
                Make your society <span>smarter today.</span>
              </h2>

              <p>
                Manage your society, connect with residents and simplify
                everyday operations from one platform.
              </p>

              <div className="sa-cta-actions">
                <Link to="/register" className="sa-btn sa-btn-light sa-btn-lg">
                  Create your account
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>

                <Link to="/login" className="sa-btn sa-btn-outline-light sa-btn-lg">
                  I already have an account
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="sa-footer">
        <div className="sa-container sa-footer-grid">

          <div className="sa-footer-brand">
            <BrandLogo light />
            <p>Smart management for better community living.</p>
          </div>

          <div>
            <h4>Quick links</h4>
            {NAV_LINKS.map(({ id, label }) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>

          <div>
            <h4>Contact us</h4>
            <p>
              <Mail size={16} aria-hidden="true" /> support@smartapartment.com
            </p>
            <p>
              <Phone size={16} aria-hidden="true" /> +91 98765 43210
            </p>
          </div>

        </div>

        <div className="sa-container sa-footer-bottom">
          © 2026 Smart Apartment. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default Home;
