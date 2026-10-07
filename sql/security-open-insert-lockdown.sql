-- 누구나 INSERT 가능한 정책(WITH CHECK true) 정리 2차 — 세션 161, 2026-10-07
-- 대상: 쓰기가 전부 서버(service_role) 또는 DEFINER 트리거이거나, 코드에서 쓰지 않는 테이블
--   service_role·테이블 소유자(postgres) DEFINER 트리거는 RLS를 우회하므로 이 정책들이 필요 없다.
--   실제 효과는 "anon 키로 브라우저 밖에서 직접 INSERT" 차단뿐.
-- 적용: 2026-10-07 MCP apply_migration `security_open_insert_lockdown` (롤백 시뮬레이션 + 운영 anon REST INSERT 401 확인)
--
-- 테이블                      | 쓰는 곳                                   | 막는 공격
-- badak_notifications         | Badak API 6곳 (admin)                     | 임의 회원에게 가짜 알림(피싱 링크) 발송
-- jakka_notifications         | 트리거 jakka_notify_follow·new_work (DEFINER) | 가짜 알림
-- chat_messages               | 코드 없음                                 | anon이 에이전트 메시지 위조
-- shop_orders                 | 쓰기 코드 없음 (인트라는 조회·상태변경)   | 가짜 주문 생성
-- timesheets                  | 코드 없음 (wio_timesheets 사용)           | —
-- badak_stars                 | 쓰기 코드 없음                            | 누구나 Badak 스타 기사 게시(status 직접 지정)
-- badak_visitor_logs          | 코드 없음                                 | 로그 오염
-- wio_analytics_events        | /api/analytics/event (admin)              | 분석 데이터 오염
-- collected_data              | 크롤러 API·Edge Function (service_role)   | Whole See 원천 데이터 오염
-- digests                     | 코드 없음                                 | —
-- bot_responses               | /api/trendhunter/respond (service_role)   | —
-- newsletter_subscribers      | /api/newsletter (admin)                   | 동의 없는 구독자 등록 (정보통신망법 제50조), 캡차 우회
-- hero_talent_applications    | /api/hero/talent-agent/apply (admin)      | 캡차·검증 우회 지원서
-- hero_tih_responses          | /api/hero/tih (admin)                     | 가짜 기업 진단 응답 → 매칭 오염

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.badak_notifications;
DROP POLICY IF EXISTS notif_insert ON public.jakka_notifications;
DROP POLICY IF EXISTS chat_messages_agent_write ON public.chat_messages;
DROP POLICY IF EXISTS shop_orders_write_all ON public.shop_orders;
DROP POLICY IF EXISTS authenticated_insert ON public.timesheets;
DROP POLICY IF EXISTS badak_stars_insert ON public.badak_stars;
DROP POLICY IF EXISTS badak_visitor_logs_insert ON public.badak_visitor_logs;
DROP POLICY IF EXISTS service_insert ON public.wio_analytics_events;
DROP POLICY IF EXISTS anon_insert ON public.collected_data;
DROP POLICY IF EXISTS auth_insert ON public.collected_data;
DROP POLICY IF EXISTS auth_insert ON public.digests;
DROP POLICY IF EXISTS anon_insert ON public.bot_responses;
DROP POLICY IF EXISTS auth_insert ON public.bot_responses;
DROP POLICY IF EXISTS public_read_newsletter ON public.newsletter_subscribers;
DROP POLICY IF EXISTS newsletter_insert ON public.newsletter_subscribers;
DROP POLICY IF EXISTS hero_talent_app_insert ON public.hero_talent_applications;
DROP POLICY IF EXISTS anyone_insert_tih ON public.hero_tih_responses;

-- 남은 공개 INSERT (3차 — 코드 변경 필요, 이번에 손대지 않음)
--   hero_search_light_waitlist · coaching_waitlist · hero_business_inquiries · mad_hero_applications
--     : API가 사용자 세션 클라이언트로 INSERT → API를 admin + Turnstile로 바꾼 뒤 정책 제거
--   montz_contact_requests : 브라우저에서 직접 INSERT (비로그인 캐스팅 제안) → API 경유로 전환 후 제거
--   post_comments (Townity) : 브라우저 직접 INSERT, 작성자 위조 가능 → author = 본인 조건으로
