import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  Check,
  CreditCard,
  HardHat,
  Home,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AuthAlert,
  AuthButton,
  AuthField,
  AuthSelect,
  PasswordStrength,
  RoleTabs
} from "../../components/auth/AuthKit";
import { STAFF_DEPARTMENTS } from "../../constants/staffDepartments";
import { getEmailError, getPhoneError } from "../../utils/validation";

const WING_OPTIONS = ["A", "B", "C", "D"];
const FLAT_NUMBER_OPTIONS = Array.from({ length: 5 }, (_, floorIndex) =>
  [1, 2, 3, 4].map((unit) => String((floorIndex + 1) * 100 + unit))
).flat();

const ROLES = [
  { value: "Resident", label: "Resident", icon: Users },
  { value: "Staff", label: "Staff", icon: HardHat }
];

const PERKS = [
  {
    icon: CreditCard,
    title: "Easy maintenance and payments",
    text: "Pay society dues online, anytime"
  },
  {
    icon: ShieldCheck,
    title: "Quick visitor management",
    text: "Approve visitors right from your phone"
  },
  {
    icon: CalendarDays,
    title: "Amenity booking",
    text: "Reserve the hall, gym or pool in seconds"
  }
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_type: "Resident",
    department: "",
    block_wing: "",
    flat_number: "",
    ownership_type: "",
    password: "",
    confirm_password: "",
    terms: false
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({});

  const getFieldErrors = (values) => ({
    first_name: values.first_name.trim() ? "" : "First name is required",
    last_name: values.last_name.trim() ? "" : "Last name is required",
    email: getEmailError(values.email),
    phone: getPhoneError(values.phone),
    password: !values.password
      ? "Password is required"
      : values.password.length < 6
        ? "Password must be at least 6 characters"
        : "",
    confirm_password: !values.confirm_password
      ? "Please confirm your password"
      : values.confirm_password !== values.password
        ? "Passwords do not match"
        : ""
  });

  const fieldErrors = getFieldErrors(formData);

  const fieldError = (name) =>
    touched[name] && fieldErrors[name] ? fieldErrors[name] : "";

  const isValid = (name) => touched[name] && !fieldErrors[name];

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    let { value } = e.target;

    // Phone accepts digits only and stops after 10 digits.
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleUserTypeChange = (userType) => {
    setFormData((prev) => ({
      ...prev,
      user_type: userType,
      department: "",
      block_wing: "",
      flat_number: "",
      ownership_type: ""
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

    const department = String(
      formValues.get("department") || ""
    ).trim();

    const block_wing = String(
      formValues.get("block_wing") || ""
    ).trim();

    const flat_number = String(
      formValues.get("flat_number") || ""
    ).trim();

    const ownership_type = String(
      formValues.get("ownership_type") || ""
    ).trim();

    const password = String(
      formValues.get("password") || ""
    );

    const confirm_password = String(
      formValues.get("confirm_password") || ""
    );

    const terms = form.elements.terms.checked;

    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      password: true,
      confirm_password: true
    });

    const submitErrors = getFieldErrors({
      first_name,
      last_name,
      email,
      phone,
      password,
      confirm_password
    });

    if (Object.values(submitErrors).some(Boolean)) {
      setError("Please fix the highlighted fields.");
      return;
    }

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
      if (!block_wing || !flat_number || !ownership_type) {
        setError("Please fill Block/Wing, Flat Number, and Owner/Rent status.");
        return;
      }
    }

    if (user_type === "Staff" && !STAFF_DEPARTMENTS.includes(department)) {
      setError("Please select a valid staff department.");
      return;
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
            ownership_type,
            password
          }
        : {
            first_name,
            last_name,
            email,
            phone,
            user_type,
            department,
            password
          };

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
    <AuthLayout
      wide
      headline={
        <>
          Join your society, <span>live smarter</span>
        </>
      }
      description="Create your account to pay dues, approve visitors, raise requests and book amenities, all from one friendly dashboard."
      perks={PERKS}
      title="Create your account"
      subtitle="It only takes a minute. Fill in your details to get started."
      footer={
        <>
          Already have an account?
          <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <input type="hidden" name="user_type" value={formData.user_type} />

        <RoleTabs
          label="I am registering as"
          value={formData.user_type}
          options={ROLES}
          onChange={handleUserTypeChange}
        />

        <div className="au-section-title">Your details</div>

        <div className="au-row">
          <AuthField
            label="First name"
            icon={User}
            name="first_name"
            autoComplete="given-name"
            placeholder="First name"
            value={formData.first_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError("first_name")}
            valid={isValid("first_name")}
          />

          <AuthField
            label="Last name"
            icon={User}
            name="last_name"
            autoComplete="family-name"
            placeholder="Last name"
            value={formData.last_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError("last_name")}
            valid={isValid("last_name")}
          />
        </div>

        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@example.com"
          hint="Lowercase letters only, no capital letters"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("email")}
          valid={isValid("email")}
        />

        <AuthField
          label="Phone number"
          icon={Phone}
          type="tel"
          name="phone"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          placeholder="10 digit mobile number"
          hint="Numbers only, exactly 10 digits"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("phone")}
          valid={isValid("phone")}
        />

        {formData.user_type === "Resident" && (
          <div className="au-slide">
            <div className="au-section-title">Flat details</div>

            <div className="au-row">
              <AuthSelect
                label="Block / Wing"
                icon={Home}
                name="block_wing"
                value={formData.block_wing}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select wing
                </option>

                {WING_OPTIONS.map((wing) => (
                  <option key={wing} value={wing}>
                    {wing} Wing
                  </option>
                ))}
              </AuthSelect>

              <AuthSelect
                label="Flat number"
                icon={KeyRound}
                name="flat_number"
                value={formData.flat_number}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select flat
                </option>

                {FLAT_NUMBER_OPTIONS.map((flatNumber) => (
                  <option key={flatNumber} value={flatNumber}>
                    {flatNumber}
                  </option>
                ))}
              </AuthSelect>
            </div>

            <AuthSelect
              label="Flat ownership"
              icon={Home}
              name="ownership_type"
              value={formData.ownership_type}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select owner or rent
              </option>
              <option value="Owner">Owner</option>
              <option value="Rent">Rent</option>
            </AuthSelect>
          </div>
        )}

        {formData.user_type === "Staff" && (
          <div className="au-slide">
            <div className="au-section-title">Work details</div>

            <AuthSelect
              label="Staff type / Department"
              icon={Briefcase}
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select staff type / department
              </option>

              {STAFF_DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </AuthSelect>
          </div>
        )}

        <div className="au-section-title">Security</div>

        <div className="au-row">
          <div>
            <AuthField
              label="Password"
              icon={Lock}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={fieldError("password")}
            />

            <PasswordStrength password={formData.password} />
          </div>

          <AuthField
            label="Confirm password"
            icon={Lock}
            type="password"
            name="confirm_password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={formData.confirm_password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError("confirm_password")}
          />
        </div>

        <label className="au-check">
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
          />

          <span className="au-check-box">
            <Check size={14} strokeWidth={3} aria-hidden="true" />
          </span>

          <span>I agree to the Terms &amp; Conditions and Privacy Policy</span>
        </label>

        <AuthAlert type="error">{error}</AuthAlert>
        <AuthAlert type="success">{message}</AuthAlert>

        <AuthButton loading={loading}>
          {loading ? "Creating account..." : "Create account"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default Register;
