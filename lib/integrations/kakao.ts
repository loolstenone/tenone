/**
 * Kakao 통합 모듈
 *
 * KakaoTalk 메시지 전송 + Kakao Login 헬퍼 + 채널 메시지 API
 * 환경변수: KAKAO_REST_API_KEY, KAKAO_ADMIN_KEY
 */

// ─── 타입 정의 ────────────────────────────────────────────────

export interface KakaoMessageResult {
  success: boolean;
  resultCode?: number;
  message?: string;
}

export interface KakaoUserProfile {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
}

export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

export interface KakaoTemplateButton {
  title: string;
  link: { web_url?: string; mobile_web_url?: string };
}

export interface KakaoTextMessage {
  object_type: 'text';
  text: string;
  link: { web_url?: string; mobile_web_url?: string };
  button_title?: string;
}

export interface KakaoFeedMessage {
  object_type: 'feed';
  content: {
    title: string;
    description?: string;
    image_url?: string;
    link: { web_url?: string; mobile_web_url?: string };
  };
  buttons?: KakaoTemplateButton[];
}

// ─── 환경변수 헬퍼 ────────────────────────────────────────────

function getKakaoConfig() {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const adminKey = process.env.KAKAO_ADMIN_KEY;

  return { restApiKey, adminKey };
}

function ensureRestApiKey(): string {
  const { restApiKey } = getKakaoConfig();
  if (!restApiKey) {
    throw new Error('KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return restApiKey;
}

function ensureAdminKey(): string {
  const { adminKey } = getKakaoConfig();
  if (!adminKey) {
    throw new Error('KAKAO_ADMIN_KEY 환경변수가 설정되지 않았습니다.');
  }
  return adminKey;
}

// ─── Kakao Login 헬퍼 ─────────────────────────────────────────

const KAKAO_AUTH_BASE = 'https://kauth.kakao.com';
const KAKAO_API_BASE = 'https://kapi.kakao.com';

/**
 * Kakao 로그인 인증 URL 생성
 */
export function getKakaoLoginUrl(redirectUri: string, state?: string): string {
  const restApiKey = ensureRestApiKey();

  const params = new URLSearchParams({
    client_id: restApiKey,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  if (state) params.set('state', state);

  return `${KAKAO_AUTH_BASE}/oauth/authorize?${params.toString()}`;
}

/**
 * Kakao authorization code를 토큰으로 교환
 */
export async function exchangeKakaoCode(
  code: string,
  redirectUri: string
): Promise<KakaoTokenResponse> {
  const restApiKey = ensureRestApiKey();

  const res = await fetch(`${KAKAO_AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: restApiKey,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Kakao 토큰 교환 실패: ${err.error_description || res.statusText}`);
  }

  return res.json();
}

/**
 * Kakao 사용자 프로필 조회
 */
export async function getKakaoUserProfile(accessToken: string): Promise<KakaoUserProfile> {
  const res = await fetch(`${KAKAO_API_BASE}/v2/user/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Kakao 프로필 조회 실패: ${res.statusText}`);
  }

  return res.json();
}

// ─── KakaoTalk 메시지 전송 ────────────────────────────────────

/**
 * 나에게 카카오톡 메시지 보내기 (사용자 access_token 필요)
 * - 사용자가 카카오 로그인으로 인증한 경우 사용
 */
export async function sendMessageToMe(
  accessToken: string,
  message: KakaoTextMessage | KakaoFeedMessage
): Promise<KakaoMessageResult> {
  const res = await fetch(`${KAKAO_API_BASE}/v2/api/talk/memo/default/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      template_object: JSON.stringify(message),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      resultCode: err.code,
      message: err.msg || `메시지 전송 실패: ${res.statusText}`,
    };
  }

  const data = await res.json();
  return {
    success: data.result_code === 0,
    resultCode: data.result_code,
  };
}

/**
 * 친구에게 카카오톡 메시지 보내기 (사용자 access_token + 친구 UUID 필요)
 */
export async function sendMessageToFriend(
  accessToken: string,
  receiverUuids: string[],
  message: KakaoTextMessage | KakaoFeedMessage
): Promise<KakaoMessageResult> {
  const res = await fetch(`${KAKAO_API_BASE}/v1/api/talk/friends/message/default/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      receiver_uuids: JSON.stringify(receiverUuids),
      template_object: JSON.stringify(message),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      resultCode: err.code,
      message: err.msg || `메시지 전송 실패: ${res.statusText}`,
    };
  }

  const data = await res.json();
  return {
    success: true,
    resultCode: 0,
    message: `전송 성공: ${data.successful_receiver_uuids?.length || 0}명`,
  };
}

// ─── 채널 메시지 API (바당쇠 미래 사용) ───────────────────────

/**
 * 카카오톡 채널을 통한 알림 메시지 전송 (Admin Key 사용)
 * - 비즈 메시지 API (알림톡/친구톡)
 * - 실제 사용 시 카카오 비즈니스 채널 등록 필요
 */
export async function sendChannelMessage(
  targetUserId: number,
  templateId: string,
  templateArgs?: Record<string, string>
): Promise<KakaoMessageResult> {
  const adminKey = ensureAdminKey();

  const body: Record<string, unknown> = {
    target_id_type: 'user_id',
    target_id: targetUserId,
    template_id: templateId,
  };

  if (templateArgs) {
    body.template_args = templateArgs;
  }

  const res = await fetch(`${KAKAO_API_BASE}/v1/api/talk/friends/message/send`, {
    method: 'POST',
    headers: {
      Authorization: `KakaoAK ${adminKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      Object.entries(body).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: typeof v === 'string' ? v : JSON.stringify(v) }),
        {} as Record<string, string>
      )
    ),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      resultCode: err.code,
      message: err.msg || `채널 메시지 전송 실패: ${res.statusText}`,
    };
  }

  return { success: true, resultCode: 0 };
}

// ─── 유틸리티 ─────────────────────────────────────────────────

/**
 * Kakao 텍스트 메시지 템플릿 생성 헬퍼
 */
export function createTextMessage(
  text: string,
  linkUrl?: string,
  buttonTitle?: string
): KakaoTextMessage {
  return {
    object_type: 'text',
    text,
    link: { web_url: linkUrl, mobile_web_url: linkUrl },
    button_title: buttonTitle,
  };
}

/**
 * Kakao 피드 메시지 템플릿 생성 헬퍼
 */
export function createFeedMessage(
  title: string,
  description?: string,
  imageUrl?: string,
  linkUrl?: string,
  buttons?: KakaoTemplateButton[]
): KakaoFeedMessage {
  return {
    object_type: 'feed',
    content: {
      title,
      description,
      image_url: imageUrl,
      link: { web_url: linkUrl, mobile_web_url: linkUrl },
    },
    buttons,
  };
}

/**
 * Kakao 설정 여부 확인
 */
export function isKakaoConfigured(): boolean {
  const { restApiKey } = getKakaoConfig();
  return !!restApiKey;
}

/**
 * Kakao Admin 설정 여부 확인
 */
export function isKakaoAdminConfigured(): boolean {
  const { adminKey } = getKakaoConfig();
  return !!adminKey;
}
