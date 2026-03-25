// Mock 인증 시스템
// 마스터 계정 + 테스트 URL 저장

export const MASTER_ACCOUNT = {
  email: 'admin@smarcomm.com',
  password: 'smarcomm2026!',
};

export interface User {
  email: string;
  createdAt: string;
  scanHistory: { url: string; date: string; score: number }[];
}

// sessionStorage 기반 Mock 인증
export function login(email: string, password: string): boolean {
  // 마스터 계정
  if (email === MASTER_ACCOUNT.email && password === MASTER_ACCOUNT.password) {
    sessionStorage.setItem('user', JSON.stringify({
      email,
      createdAt: '2026-03-01',
      scanHistory: [],
    }));
    return true;
  }
  // 일반 가입자 (Mock: 아무 이메일/비번이나 OK)
  const users = JSON.parse(localStorage.getItem('smarcomm_users') || '{}');
  if (users[email] && users[email].password === password) {
    sessionStorage.setItem('user', JSON.stringify(users[email].profile));
    return true;
  }
  return false;
}

export function signup(email: string, password: string): boolean {
  const users = JSON.parse(localStorage.getItem('smarcomm_users') || '{}');
  if (users[email]) return false; // 이미 존재
  const profile: User = {
    email,
    createdAt: new Date().toISOString(),
    scanHistory: [],
  };
  users[email] = { password, profile };
  localStorage.setItem('smarcomm_users', JSON.stringify(users));
  sessionStorage.setItem('user', JSON.stringify(profile));
  return true;
}

export function getUser(): User | null {
  const stored = sessionStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
}

export function logout() {
  sessionStorage.removeItem('user');
}

export function saveScanUrl(url: string, score: number, seoScore?: number, geoScore?: number) {
  const scans = JSON.parse(localStorage.getItem('smarcomm_scan_log') || '[]');
  scans.push({ url, date: new Date().toISOString(), score, seoScore: seoScore ?? 0, geoScore: geoScore ?? 0 });
  localStorage.setItem('smarcomm_scan_log', JSON.stringify(scans));

  const user = getUser();
  if (user) {
    user.scanHistory.push({ url, date: new Date().toISOString(), score });
    sessionStorage.setItem('user', JSON.stringify(user));
  }
}

export function getScanLog(): { url: string; date: string; score: number; seoScore?: number; geoScore?: number }[] {
  return JSON.parse(localStorage.getItem('smarcomm_scan_log') || '[]');
}
