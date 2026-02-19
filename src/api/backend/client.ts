/**
 * Generic fetch wrapper that talks to our FastAPI backend.
 *
 * In dev the Vite proxy rewrites `/api/…` → `http://localhost:8000/api/…`
 * so we can simply `fetch("/api/…")`.
 *
 * In production we fall back to VITE_API_BASE_URL if it's set, otherwise "/api".
 */
import { debugLog } from "../fpl/debug";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function backendFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // In dev with the Vite proxy we can use a relative path.
  // In production builds (or if the env var is set) we prepend the base URL.
  const url = `${API_BASE}${path}`;
  debugLog("[BACKEND] GET", url);

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    debugLog("[BACKEND] ERROR", res.status, text);
    throw new Error(`Backend request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as T;
  debugLog("[BACKEND] OK", url, data);
  return data;
}

