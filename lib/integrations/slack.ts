/**
 * Slack 통합 모듈
 *
 * Webhook 전송 + OAuth2 워크스페이스 연결 + 채널 메시지 전송
 * 환경변수: SLACK_WEBHOOK_URL, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_SIGNING_SECRET
 */

import crypto from 'crypto';

// ─── 타입 정의 ────────────────────────────────────────────────

export interface SlackMessagePayload {
  text?: string;
  blocks?: SlackBlock[];
  channel?: string;
  username?: string;
  icon_emoji?: string;
  thread_ts?: string;
}

export interface SlackBlock {
  type: 'section' | 'header' | 'divider' | 'actions' | 'context' | 'image';
  text?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
    emoji?: boolean;
  };
  fields?: { type: 'mrkdwn' | 'plain_text'; text: string }[];
  elements?: unknown[];
  accessory?: unknown;
  block_id?: string;
}

export interface SlackWebhookResult {
  success: boolean;
  error?: string;
}

export interface SlackTokenResponse {
  ok: boolean;
  access_token?: string;
  team?: { id: string; name: string };
  incoming_webhook?: { channel: string; url: string };
  error?: string;
}

export interface SlackApiResult {
  ok: boolean;
  error?: string;
  ts?: string; // 메시지 타임스탬프
  channel?: string;
}

export interface SlackEvent {
  type: string;
  event?: {
    type: string;
    text?: string;
    user?: string;
    channel?: string;
    ts?: string;
    thread_ts?: string;
  };
  challenge?: string; // URL verification
  token?: string;
  team_id?: string;
  event_id?: string;
  event_time?: number;
}

// ─── 환경변수 헬퍼 ────────────────────────────────────────────

function getSlackConfig() {
  return {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || null,
    clientId: process.env.SLACK_CLIENT_ID || null,
    clientSecret: process.env.SLACK_CLIENT_SECRET || null,
    signingSecret: process.env.SLACK_SIGNING_SECRET || null,
  };
}

// ─── Webhook 전송 ─────────────────────────────────────────────

/**
 * Slack Incoming Webhook으로 메시지 전송
 * - 가장 간단한 알림 방법. 웹훅 URL만 있으면 됨.
 */
export async function sendWebhookMessage(
  message: SlackMessagePayload,
  webhookUrl?: string
): Promise<SlackWebhookResult> {
  const url = webhookUrl || getSlackConfig().webhookUrl;

  if (!url) {
    return { success: false, error: 'SLACK_WEBHOOK_URL이 설정되지 않았습니다.' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Slack 웹훅 전송 실패: ${text}` };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Slack 웹훅 오류: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ─── OAuth2 플로우 ────────────────────────────────────────────

/**
 * Slack OAuth2 인증 URL 생성
 */
export function getSlackAuthUrl(redirectUri: string, state?: string): string {
  const { clientId } = getSlackConfig();

  if (!clientId) {
    throw new Error('SLACK_CLIENT_ID 환경변수가 설정되지 않았습니다.');
  }

  const scopes = [
    'channels:read',
    'chat:write',
    'incoming-webhook',
    'users:read',
  ].join(',');

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
  });

  if (state) params.set('state', state);

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

/**
 * Slack authorization code를 토큰으로 교환
 */
export async function exchangeSlackCode(
  code: string,
  redirectUri: string
): Promise<SlackTokenResponse> {
  const { clientId, clientSecret } = getSlackConfig();

  if (!clientId || !clientSecret) {
    throw new Error('SLACK_CLIENT_ID, SLACK_CLIENT_SECRET 환경변수를 확인하세요.');
  }

  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data: SlackTokenResponse = await res.json();

  if (!data.ok) {
    throw new Error(`Slack 토큰 교환 실패: ${data.error}`);
  }

  return data;
}

// ─── Bot API 메시지 전송 ──────────────────────────────────────

/**
 * Slack Bot Token으로 채널에 메시지 전송
 * - OAuth 연동 후 Bot Token이 있을 때 사용
 */
export async function sendChannelMessage(
  botToken: string,
  channel: string,
  message: SlackMessagePayload
): Promise<SlackApiResult> {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel,
      text: message.text,
      blocks: message.blocks,
      thread_ts: message.thread_ts,
    }),
  });

  const data: SlackApiResult = await res.json();

  if (!data.ok) {
    return { ok: false, error: `채널 메시지 전송 실패: ${data.error}` };
  }

  return data;
}

/**
 * Slack 이벤트 서명 검증
 * - 웹훅 수신 시 요청이 실제 Slack에서 온 것인지 검증
 */
export function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  // 5분 이상 된 요청은 거부 (replay attack 방지)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp) < fiveMinutesAgo) {
    return false;
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = 'v0=' + crypto.createHmac('sha256', signingSecret)
    .update(sigBasestring)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  );
}

/**
 * Slack URL verification challenge 처리
 */
export function handleChallenge(event: SlackEvent): string | null {
  if (event.type === 'url_verification' && event.challenge) {
    return event.challenge;
  }
  return null;
}

// ─── 알림 포워딩 헬퍼 ─────────────────────────────────────────

/**
 * WIO 알림을 Slack 메시지로 변환하여 전송
 */
export async function forwardNotification(
  notification: {
    title: string;
    body: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    url?: string;
    sender?: string;
  },
  webhookUrl?: string
): Promise<SlackWebhookResult> {
  const emojiMap = {
    info: ':information_source:',
    warning: ':warning:',
    error: ':x:',
    success: ':white_check_mark:',
  };

  const emoji = emojiMap[notification.type || 'info'];

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${emoji} ${notification.title}`, emoji: true },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: notification.body },
    },
  ];

  // 발신자 정보
  if (notification.sender || notification.url) {
    const contextElements: unknown[] = [];
    if (notification.sender) {
      contextElements.push({ type: 'mrkdwn', text: `:bust_in_silhouette: ${notification.sender}` });
    }
    if (notification.url) {
      contextElements.push({ type: 'mrkdwn', text: `<${notification.url}|자세히 보기>` });
    }
    blocks.push({ type: 'context', elements: contextElements });
  }

  return sendWebhookMessage({ blocks }, webhookUrl);
}

// ─── 메시지 빌더 ──────────────────────────────────────────────

/**
 * 간단한 텍스트 메시지 생성
 */
export function createSimpleMessage(text: string): SlackMessagePayload {
  return { text };
}

/**
 * 섹션 블록 메시지 생성
 */
export function createSectionMessage(
  title: string,
  fields: { label: string; value: string }[]
): SlackMessagePayload {
  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: title, emoji: true },
      },
      {
        type: 'section',
        fields: fields.map((f) => ({
          type: 'mrkdwn' as const,
          text: `*${f.label}*\n${f.value}`,
        })),
      },
    ],
  };
}

// ─── 유틸리티 ─────────────────────────────────────────────────

/**
 * Slack Webhook 설정 여부 확인
 */
export function isSlackWebhookConfigured(): boolean {
  return !!getSlackConfig().webhookUrl;
}

/**
 * Slack OAuth 설정 여부 확인
 */
export function isSlackOAuthConfigured(): boolean {
  const { clientId, clientSecret } = getSlackConfig();
  return !!clientId && !!clientSecret;
}
