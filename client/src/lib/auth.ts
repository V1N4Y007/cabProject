import { AuthResponse, User } from "./types";

// Token storage key
const TOKEN_KEY = "ride_quick_auth_token";
const USER_KEY = "ride_quick_user";

// Save auth data to local storage
export const saveAuth = (data: AuthResponse): void => {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

// Get token from local storage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get user from local storage
export const getUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Force reload to reset all app state
  window.location.href = "/login";
};

// Authorize requests with header
export const authHeader = (): HeadersInit => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
