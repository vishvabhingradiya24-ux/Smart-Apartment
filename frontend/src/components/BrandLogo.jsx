import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import "../css/brand.css";

function BrandLogo({ light = false, to = "/" }) {
  return (
    <Link
      to={to}
      className={`sa-logo ${light ? "sa-logo-light" : ""}`}
      aria-label="Smart Apartment home"
    >
      <span className="sa-logo-mark">
        <Building2 size={21} strokeWidth={2.2} aria-hidden="true" />
      </span>

      <span className="sa-logo-text">
        <strong>Smart Apartment</strong>
        <span>Smart living. Better community.</span>
      </span>
    </Link>
  );
}

export default BrandLogo;
