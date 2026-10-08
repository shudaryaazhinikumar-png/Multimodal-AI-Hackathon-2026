const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiErrorPayload {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const reqHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  let reqBody: BodyInit | undefined;

  if (body instanceof FormData) {
    reqBody = body;
    // Let the browser set Content-Type with multipart boundary automatically
  } else if (body !== undefined && body !== null) {
    if (!reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    reqBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    headers: reqHeaders,
    body: reqBody,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    let errorMessage = response.statusText || 'Request failed';

    if (typeof errorBody.error === 'string' && errorBody.error.trim()) {
      errorMessage = errorBody.error;
    } else if (typeof errorBody.message === 'string' && errorBody.message.trim()) {
      errorMessage = errorBody.message;
    } else if (typeof errorBody.detail === 'string' && errorBody.detail.trim()) {
      errorMessage = errorBody.detail;
    } else if (typeof errorBody.details === 'string' && errorBody.details.trim()) {
      errorMessage = errorBody.details;
    }

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }

    const err: ApiErrorPayload = {
      status: response.status,
      message: errorMessage,
      code: errorBody.code,
      details: errorBody.details,
    };
    throw err;
  }

  if (response.status === 204) {
    return { success: true } as unknown as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export { API_BASE_URL, USE_MOCK };

