export type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type AuthUser = {
  id?: number | string;
  name?: string;
  email?: string;
  role?: {
    id?: number | string;
    name?: string;
    slug?: string;
  } | null;
  role_id?: number | string | null;
  [key: string]: unknown;
};

export type LoginResponseData = {
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: AuthUser;
};

export type LaravelSuccessResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: AuthUser;
};

export type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const TOKEN_KEYS = [
  "dms_token",
  "token",
  "auth_token",
  "authToken",
  "access_token",
];

const USER_KEYS = ["dms_user", "user", "authUser"];

function getStorage(remember?: boolean): Storage {
  return remember === false ? sessionStorage : localStorage;
}

function clearStorageKeys(storage: Storage): void {
  TOKEN_KEYS.forEach((key) => storage.removeItem(key));
  USER_KEYS.forEach((key) => storage.removeItem(key));

  storage.removeItem("role");
  storage.removeItem("permissions");
}

export function clearAuthSession(): void {
  clearStorageKeys(localStorage);
  clearStorageKeys(sessionStorage);
}

function extractToken(
  response: LaravelSuccessResponse<LoginResponseData> | LoginResponseData
): string {
  const directToken = response.access_token || response.token;

  const nestedToken =
    "data" in response
      ? response.data?.access_token || response.data?.token
      : undefined;

  const token = directToken || nestedToken;

  if (!token) {
    throw new Error("Login succeeded but no access token was returned.");
  }

  return token;
}

function extractTokenType(
  response: LaravelSuccessResponse<LoginResponseData> | LoginResponseData
): string {
  const directTokenType = response.token_type;

  const nestedTokenType =
    "data" in response ? response.data?.token_type : undefined;

  return directTokenType || nestedTokenType || "Bearer";
}

function extractUser(
  response: LaravelSuccessResponse<LoginResponseData> | LoginResponseData
): AuthUser | null {
  if (response.user) {
    return response.user;
  }

  if ("data" in response && response.data?.user) {
    return response.data.user;
  }

  return null;
}

function buildApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;

  const response = data as {
    message?: string;
    error?: string;
    errors?: Record<string, string[] | string>;
  };

  if (response.errors) {
    const firstError = Object.values(response.errors)[0];

    if (Array.isArray(firstError)) {
      return firstError[0] || fallback;
    }

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return response.message || response.error || fallback;
}

async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseData = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    const error = new Error(
      buildApiErrorMessage(responseData, "Request failed. Please try again.")
    ) as ApiError;

    error.status = response.status;
    error.data = responseData;

    throw error;
  }

  if (!responseData) {
    throw new Error("Empty server response.");
  }

  return responseData;
}

export async function loginUser(
  payload: LoginPayload
): Promise<LoginResponseData> {
  let responseData:
    | LaravelSuccessResponse<LoginResponseData>
    | LoginResponseData;

  try {
    responseData = await postJson<
      LaravelSuccessResponse<LoginResponseData> | LoginResponseData
    >("/login", {
      email: payload.email,
      password: payload.password,
      remember: payload.remember,
    });
  } catch (error) {
    const apiError = error as ApiError;

    if (apiError.status !== 404) {
      throw error;
    }

    responseData = await postJson<
      LaravelSuccessResponse<LoginResponseData> | LoginResponseData
    >("/authentication/login", {
      email: payload.email,
      password: payload.password,
      remember: payload.remember,
    });
  }

  const token = extractToken(responseData);
  const tokenType = extractTokenType(responseData);
  const user = extractUser(responseData);
  const storage = getStorage(payload.remember);

  clearAuthSession();

  TOKEN_KEYS.forEach((key) => storage.setItem(key, token));

  if (user) {
    USER_KEYS.forEach((key) => storage.setItem(key, JSON.stringify(user)));

    const roleSlug =
      typeof user.role === "object" && user.role ? user.role.slug : undefined;

    if (roleSlug) {
      storage.setItem("role", roleSlug);
    }

    if (Array.isArray(user.permissions)) {
      storage.setItem("permissions", JSON.stringify(user.permissions));
    }
  }

  return {
    access_token: token,
    token,
    token_type: tokenType,
    user: user || undefined,
  };
}

export function getStoredToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const localToken = localStorage.getItem(key);
    if (localToken) return localToken;

    const sessionToken = sessionStorage.getItem(key);
    if (sessionToken) return sessionToken;
  }

  return null;
}

export function getStoredUser(): AuthUser | null {
  for (const key of USER_KEYS) {
    const rawUser = localStorage.getItem(key) || sessionStorage.getItem(key);

    if (!rawUser) continue;

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      return null;
    }
  }

  return null;
}

export function getStoredRole(): string | null {
  return localStorage.getItem("role") || sessionStorage.getItem("role");
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}