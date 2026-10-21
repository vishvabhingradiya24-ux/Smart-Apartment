import { useCallback, useEffect, useState } from "react";

const BASE = "http://localhost:5000/api/staff";

// Calls the staff API with the saved login token. Returns the parsed JSON
// or throws an Error carrying the server's message.
export async function staffApi(path, { method = "GET", body } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }

  return data;
}

// Loads `path` and reloads when `path` changes or `reload()` is called.
// The previous data stays visible while a new filter is loading.
export function useStaffApi(path) {
  const [state, setState] = useState({ data: null, error: "", loaded: false });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    staffApi(path)
      .then((data) => {
        if (!cancelled) setState({ data, error: "", loaded: true });
      })
      .catch((error) => {
        if (!cancelled) {
          setState((previous) => ({
            data: previous.data,
            error: error.message,
            loaded: true
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data: state.data, error: state.error, loading: !state.loaded, reload };
}

// Downloads rows (an array of arrays, first row = headings) as a CSV file.
export function downloadCsv(filename, rows) {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const text = rows.map((row) => row.map(escape).join(",")).join("\r\n");

  const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
