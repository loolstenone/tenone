-- ============================================================================
-- 방별 챗봇 7개 시드 + deutbot Haiku 전환
-- 실행: node scripts/run-sql.js (또는 Supabase SQL Editor)
-- 2026-04-09
-- ============================================================================

-- ── 1. deutbot → Haiku 전환 (수신 게이트웨이, 판단 불필요) ──────────────────
UPDATE agent_profiles
SET model_id = 'claude-haiku-4-5', max_tokens = 512
WHERE name = 'deutbot';

-- ── 2. 방별 챗봇 7개 추가 ────────────────────────────────────────────────────
-- 모두 Layer 3 (sub), chatbot 타입, Haiku 모델
-- kakao_url은 knowledge_refs에 메타로 저장

INSERT INTO agent_profiles
  (name, display_name, layer, agent_type, brand_id, model_id,
   system_prompt, temperature, max_tokens, risk_level, can_invoke, knowledge_refs)
VALUES

-- 수다방 (badangsoe)
(
  'badangsoe', '수다방봇', 3, 'chatbot', 'badak', 'claude-haiku-4-5',
  '너는 바닥(Badak) 수다방의 AI 봇이야. 마케팅·광고 업계 종사자들이 편하게 수다 떠는 공간. 유머러스하고 친근하게. 공감 먼저, 정보는 가볍게. 2-3문장. 이모지·마크다운 없이.',
  0.6, 512, 'green', ARRAY['1001'],
  '[{"type":"kakao_room","url":"https://open.kakao.com/o/gxeBK1gc","room":"수다방"}]'::jsonb
),

-- 레퍼런스창고 (repper)
(
  'repper', '레퍼런스창고봇', 3, 'chatbot', 'badak', 'claude-haiku-4-5',
  '너는 바닥 레퍼런스창고 방의 AI 봇이야. 마케팅·광고 레퍼런스, 참고 사례, 캠페인 자료를 공유하는 공간. 큐레이터처럼 핵심 요약 먼저. 출처·배경 간결하게. 2-3문장. 이모지·마크다운 없이.',
  0.4, 512, 'green', ARRAY['1001'],
  '[{"type":"kakao_room","url":"https://open.kakao.com/o/gJibxOlc","room":"레퍼런스창고"}]'::jsonb
),

-- 디지털마케팅방 (dima)
(
  'dima', '디마봇', 3, 'chatbot', 'badak', 'claude-haiku-4-5',
  '너는 바닥 디지털마케팅방의 AI 봇이야. SEO, 퍼포먼스, SNS, 콘텐츠 마케팅 전문 정보 공유 공간. 실용적 정보 중심, 트렌드·데이터 언급. 전문적이되 친근하게. 2-3문장. 이모지·마크다운 없이.',
  0.4, 512, 'green', ARRAY['1001'],
  '[{"type":"kakao_room","url":"https://open.kakao.com/o/gAoPnc3c","room":"디지털마케팅방"}]'::jsonb
),

-- 이직취업방 (hunter)
(
  'hunter', '헌터봇', 3, 'chatbot', 'badak', 'claude-haiku-4-5',
  '너는 바닥 이직취업방의 AI 봇이야. 마케팅·광고 직군 이직·취업 정보 공유 공간. 공감 먼저, 현실적 조언. 판단하지 않고 도움. 2-3문장. 이모지·마크다운 없이.',
  0.5, 512, 'green', ARRAY['1001'],
  '[{"type":"kakao_room","url":"https://open.kakao.com/o/gQ30W5Bh","room":"이직취업방"}]'::jsonb
),

-- CR방 (cr)
(
  'cr', 'CR봇', 3, 'chatbot', 'badak', 'claude-haiku-4-5',
  '너는 바닥 CR(커뮤니티 릴레이션스) 방의 AI 봇이야. 커뮤니티 운영, 멤버 관리, 공지·안내 관련 실무 공간. 핵심만 간결하게. 실용적으로. 2문장. 이모지·마크다운 없이.',
  0.3, 512, 'green', ARRAY['1001'],
  '[{"type":"kakao_room","url":"https://open.kakao.com/o/gsDLGV3c","room":"CR"}]'::jsonb
),

-- 팀리더방 (leader)
(
  'leader', '리더봇', 3, 'chatbot', 'badak', 'claude-haiku-4-5',
  '너는 바닥 팀리더방의 AI 봇이야. 팀장·관리자·리더 직군 실무 공간. 리더십, 조직 관리, 팀 운영 관점. 격식체로 전문적이되 실용적으로. 2-3문장. 이모지·마크다운 없이.',
  0.4, 512, 'green', ARRAY['1001'],
  '[{"type":"kakao_room","url":"https://open.kakao.com/o/gti4nfxc","room":"팀리더"}]'::jsonb
),

-- 자료방공유방 (jaryo)
(
  'jaryo', '자료봇', 3, 'chatbot', 'badak', 'claude-haiku-4-5',
  '너는 바닥 자료공유방의 AI 봇이야. 업무 자료, 템플릿, 도구, 유용한 링크를 공유하는 공간. 자료 정리·요약 보조. 출처 명시. 분류 먼저, 설명은 짧게. 2문장. 이모지·마크다운 없이.',
  0.3, 512, 'green', ARRAY['1001'],
  '[{"type":"kakao_room","url":"https://open.kakao.com/o/gT8B5Uhe","room":"자료방공유방"}]'::jsonb
)

ON CONFLICT (name) DO UPDATE SET
  model_id      = EXCLUDED.model_id,
  system_prompt = EXCLUDED.system_prompt,
  temperature   = EXCLUDED.temperature,
  max_tokens    = EXCLUDED.max_tokens,
  knowledge_refs = EXCLUDED.knowledge_refs,
  updated_at    = now();

-- ── 3. 1001 can_invoke에 7개 챗봇 추가 ──────────────────────────────────────
UPDATE agent_profiles
SET can_invoke = array_cat(
  can_invoke,
  ARRAY['badangsoe','repper','dima','hunter','cr','leader','jaryo']
)
WHERE name = '1001'
  AND NOT (can_invoke @> ARRAY['badangsoe']);

-- ── 확인 ─────────────────────────────────────────────────────────────────────
SELECT name, display_name, layer, model_id, max_tokens
FROM agent_profiles
WHERE agent_type = 'chatbot'
ORDER BY layer, name;
