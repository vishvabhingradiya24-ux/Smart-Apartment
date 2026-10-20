import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ClipboardCheck,
  CreditCard,
  Droplets,
  Dumbbell,
  Flower2,
  Home as HomeIcon,
  Mail,
  MapPin,
  Menu,
  PartyPopper,
  Phone,
  ShieldCheck,
  Sparkles,
  Trees,
  UserCheck,
  Users,
  Waves,
  Wrench,
  X,
  Zap
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import Reveal from "../components/Reveal";
import { useCountUp, useInView } from "../hooks/useInView";
import { timeAgo, usePublicOverview } from "../hooks/usePublicOverview";
import { STAFF_DEPARTMENTS } from "../constants/staffDepartments";
import heroPhoto from "../assets/public/hero-apartment.jpg";
import livingRoomPhoto from "../assets/public/hero-living-room.jpg";
import aboutPhoto from "../assets/public/about-community.jpg";
import poolPhoto from "../assets/public/facility-pool.jpg";
import gymPhoto from "../assets/public/facility-gym.jpg";
import hallPhoto from "../assets/public/facility-hall.jpg";
import gardenPhoto from "../assets/public/facility-garden.jpg";
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

// Facilities come from the database. This only picks a matching photo and
// icon from the facility's name; anything unrecognised gets a neutral photo.
const FACILITY_LOOKS = [
  { match: /pool|swim/i, icon: Waves, photo: poolPhoto },
  { match: /gym|fitness|yoga|sport/i, icon: Dumbbell, photo: gymPhoto },
  { match: /hall|club|party|event|banquet|community/i, icon: PartyPopper, photo: hallPhoto },
  { match: /garden|park|lawn|play|jogging|trail/i, icon: Trees, photo: gardenPhoto }
];

const facilityLook = (name) =>
  FACILITY_LOOKS.find((look) => look.match.test(name)) || {
    icon: Building2,
    photo: aboutPhoto
  };

const DEPARTMENT_LOOKS = {
  Maintenance: { icon: Wrench, tone: "amber" },
  Electrical: { icon: Zap, tone: "blue" },
  Plumbing: { icon: Droplets, tone: "teal" },
  Housekeeping: { icon: Sparkles, tone: "purple" },
  "Garden Maintenance": { icon: Flower2, tone: "green" },
  Security: { icon: ShieldCheck, tone: "rose" },
  "Facility Supervisor": { icon: ClipboardCheck, tone: "blue" }
};

const FOLLOW_CURSOR = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
};

// `value` is null while the data is loading (or unavailable), so a dash is
// shown instead of a made-up number.
function Stat({ icon: Icon, value, label }) {
  const { ref, inView } = useInView({ threshold: 0.6 });
  const counted = useCountUp(value ?? 0, inView && value !== null);

  return (
    <div className="sa-stat" ref={ref}>
      <span className="sa-stat-icon">
        <Icon size={20} aria-hidden="true" />
      </span>

      <div>
        <strong>{value === null ? "—" : counted}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

const RECENT_ICONS = {
  complaint: { icon: Wrench, tone: "amber" },
  request: { icon: Wrench, tone: "blue" },
  visitor: { icon: UserCheck, tone: "green" }
};

function DashboardMock({ data }) {
  const { ref, inView } = useInView({ threshold: 0.3 });

  const stats = data?.stats;
  const activity = data?.activity ?? [];
  const recent = data?.recent ?? [];
  const peak = Math.max(0, ...activity.map((day) => day.count));
  const shown = (value) => (stats ? value : "—");

  return (
    <div className={`sa-mock ${inView ? "is-visible" : ""}`} ref={ref}>
      <div className="sa-mock-bar">
        <i />
        <i />
        <i />
        <span>{data?.society?.name || "Society overview"}</span>
        {data && <em className="sa-mock-live">Live</em>}
      </div>

      <div className="sa-mock-stats">
        <div>
          <small>Open requests</small>
          <strong>{shown(stats?.openRequests)}</strong>
        </div>
        <div>
          <small>Complaints resolved</small>
          <strong>{shown(stats?.complaintsResolved)}</strong>
        </div>
        <div>
          <small>Visitors today</small>
          <strong>{shown(stats?.visitorsToday)}</strong>
        </div>
      </div>

      <div className="sa-mock-chart" role="img" aria-label="Society activity in the last 7 days">
        {(activity.length ? activity : Array.from({ length: 7 }, () => ({ count: 0 }))).map(
          (day, index) => (
            <span
              key={index}
              className={peak === 0 ? "is-empty" : ""}
              style={{
                "--h": `${peak === 0 ? 6 : Math.max(8, (day.count / peak) * 100)}%`,
                "--d": `${index * 90}ms`
              }}
              title={day.label ? `${day.label}: ${day.count}` : undefined}
            />
          )
        )}
      </div>

      <div className="sa-mock-days" aria-hidden="true">
        {(activity.length ? activity : []).map((day) => (
          <span key={day.date}>{day.label}</span>
        ))}
      </div>

      <p className="sa-mock-caption">
        {peak === 0 && stats
          ? "No activity recorded in the last 7 days yet."
          : "Visitors, complaints and requests in the last 7 days"}
      </p>

      {recent.length > 0 && (
        <ul className="sa-mock-list">
          {recent.map((item, index) => {
            const { icon: Icon, tone } = RECENT_ICONS[item.type] || RECENT_ICONS.request;

            return (
              <li key={index}>
                <span className={`sa-mock-dot ${tone}`}>
                  <Icon size={14} />
                </span>
                {item.text}
                <small>{timeAgo(item.at)}</small>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Home() {
  const visualRef = useRef(null);
  const { data, loading, error } = usePublicOverview();

  const society = data?.society ?? null;
  const stats = data?.stats ?? null;
  const facilities = data?.facilities ?? [];
  const departmentCounts = new Map(
    (data?.departments ?? []).map((item) => [item.name, item.staff])
  );

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
              {society?.name
                ? `${society.name}${society.address ? ` - ${society.address}` : ""}`
                : "Smart society management"}
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
              <Stat icon={Users} value={stats ? stats.residents : null} label="Residents" />
              <Stat icon={ShieldCheck} value={stats ? stats.staff : null} label="Staff members" />
              {society?.totalFlats ? (
                <Stat icon={Building2} value={society.totalFlats} label="Flats" />
              ) : (
                <Stat icon={Building2} value={stats ? stats.facilities : null} label="Facilities" />
              )}
            </div>

            {error && (
              <p className="sa-live-note">
                Live society data is unavailable right now. Please check that
                the server is running and refresh the page.
              </p>
            )}
          </div>

          <div
            className="sa-hero-visual"
            ref={visualRef}
            onMouseMove={handleHeroMove}
            onMouseLeave={handleHeroLeave}
          >
            <div className="sa-hero-photo">
              <img
                src={heroPhoto}
                alt="Modern apartment building with balconies and palm trees"
              />
            </div>

            <div className="sa-hero-photo-2">
              <img
                src={livingRoomPhoto}
                alt="Bright living room inside an apartment"
              />
            </div>

            {society && (
              <div className="sa-float sa-float-1">
                <span className="sa-float-icon green">
                  <MapPin size={18} />
                </span>
                <div>
                  <strong>{society.name}</strong>
                  {society.address && <small>{society.address}</small>}
                </div>
              </div>
            )}

            {stats && (
              <div className="sa-float sa-float-2">
                <span className="sa-float-icon blue">
                  <Users size={18} />
                </span>
                <div>
                  <strong>
                    {stats.residents} {stats.residents === 1 ? "resident" : "residents"}
                  </strong>
                  <small>Registered members</small>
                </div>
              </div>
            )}

            {society?.totalFlats > 0 && (
              <div className="sa-float sa-float-3">
                <span className="sa-float-icon amber">
                  <HomeIcon size={18} />
                </span>
                <div>
                  <strong>{society.totalFlats} flats</strong>
                  <small>
                    {society.totalBlocks > 0
                      ? `${society.totalBlocks} ${society.totalBlocks === 1 ? "block" : "blocks"}`
                      : "Society size"}
                  </small>
                </div>
              </div>
            )}
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


      {/* SERVICE TEAMS (staff departments, counts from the database) */}
      <section className="sa-section sa-services" id="services">
        <div className="sa-container">

          <Reveal className="sa-section-head">
            <span className="sa-eyebrow">Service teams</span>
            <h2>People who keep your society running</h2>
            <p>
              Dedicated teams for every kind of request, from a leaking tap to
              a tripped fuse.
            </p>
          </Reveal>

          <div className="sa-feature-grid">
            {STAFF_DEPARTMENTS.map((name, index) => {
              const { icon: Icon, tone } = DEPARTMENT_LOOKS[name];
              const count = departmentCounts.has(name) ? departmentCounts.get(name) : null;

              return (
                <Reveal key={name} delay={(index % 3) * 90} className="sa-cell">
                  <article
                    className={`sa-feature sa-service tone-${tone}`}
                    onMouseMove={FOLLOW_CURSOR}
                  >
                    <span className="sa-feature-icon">
                      <Icon size={26} aria-hidden="true" />
                    </span>

                    <h3>{name}</h3>

                    <p className="sa-service-count">
                      {count === null
                        ? "—"
                        : count === 0
                          ? "Team being set up"
                          : `${count} ${count === 1 ? "staff member" : "staff members"}`}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>


      {/* ABOUT */}
      <section className="sa-section sa-about" id="about">
        <div className="sa-container sa-about-grid">

          <Reveal className="sa-about-visual">
            <div className="sa-about-photo">
              <img
                src={aboutPhoto}
                alt="Apartment buildings with a landscaped garden"
              />
            </div>

            <DashboardMock data={data} />

            {society && (
              <div className="sa-about-badge">
                <span className="sa-about-badge-icon">
                  <Users size={20} aria-hidden="true" />
                </span>
                <div>
                  <strong>{society.name}</strong>
                  <p>
                    {society.totalFlats > 0
                      ? `${society.totalFlats} flats${society.totalBlocks > 0 ? ` in ${society.totalBlocks} blocks` : ""}`
                      : society.address}
                  </p>
                </div>
              </div>
            )}
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

          {loading && (
            <div className="sa-facility-grid" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="sa-skeleton" />
              ))}
            </div>
          )}

          {!loading && facilities.length === 0 && (
            <Reveal className="sa-empty">
              <span className="sa-empty-icon">
                <Building2 size={26} aria-hidden="true" />
              </span>
              <h3>
                {error ? "Facilities are unavailable right now" : "No facilities added yet"}
              </h3>
              <p>
                {error
                  ? "We could not reach the server. Please try again in a moment."
                  : "Swimming pool, gym, hall and more will appear here as soon as your society adds them."}
              </p>
            </Reveal>
          )}

          {facilities.length > 0 && (
            <div className="sa-facility-grid">
              {facilities.map((facility, index) => {
                const { icon: Icon, photo } = facilityLook(facility.name);

                return (
                  <Reveal key={facility.id} delay={(index % 4) * 90} className="sa-cell">
                    <article className="sa-facility">
                      <img
                        className="sa-facility-photo"
                        src={photo}
                        alt={`${facility.name} at the society`}
                      />

                      <span
                        className={`sa-facility-status ${facility.available ? "is-open" : "is-closed"}`}
                      >
                        {facility.available ? "Available" : "Unavailable"}
                      </span>

                      <span className="sa-facility-icon">
                        <Icon size={26} aria-hidden="true" />
                      </span>

                      <h3>{facility.name}</h3>
                      <p>
                        {facility.description ||
                          facility.location ||
                          "Open to all residents"}
                      </p>

                      {facility.available && (
                        <Link to="/login" className="sa-facility-cta">
                          Book now
                          <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}

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
            {society?.contactEmail && (
              <p>
                <Mail size={16} aria-hidden="true" /> {society.contactEmail}
              </p>
            )}
            {society?.contactPhone && (
              <p>
                <Phone size={16} aria-hidden="true" /> {society.contactPhone}
              </p>
            )}
            {society?.address && (
              <p>
                <MapPin size={16} aria-hidden="true" /> {society.address}
              </p>
            )}
            {!society?.contactEmail && !society?.contactPhone && !society?.address && (
              <p>Log in to reach your society admin.</p>
            )}
          </div>

        </div>

        <div className="sa-container sa-footer-bottom">
          © {new Date().getFullYear()} {society?.name || "Smart Apartment"}. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default Home;
