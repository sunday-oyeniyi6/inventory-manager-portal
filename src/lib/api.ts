/**
 * Centralized API client for the Inventory Manager backend.
 * 
 * Uses fetch() with automatic JWT injection.
 * Designed for easy future migration to @tanstack/react-query.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Get the stored auth token from sessionStorage.
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("kc_token");
}

/**
 * Generic fetch wrapper with JWT injection and error handling.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle 401/403 — redirect to login
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("kc_token");
      sessionStorage.removeItem("kc_realm");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  // Handle 204 No Content (for DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || JSON.stringify(error) || `API Error: ${response.status}`
    );
  }

  return response.json();
}

// =============================================
// Convenience methods
// =============================================

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: "DELETE" }),
};

/**
 * Public API fetch (no auth required).
 * Used for tenant resolution on the login page.
 */
export async function publicApiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
