import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  HardHat,
  Lock,
  Mail,
  ShieldCheck,
  UserCog,
  Users
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AuthAlert,
  AuthButton,
  AuthField,
  RoleTabs
} from "../../components/auth/AuthKit";
import { getEmailError } from "../../utils/validation";
import { saveSessionToken } from "../../utils/authFetch";

const ROLES = [
  { value: "resident", label: "Resident", icon: Users },
  { value: "staff", label: "Staff", icon: HardHat },
  { value: "admin", label: "Admin", icon: UserCog }
];

const PERKS = [
  {
    icon: Users,
    title: "Easy society management",
    text: "Residents, staff and records in one place"
  },
  {
    icon: ShieldCheck,
    title: "Secure visitor management",
    text: "Know who is at your gate, always"
  },
  {
    icon: CreditCard,
    title: "Maintenance and payments",
    text: "Track dues and pay online in a few taps"
  }
];

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_type: "resident",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({});

  const fieldErrors = {
    email: getEmailError(formData.email),
    password: formData.password ? "" : "Password is required"
  };

  const fieldError = (name) =>
    touched[name] && fieldErrors[name] ? fieldErrors[name] : "";

  const isValid = (name) => touched[name] && !fieldErrors[name];

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    setTouched({ email: true, password: true });

    if (fieldErrors.email || fieldErrors.password) {
      setError("Please fix the highlighted fields.");
      return;
    }

    if (!formData.user_type || !formData.email || !formData.password) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      let loginURL = "";
      let requestBody = {};

      if (formData.user_type === "resident") {
        loginURL = "http://localhost:5000/api/resident/login";

        requestBody = {
          email: formData.email,
          password: formData.password
        };
      }

      if (formData.user_type === "staff") {
        loginURL = "http://localhost:5000/api/staff/login";

        requestBody = {
          email: formData.email,
          password: formData.password
        };
      }

      if (formData.user_type === "admin") {
        loginURL = "http://localhost:5000/api/admin/login";

        requestBody = {
          email: formData.email,
          password: formData.password
        };
      }

      const response = await fetch(loginURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      saveSessionToken(formData.user_type, data.token);

      if (formData.user_type === "resident") {
        const residentUser = {
          ...data.user,
          user_type: "Resident"
        };

        localStorage.setItem(
          "user",
          JSON.stringify(residentUser)
        );

        setMessage("Resident login successful!");

        setTimeout(() => {
          navigate("/resident");
        }, 1000);

        return;
      }

      if (formData.user_type === "staff") {
        const staffUser = {
          ...data.staff,
          user_type: "Staff"
        };

        localStorage.setItem(
          "user",
          JSON.stringify(staffUser)
        );

        setMessage("Staff login successful!");

        setTimeout(() => {
          navigate("/staff");
        }, 1000);

        return;
      }

      if (formData.user_type === "admin") {
        const adminUser = {
          ...data.admin,
          user_type: "Admin"
        };

        localStorage.setItem(
          "user",
          JSON.stringify(adminUser)
        );

        setMessage("Admin login successful!");

        setTimeout(() => {
          navigate("/admin");
        }, 1000);

        return;
      }

    } catch (error) {
      console.error("Login Error:", error);

      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      headline={
        <>
          Welcome back to <span>your community</span>
        </>
      }
      description="A smart and secure platform to manage your society, residents, visitors, maintenance and amenities in one place."
      perks={PERKS}
      title="Welcome back"
      subtitle="Log in to continue to your Smart Apartment account."
      footer={
        <>
          Don&apos;t have an account?
          <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleLogin} noValidate>
        <RoleTabs
          label="Login as"
          value={formData.user_type}
          options={ROLES}
          onChange={(userType) =>
            setFormData((prev) => ({ ...prev, user_type: userType }))
          }
        />

        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("email")}
          valid={isValid("email")}
        />

        <AuthField
          label="Password"
          icon={Lock}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("password")}
        />

        <div className="au-row-end">
          <Link to="/forgot-password" className="au-link">
            Forgot password?
          </Link>
        </div>

        <AuthAlert type="error">{error}</AuthAlert>
        <AuthAlert type="success">{message}</AuthAlert>

        <AuthButton loading={loading}>
          {loading ? "Logging in..." : "Log in"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default Login;
