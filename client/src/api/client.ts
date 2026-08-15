import { getJwtPair, setJwtPair } from '../storage';

const API_BASE_URL = 'http://localhost:3000/api'; // Or use an environment variable

export class ApiClient {
  static async request(endpoint: string, options: RequestInit = {}) {
    const tokens = getJwtPair();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (tokens?.access) {
      headers['Authorization'] = `Bearer ${tokens.access}`;
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Basic 401 handling for token expiration could go here
    if (response.status === 401 && tokens?.refresh) {
      // Logic to refresh token goes here in a real implementation
      // For now, if we get a 401, we just clear the token so the user has to login again
      // setJwtPair(null);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  static get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint: string, body: any, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static patch(endpoint: string, body: any, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}
