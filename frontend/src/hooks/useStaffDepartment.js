import { useEffect, useState } from "react";

const readStoredDepartment = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}")?.department || "";
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
    const token = sessionStorage.getItem("token");

    if (!token) return undefined;

    const controller = new AbortController();

    fetch("http://localhost:5000/api/staff/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const fresh = data?.staff?.department;

        if (fresh === undefined) return;

        setDepartment(fresh || "");

        try {
          const user = JSON.parse(sessionStorage.getItem("user") || "{}");

          sessionStorage.setItem("user", JSON.stringify({ ...user, department: fresh }));
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
