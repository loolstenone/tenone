// SmarComm Mock 인증 시스템
// TenOne 멀티사이트 환경에서 SmarComm용 인증

export const MASTER_ACCOUNT = {
  email: 'admin@smarcomm.com',
  password: 'smarcomm2026!',
};

export interface SCUser {
  email: string;
  createdAt: string;
  scanHistory: { url: string; date: string; score: number }[];
}

export function scLogin(email: string, password: string): boolean {
  if (email === MASTER_ACCOUNT.email && password === MASTER_ACCOUNT.password) {
    sessionStorage.setItem('sc_user', JSON.stringify({
      email,
      createdAt: '2026-03-01',
      scanHistory: [],
    }));
    return true;
  }
  const users = JSON.parse(localStorage.getItem('sc_users') || '{}');
  if (users[email] && users[email].password === password) {
    sessionStorage.setItem('sc_user', JSON.stringify(users[email].profile));
    return true;
  }
  return false;
}

export function scSignup(email: string, password: string): boolean {
  const users = JSON.parse(localStorage.getItem('sc_users') || '{}');
  if (users[email]) return false;
  const profile: SCUser = {
    email,
    createdAt: new Date().toISOString(),
    scanHistory: [],
  };
  users[email] = { password, profile };
  localStorage.setItem('sc_users', JSON.stringify(users));
  sessionStorage.setItem('sc_user', JSON.stringify(profile));
  return true;
}

export function getSCUser(): SCUser | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem('sc_user');
  return stored ? JSON.parse(stored) : null;
}

export function scLogout() {
  sessionStorage.removeItem('sc_user');
}

export function saveScanUrl(url: string, score: number) {
  const scans = JSON.parse(localStorage.getItem('sc_scan_log') || '[]');
  scans.push({ url, date: new Date().toISOString(), score });
  localStorage.setItem('sc_scan_log', JSON.stringify(scans));

  const user = getSCUser();
  if (user) {
    user.scanHistory.push({ url, date: new Date().toISOString(), score });
    sessionStorage.setItem('sc_user', JSON.stringify(user));
  }
}

export function getScanLog(): { url: string; date: string; score: number }[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('sc_scan_log') || '[]');
}
