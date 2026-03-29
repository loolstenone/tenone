/**
 * 외부 연동 모듈 통합 인덱스
 *
 * 각 연동 서비스의 주요 함수를 re-export
 */

// ─── Google Calendar ──────────────────────────────────────────
export {
  getAuthUrl as getGoogleAuthUrl,
  exchangeCode as exchangeGoogleCode,
  refreshToken as refreshGoogleToken,
  listEvents as listGoogleEvents,
  createEvent as createGoogleEvent,
  updateEvent as updateGoogleEvent,
  deleteEvent as deleteGoogleEvent,
  syncCalendarToOrbi,
  isGoogleCalendarConfigured,
} from './google-calendar';

export type {
  GoogleTokens,
  GoogleCalendarEvent,
  CalendarSyncResult,
} from './google-calendar';

// ─── Kakao ────────────────────────────────────────────────────
export {
  getKakaoLoginUrl,
  exchangeKakaoCode,
  getKakaoUserProfile,
  sendMessageToMe as sendKakaoMessageToMe,
  sendMessageToFriend as sendKakaoMessageToFriend,
  sendChannelMessage as sendKakaoChannelMessage,
  createTextMessage as createKakaoTextMessage,
  createFeedMessage as createKakaoFeedMessage,
  isKakaoConfigured,
  isKakaoAdminConfigured,
} from './kakao';

export type {
  KakaoMessageResult,
  KakaoUserProfile,
  KakaoTokenResponse,
} from './kakao';

// ─── Slack ────────────────────────────────────────────────────
export {
  sendWebhookMessage as sendSlackWebhookMessage,
  getSlackAuthUrl,
  exchangeSlackCode,
  sendChannelMessage as sendSlackChannelMessage,
  verifySlackSignature,
  forwardNotification as forwardSlackNotification,
  createSimpleMessage as createSlackSimpleMessage,
  createSectionMessage as createSlackSectionMessage,
  isSlackWebhookConfigured,
  isSlackOAuthConfigured,
} from './slack';

export type {
  SlackMessagePayload,
  SlackBlock,
  SlackWebhookResult,
  SlackTokenResponse,
  SlackEvent,
} from './slack';
