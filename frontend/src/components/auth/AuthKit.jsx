import { useId, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";

/* -----------------------------------------------------
   Text / password input with icon, live error and a
   green "valid" state. Labels are linked to the input.
----------------------------------------------------- */
export function AuthField({
  label,
  icon: Icon,
  error = "",
  valid = false,
  hint = "",
  type = "text",
  className = "",
  ...inputProps
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;
  const stateClass = error ? "is-invalid" : valid ? "is-valid" : "";

  return (
    <div className={`au-field ${className}`}>
      {label && (
        <label className="au-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div className={`au-input ${stateClass}`}>
        {Icon && <Icon className="au-input-icon" size={18} aria-hidden="true" />}

        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          {...inputProps}
        />

        {isPassword ? (
          <button
            type="button"
            className="au-input-action"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        ) : (
          valid && (
            <CheckCircle2
              className="au-input-ok"
              size={18}
              aria-hidden="true"
            />
          )
        )}
      </div>

      {error ? (
        <p className="au-msg au-msg-error" id={`${id}-msg`} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p className="au-msg au-msg-hint" id={`${id}-msg`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/* -----------------------------------------------------
   Select box with the same look as AuthField.
----------------------------------------------------- */
export function AuthSelect({
  label,
  icon: Icon,
  children,
  className = "",
  ...selectProps
}) {
  const id = useId();

  return (
    <div className={`au-field ${className}`}>
      {label && (
        <label className="au-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div className="au-input au-select">
        {Icon && <Icon className="au-input-icon" size={18} aria-hidden="true" />}

        <select id={id} {...selectProps}>
          {children}
        </select>
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   Segmented control with a sliding highlight
   (used for "Login as" / "Register as").
----------------------------------------------------- */
export function RoleTabs({ label, value, options, onChange }) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  return (
    <div className="au-field">
      {label && <span className="au-label">{label}</span>}

      <div
        className="au-tabs"
        role="radiogroup"
        aria-label={label}
        style={{ "--i": activeIndex, "--n": options.length }}
      >
        <span className="au-tabs-thumb" aria-hidden="true" />

        {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={value === optionValue}
            className={`au-tab ${value === optionValue ? "is-active" : ""}`}
            onClick={() => onChange(optionValue)}
          >
            {Icon && <Icon size={17} aria-hidden="true" />}
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   Primary submit button with a loading spinner.
----------------------------------------------------- */
export function AuthButton({ loading = false, children, ...buttonProps }) {
  return (
    <button
      type="submit"
      className="au-btn"
      disabled={loading}
      {...buttonProps}
    >
      {loading && <span className="au-spinner" aria-hidden="true" />}
      <span>{children}</span>
      {!loading && <ArrowRight size={18} aria-hidden="true" />}
    </button>
  );
}

/* -----------------------------------------------------
   Error / success banner shown above the submit button.
----------------------------------------------------- */
export function AuthAlert({ type = "error", children }) {
  if (!children) return null;

  const Icon = type === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`au-alert au-alert-${type}`}
      role={type === "error" ? "alert" : "status"}
      key={String(children)}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/* -----------------------------------------------------
   Password strength meter (4 segments + label).
----------------------------------------------------- */
export function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const level = password.length < 6 ? 0 : Math.max(score, 1);

  return (
    <div className={`au-strength level-${level}`} aria-live="polite">
      <div className="au-strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span key={segment} className={segment <= level ? "is-on" : ""} />
        ))}
      </div>

      <span className="au-strength-label">{labels[level]}</span>
    </div>
  );
}

/* -----------------------------------------------------
   One-time-code input: six boxes with auto-advance,
   backspace navigation and paste support.
----------------------------------------------------- */
export function OtpInput({ value, onChange, invalid = false, length = 6 }) {
  const refs = useRef([]);

  const focusAt = (index) => {
    const target = refs.current[Math.max(0, Math.min(length - 1, index))];

    if (target) target.focus();
  };

  const handleChange = (index, event) => {
    const typed = event.target.value.replace(/\D/g, "");

    if (!typed) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    const next = (value.slice(0, index) + typed + value.slice(index + 1)).slice(
      0,
      length
    );

    onChange(next);
    focusAt(index + typed.length);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      event.preventDefault();
      onChange(value.slice(0, index - 1) + value.slice(index));
      focusAt(index - 1);
    }

    if (event.key === "ArrowLeft") focusAt(index - 1);
    if (event.key === "ArrowRight") focusAt(index + 1);
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);
    focusAt(pasted.length);
  };

  return (
    <div
      className={`au-otp ${invalid ? "is-invalid" : ""}`}
      role="group"
      aria-label="One-time password"
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={value[index] || ""}
          className={value[index] ? "is-filled" : ""}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
