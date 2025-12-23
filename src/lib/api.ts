// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const BACKEND_URL = "http://localhost:3000";

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // Session/cookie gönderimi için
  });

  // 401/403 ise, login'e yönlendir
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request unsuccessful: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body: any) => apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: any) => apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: any) => apiRequest<T>(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined }),
};