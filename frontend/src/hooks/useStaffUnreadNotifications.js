import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../utils/apiBase.js";

function useStaffUnreadNotifications(enabled = true) {
  const [unread, setUnread] = useState(0);
  const updateVersion = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const token = sessionStorage.getItem("token");
    if (!token) return undefined;

    let cancelled = false;

    const load = () => {
      const requestVersion = updateVersion.current;
      fetch(API_BASE_URL + "/api/staff/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!cancelled && data && requestVersion === updateVersion.current) {
            setUnread(Number(data.unread) || 0);
          }
        })
        .catch(() => {
          // The badge is optional; ignore network errors.
        });
    };

    const handleNotificationChange = (event) => {
      updateVersion.current += 1;
      const unreadCount = Number(event.detail?.unreadCount);
      if (Number.isFinite(unreadCount)) {
        setUnread(Math.max(0, unreadCount));
        return;
      }

      const unreadDelta = Number(event.detail?.unreadDelta);
      if (Number.isFinite(unreadDelta)) {
        setUnread((current) => Math.max(0, current + unreadDelta));
        return;
      }

      load();
    };

    load();
    const timer = setInterval(load, 60000);
    window.addEventListener("staff-notifications-changed", handleNotificationChange);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("staff-notifications-changed", handleNotificationChange);
    };
  }, [enabled]);

  return unread;
}

export default useStaffUnreadNotifications;
