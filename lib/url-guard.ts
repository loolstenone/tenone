/**
 * 서버가 대신 접속하는 URL 검증 — SSRF 차단 (2026-10-11 레드팀 조치)
 *   공개 http(s) 주소만 허용. 호스트명을 DNS로 풀어 사설망·루프백·링크로컬·메타데이터 주소면 거부.
 */
import { promises as dns } from 'dns';
import { isIP } from 'net';

function isPrivateIPv4(ip: string): boolean {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(n => Number.isNaN(n))) return true;
  return (
    p[0] === 10 ||
    p[0] === 127 ||
    p[0] === 0 ||
    (p[0] === 169 && p[1] === 254) ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) ||
    (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
    p[0] >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === '::1' || v === '::') return true;
  if (v.startsWith('fe80:') || v.startsWith('fc') || v.startsWith('fd')) return true;
  const m = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return m ? isPrivateIPv4(m[1]) : false;
}

export function isPrivateAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) return isPrivateIPv6(ip);
  return true;
}

export async function isPublicHttpUrl(raw: string): Promise<boolean> {
  let u: URL;
  try { u = new URL(raw); } catch { return false; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
  if (u.username || u.password) return false;
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return false;
  if (isIP(host)) return !isPrivateAddress(host);
  try {
    const addrs = await dns.lookup(host, { all: true });
    if (!addrs.length) return false;
    return addrs.every(a => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}
