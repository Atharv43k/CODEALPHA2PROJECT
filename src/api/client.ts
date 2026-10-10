import { AuthResponse, HealthResponse, VivaInfoResponse, FilePreviewResponse, User } from '../types/auth';

const TOKEN_KEY = 'metamorphosis_auth_token';

export const apiClient = {
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  },

  async register(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok && !data.message) {
      throw new Error(`Registration failed with HTTP ${res.status}`);
    }
    return data;
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok && !data.message) {
      throw new Error(`Login failed with HTTP ${res.status}`);
    }
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    try {
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });
      }
    } finally {
      this.clearToken();
    }
  },

  async getMe(): Promise<{ success: boolean; user?: User; message?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }
    const res = await fetch('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        this.clearToken();
      }
      return { success: false, message: data.message || 'Session expired' };
    }
    return data;
  },

  async evolve(stage: number, reflection: string): Promise<{ success: boolean; message?: string; user?: User }> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    const res = await fetch('/api/user/evolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stage, reflection }),
    });
    return res.json();
  },

  async getHealth(): Promise<HealthResponse> {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getVivaInfo(): Promise<VivaInfoResponse> {
    const res = await fetch('/api/viva/info');
    return res.json();
  },

  async getFilePreview(): Promise<FilePreviewResponse> {
    const res = await fetch('/api/viva/file-preview');
    return res.json();
  },
};
