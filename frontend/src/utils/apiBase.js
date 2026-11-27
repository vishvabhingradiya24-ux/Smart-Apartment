const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();

// Keep local development convenient while allowing deployed builds to point at
// their API with VITE_API_BASE_URL (for example https://api.example.com).
export const API_BASE_URL = (configuredBase || "http://localhost:5000").replace(/\/$/, "");
