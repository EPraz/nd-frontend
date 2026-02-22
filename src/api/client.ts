import { clearToken, getToken } from "@/src/helpers/tokenStore";
import { authEvents } from "../events/session/authEvents";
import { getBaseUrl } from "./baseUrl";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export class ApiError<TPayload = unknown> extends Error {
  readonly status: number;
  readonly payload?: TPayload;

  constructor(message: string, status: number, payload?: TPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function buildUrl(path: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseJsonSafe(res: Response): Promise<unknown | undefined> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

function pickErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const msg = p["message"];
    const err = p["error"];

    if (typeof msg === "string") return msg;
    if (Array.isArray(msg) && msg.every((x) => typeof x === "string"))
      return msg.join(", ");
    if (typeof err === "string") return err;
  }
  return `Request failed: ${status}`;
}

async function withAuthHeaders(init?: RequestInit): Promise<Headers> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  // solo setear Content-Type si hay body
  const token = await getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

async function request<T>(
  method: HttpMethod,
  path: string,
  options?: { body?: unknown; init?: RequestInit },
): Promise<T> {
  const url = buildUrl(path);
  const headers = await withAuthHeaders(options?.init);

  const hasBody = options && "body" in options && options.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options?.init,
    method,
    headers,
    // importante: en web permite cookies si algún endpoint usa cookie httpOnly
    // en RN no rompe; simplemente se ignora si no aplica
    credentials: "include",
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const payload = await parseJsonSafe(res);

  if (!res.ok) {
    if (res.status === 401) {
      await clearToken();
      authEvents.emitUnauthorized();
    }
    throw new ApiError(
      pickErrorMessage(payload, res.status),
      res.status,
      payload,
    );
  }

  return payload as T;
}

export interface ApiClient {
  get<T>(path: string, init?: RequestInit): Promise<T>;
  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  delete<T>(path: string, init?: RequestInit): Promise<T>;
}

export const apiClient: ApiClient = {
  get: (path, init) => request("GET", path, { init }),
  post: (path, body, init) => request("POST", path, { body, init }),
  patch: (path, body, init) => request("PATCH", path, { body, init }),
  put: (path, body, init) => request("PUT", path, { body, init }),
  delete: (path, init) => request("DELETE", path, { init }),
};
