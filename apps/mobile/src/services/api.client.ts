const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:3000";
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

function authHeaders() {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}
