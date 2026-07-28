// Admin authentication utilities

const ADMIN_CREDENTIALS = {
  username: 'majorotoo@gmail.com',
  password: 'majorotoo@QS1'
};

const AUTH_STORAGE_KEY = 'omnibsic_admin_auth';

export interface AdminAuth {
  isAuthenticated: boolean;
  timestamp: number;
}

export function login(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const auth: AdminAuth = {
      isAuthenticated: true,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return false;
    
    const auth: AdminAuth = JSON.parse(stored);
    
    // Session expires after 24 hours
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const isExpired = Date.now() - auth.timestamp > SESSION_DURATION;
    
    if (isExpired) {
      logout();
      return false;
    }
    
    return auth.isAuthenticated;
  } catch {
    return false;
  }
}
