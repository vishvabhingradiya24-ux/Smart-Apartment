import { useRef } from "react";
import { BellRing, CreditCard, ShieldCheck } from "lucide-react";
import BrandLogo from "../BrandLogo";
import courtyardPhoto from "../../assets/community-courtyard.jpg";
import "../../css/brand.css";
import "../../css/auth.css";

// Shared split-screen layout: illustrated panel on the left,
// the page's form card on the right.
function AuthLayout({
  headline,
  description,
  perks = [],
  title,
  subtitle,
  badge,
  wide = false,
  children,
  footer
}) {
  const sceneRef = useRef(null);

  const handleMove = (event) => {
    const node = sceneRef.current;

    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    node.style.setProperty("--mx", x.toFixed(3));
    node.style.setProperty("--my", y.toFixed(3));
  };

  const handleLeave = () => {
    const node = sceneRef.current;

    if (!node) return;

    node.style.setProperty("--mx", "0");
    node.style.setProperty("--my", "0");
  };

  return (
    <div className="sa-brand au-page">
      <aside
        className="au-aside"
        ref={sceneRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="au-aside-photo" aria-hidden="true">
          <img src={courtyardPhoto} alt="" />
        </div>

        <div className="au-aside-top">
          <BrandLogo light />
        </div>

        <div className="au-aside-copy">
          <h2>{headline}</h2>
          <p>{description}</p>

          <ul className="au-perks">
            {perks.map(({ icon: Icon, title: perkTitle, text }) => (
              <li key={perkTitle} className="au-perk">
                <span className="au-perk-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>

                <span>
                  <strong>{perkTitle}</strong>
                  <small>{text}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="au-chip au-chip-1" aria-hidden="true">
          <ShieldCheck size={17} />
          <span>
            <strong>Visitor approved</strong>
            <small>Gate 2 - just now</small>
          </span>
        </div>

        <div className="au-chip au-chip-2" aria-hidden="true">
          <CreditCard size={17} />
          <span>
            <strong>₹2,500 paid</strong>
            <small>Maintenance</small>
          </span>
        </div>

        <div className="au-chip au-chip-3" aria-hidden="true">
          <BellRing size={17} />
          <span>
            <strong>New notice</strong>
            <small>Water tank cleaning</small>
          </span>
        </div>
      </aside>

      <main className="au-main">
        <div className={`au-card ${wide ? "au-card-wide" : ""}`}>
          <div className="au-card-brand">
            <BrandLogo />
          </div>

          <header className="au-head">
            {badge && <span className="au-badge">{badge}</span>}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </header>

          {children}

          {footer && <div className="au-footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
