/**
 * 전용 인증 도메인 (auth.tenone.biz) 토큰 전송 유틸리티
 * - AES-256-GCM 토큰 암호화/복호화
 * - 허용 도메인 화이트리스트
 * - 서버 전용 (Node.js crypto)
 */
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.AUTH_TOKEN_ENCRYPTION_KEY || '';
const TOKEN_EXPIRY_SECONDS = 60;

// 허용된 리턴 도메인 목록 (open redirect 방지)
const ALLOWED_RETURN_DOMAINS = new Set([
    'tenone.biz', 'www.tenone.biz',
    'madleague.net', 'www.madleague.net',
    'youinone.com', 'www.youinone.com',
    'rook.co.kr', 'www.rook.co.kr',
    'badak.biz', 'www.badak.biz',
    'smarcomm.biz', 'www.smarcomm.biz',
    'hero.ne.kr', 'www.hero.ne.kr',
    '0gamja.com', 'www.0gamja.com',
    'seoul360.net', 'www.seoul360.net',
    'fwn.co.kr', 'www.fwn.co.kr',
    'luki.ai', 'www.luki.ai',
    // tenone.biz 서브도메인
    'mullaesian.tenone.biz',
    'montz.tenone.biz',
    'trendhunter.tenone.biz',
    'myverse.tenone.biz',
    'townity.tenone.biz',
    'naturebox.tenone.biz',
    'domo.tenone.biz',
    'jakka.tenone.biz',
    // 로컬 개발
    'localhost',
]);

export function isAllowedReturnDomain(domain: string): boolean {
    // 로컬 개발: localhost:3000 등
    if (domain.startsWith('localhost')) return true;
    return ALLOWED_RETURN_DOMAINS.has(domain);
}

export interface TokenPayload {
    accessToken: string;
    refreshToken: string;
    returnPath: string;
    timestamp: number;
}

export function encryptTokenPayload(payload: TokenPayload): string {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const json = JSON.stringify(payload);
    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // iv(12) + tag(16) + encrypted → base64url
    const combined = Buffer.concat([iv, tag, encrypted]);
    return combined.toString('base64url');
}

export function decryptTokenPayload(token: string): TokenPayload | null {
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        const combined = Buffer.from(token, 'base64url');

        const iv = combined.subarray(0, 12);
        const tag = combined.subarray(12, 28);
        const encrypted = combined.subarray(28);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        const payload: TokenPayload = JSON.parse(decrypted.toString('utf8'));

        // 만료 검증 (60초)
        const elapsed = (Date.now() - payload.timestamp) / 1000;
        if (elapsed > TOKEN_EXPIRY_SECONDS) {
            console.error('[Auth Transfer] Token expired:', elapsed, 'seconds');
            return null;
        }

        return payload;
    } catch (e) {
        console.error('[Auth Transfer] Decryption failed:', e);
        return null;
    }
}
