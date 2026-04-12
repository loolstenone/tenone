/**
 * Gmail API 클라이언트
 * OAuth2 토큰 관리 + 메일 읽기
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface GmailTokens {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
}

interface GmailMessage {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    date: string;
    body: string;
    snippet: string;
}

function getOAuthConfig() {
    return {
        clientId: process.env.GMAIL_CLIENT_ID || '',
        clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    };
}

/** OAuth2 인증 URL 생성 */
export function getAuthUrl(redirectUri: string, state?: string): string {
    const { clientId } = getOAuthConfig();
    const scopes = 'https://www.googleapis.com/auth/gmail.readonly';
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline',
        prompt: 'consent',
        ...(state ? { state } : {}),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Authorization code → tokens 교환 */
export async function exchangeCode(code: string, redirectUri: string): Promise<GmailTokens> {
    const { clientId, clientSecret } = getOAuthConfig();
    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
    const data = await res.json();
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: Date.now() + (data.expires_in * 1000),
    };
}

/** Refresh token으로 access token 갱신 */
export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expiry_date: number }> {
    const { clientId, clientSecret } = getOAuthConfig();
    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
        }),
    });
    if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
    const data = await res.json();
    return {
        access_token: data.access_token,
        expiry_date: Date.now() + (data.expires_in * 1000),
    };
}

/** 유효한 access_token 가져오기 (만료 시 자동 갱신) */
async function getValidToken(tokens: GmailTokens): Promise<string> {
    if (tokens.expiry_date > Date.now() + 60000) {
        return tokens.access_token;
    }
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    tokens.access_token = refreshed.access_token;
    tokens.expiry_date = refreshed.expiry_date;
    return refreshed.access_token;
}

/** Gmail 메시지 목록 검색 */
export async function searchMessages(
    tokens: GmailTokens,
    query: string,
    maxResults = 10,
): Promise<{ id: string; threadId: string }[]> {
    const accessToken = await getValidToken(tokens);
    const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
    const res = await fetch(`${GMAIL_API_BASE}/messages?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Gmail search failed: ${res.status}`);
    const data = await res.json();
    return data.messages || [];
}

/** Gmail 메시지 상세 읽기 */
export async function readMessage(tokens: GmailTokens, messageId: string): Promise<GmailMessage> {
    const accessToken = await getValidToken(tokens);
    const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Gmail read failed: ${res.status}`);
    const data = await res.json();

    const headers = data.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // 본문 추출 (text/plain 우선, HTML 폴백)
    let body = '';
    const parts = data.payload?.parts || [];
    if (parts.length > 0) {
        const textPart = parts.find((p: { mimeType: string }) => p.mimeType === 'text/plain');
        const htmlPart = parts.find((p: { mimeType: string }) => p.mimeType === 'text/html');
        const part = textPart || htmlPart;
        if (part?.body?.data) {
            body = Buffer.from(part.body.data, 'base64url').toString('utf-8');
        }
    } else if (data.payload?.body?.data) {
        body = Buffer.from(data.payload.body.data, 'base64url').toString('utf-8');
    }

    // HTML 태그 제거 (간단)
    body = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    return {
        id: data.id,
        threadId: data.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        date: getHeader('Date'),
        body,
        snippet: data.snippet || '',
    };
}

/** 인증된 사용자 이메일 주소 가져오기 */
export async function getProfile(tokens: GmailTokens): Promise<string> {
    const accessToken = await getValidToken(tokens);
    const res = await fetch(`${GMAIL_API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Gmail profile failed: ${res.status}`);
    const data = await res.json();
    return data.emailAddress;
}
