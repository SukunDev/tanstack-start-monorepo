import { authStore } from "./auth-store";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customToken?: string
  ): Promise<ApiResponse<T>> {
    const token = customToken || this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await response.json();
    return data;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return authStore.getAccessToken();
  }

  async get<T>(
    endpoint: string,
    customToken?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" }, customToken);
  }

  async post<T>(
    endpoint: string,
    body?: any,
    customToken?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      },
      customToken
    );
  }

  async put<T>(
    endpoint: string,
    body?: any,
    customToken?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
      },
      customToken
    );
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    customToken?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      },
      customToken
    );
  }

  async delete<T>(
    endpoint: string,
    customToken?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" }, customToken);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
