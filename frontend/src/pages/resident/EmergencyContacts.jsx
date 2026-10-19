import {
  Ambulance,
  Flame,
  HeartHandshake,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";
import "../../css/resident/resident_dashboard.css";

const contacts = [
  {
    name: "Emergency Response",
    number: "112",
    description: "Police, fire and medical emergency response",
    icon: ShieldAlert,
    tone: "urgent",
  },
  {
    name: "Ambulance",
    number: "108",
    description: "Emergency ambulance service",
    icon: Ambulance,
    tone: "medical",
  },
  {
    name: "Fire & Rescue",
    number: "101",
    description: "Fire and rescue services",
    icon: Flame,
    tone: "fire",
  },
  {
    name: "Women Helpline",
    number: "181",
    description: "Support for women in distress",
    icon: HeartHandshake,
    tone: "support",
  },
];

function EmergencyContacts() {
  return (
    <section className="resident-emergency-page">
      <header className="resident-emergency-header">
        <div>
          <span className="resident-emergency-eyebrow">RESIDENT SERVICES</span>
          <h1>Emergency Contacts</h1>
          <p>Emergency numbers available across India.</p>
        </div>
      </header>

      <div className="resident-emergency-grid">
        {contacts.map(({ name, number, description, icon: Icon, tone }) => (
          <article className="resident-emergency-card" key={number}>
            <div className={`resident-emergency-icon ${tone}`}>
              <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
            </div>
            <div className="resident-emergency-copy">
              <h2>{name}</h2>
              <p>{description}</p>
            </div>
            <a className="resident-emergency-call" href={`tel:${number}`} aria-label={`Call ${name}, ${number}`}>
              <PhoneCall size={17} aria-hidden="true" />
              <span>{number}</span>
            </a>
          </article>
        ))}
      </div>

      <p className="resident-emergency-note">For immediate danger, call 112.</p>
    </section>
  );
}

export default EmergencyContacts;
