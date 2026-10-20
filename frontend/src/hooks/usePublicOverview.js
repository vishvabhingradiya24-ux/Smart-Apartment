import { useEffect, useState } from "react";

const OVERVIEW_URL = "http://localhost:5000/api/public/overview";

// Loads the public, aggregate society data shown on the Home page.
// While loading, or if the server is unreachable, `data` stays null so the
// page can show placeholders instead of made-up numbers.
export function usePublicOverview() {
  const [state, setState] = useState({ data: null, loading: true, error: false });

  useEffect(() => {
    const controller = new AbortController();

    fetch(OVERVIEW_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Overview request failed");

        return response.json();
      })
      .then((data) => setState({ data, loading: false, error: false }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({ data: null, loading: false, error: true });
        }
      });

    return () => controller.abort();
  }, []);

  return state;
}

// "5m ago", "3h ago", "2d ago"
export function timeAgo(isoDate) {
  const seconds = Math.max(0, (Date.now() - new Date(isoDate).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
}
