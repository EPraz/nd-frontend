import { apiClient } from "./client";

export type LoginResponse = { accessToken: string };

export type SessionResponse = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "OPS" | "VIEWER";
  company: { id: string; name: string };
};

export function login(email: string, password: string) {
  return apiClient.post<LoginResponse>("/auth/login", { email, password });
}

export function getSession() {
  return apiClient.get<SessionResponse>("/auth/session");
}
