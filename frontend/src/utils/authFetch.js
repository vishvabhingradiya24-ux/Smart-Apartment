// Keeps the Admin, Staff and Resident sessions apart.
//
// Every role used to save its login token under the same "token" key, so
// logging in as another role in a second tab replaced the first tab's token
// and the first tab then got 403 / 401 errors. Now each role has its own key
// and every API call automatically sends the token of the role whose
// section (/admin, /staff, /resident) the page belongs to.

const API_BASE = "http://localhost:5000/api";

const ROLE_TOKEN_KEYS = {
  admin: "adminToken",
  staff: "staffToken",
  resident: "residentToken",
};

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  },
};

export const roleFromPath = (path) => {
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/staff")) return "staff";
  if (path.startsWith("/resident")) return "resident";
  return null;
};

const roleFromApiUrl = (url) => {
  const path = url.slice(API_BASE.length);
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/staff")) return "staff";
  if (path.startsWith("/resident")) return "resident";
  return null;
};

export const saveSessionToken = (role, token) => {
  try {
    localStorage.setItem(ROLE_TOKEN_KEYS[role], token);
    // Kept for older code that still reads the shared key.
    localStorage.setItem("token", token);
  } catch {
    /* storage unavailable */
  }
};

export const clearSession = (role) => {
  if (role && ROLE_TOKEN_KEYS[role]) safeStorage.remove(ROLE_TOKEN_KEYS[role]);
  safeStorage.remove("token");
  safeStorage.remove("user");
  safeStorage.remove("staff");
};

export const installAuthFetch = () => {
  if (window.__authFetchInstalled) return;
  window.__authFetchInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";

    if (!url.startsWith(API_BASE)) return nativeFetch(input, init);

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    const hadAuth = headers.has("Authorization");
    const role = roleFromPath(window.location.pathname) || roleFromApiUrl(url);

    if (hadAuth && role) {
      const roleToken = safeStorage.get(ROLE_TOKEN_KEYS[role]);
      if (roleToken) headers.set("Authorization", `Bearer ${roleToken}`);
    }

    const response = await nativeFetch(input, { ...init, headers });

    // Expired / missing token: end that role's session and go to login.
    if (hadAuth && response.status === 401 && role && window.location.pathname !== "/login") {
      clearSession(role);
      window.location.assign("/login");
    }

    return response;
  };
};
