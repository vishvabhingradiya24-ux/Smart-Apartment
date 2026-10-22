import { useEffect, useState } from "react";

const readStoredDepartment = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.department ?? user?.staff_type ?? user?.staffType ?? "";
  } catch {
    return "";
  }
};

// The staff member's type. It starts from the saved login and is then
// refreshed from the server, so a change made by the admin shows up
// without having to log in again.
export function useStaffDepartment() {
  const [department, setDepartment] = useState(readStoredDepartment);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return undefined;

    const controller = new AbortController();

    fetch("http://localhost:5000/api/staff/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const fresh =
          data?.staff?.department ??
          data?.staff?.staff_type ??
          data?.staff?.staffType;

        if (fresh === undefined) return;

        setDepartment(fresh || "");

        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");

          localStorage.setItem("user", JSON.stringify({ ...user, department: fresh }));
        } catch {
          // The menu still works if the saved login cannot be updated.
        }
      })
      .catch(() => {
        // Offline or server error: keep the type from the saved login.
      });

    return () => controller.abort();
  }, []);

  return department;
}
