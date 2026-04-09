# 작업 현황

> 마지막 업데이트: 2026-04-09 (집, 세션 36)

---

## QA 처리 최종 현황

### ✅ 모두 완료된 항목

| 항목 | 내용 |
|------|------|
| C-01 | /about Next.js 페이지 존재 확인 (tab=universe 쿼리 정상 작동) |
| C-02 | HeRo 파트너/멘토 가짜 대기업명 제거 |
| C-03 | hero/about, brandgravity 가짜 수치 → 준비 중 |
| C-04 | Mindle 가공 통계 → 준비 중/샘플 표시 |
| M-01 | HeRo 메인 네비 라우팅 (HeRoHeader.tsx 수정됨) |
| M-02 | HeRo 로고 링크 /hero 설정 |
| M-03 | Works GNB 임시 비노출 |
| M-04 | newsroom_items 초기 데이터 8건 등록 (Supabase) |
| M-05 | Newsletter STATIC_ISSUES 제거 + 빈 상태 안내 |
| M-06 | /goods 404 → / 301 리다이렉트 |
| N-01 | TenOne 메인 푸터 브랜드 링크 외부→내부 경로 전환 |
| N-02 | /CrewInvite → /crew-invite (URL 컨벤션) |
| N-05 | Mindle About 브랜드 수 12→26 |
| N-06 | WIO 가격 페이지 CLAUDE.md 확정가 동기화 |
| N-07 | Contact 페이지 탭 2개 모두 정상 구현 확인 |
| N-08 | /about?tab=universe Next.js 내부 페이지 정상 작동 확인 |
| N-09 | Mindle 푸터 Badak.biz/SmarComm.biz → 내부 경로 |
| newsroom | newsroom_items DB 테이블 + Admin 페이지 + 자동등록 훅 |
| BUMS 삭제 | /intra/bums/ 전체 제거 → UMS로 통합 |

### 미처리 (사용자 확인 필요 or 낮은 우선순위)
- **N-03** 뉴스레터 구독 폼 3곳 중복 — 통일 방향 결정 필요
- ~~**N-04**~~ ✅ 메인 Latest 섹션 — STATIC_NEWS 제거 + newsroom feed 필드 매핑 수정 완료 (세션 34)
- ~~**N-10**~~ ✅ privacy 페이지 이미 lools@tenone.biz로 작성됨 — 별도 조치 불필요
- **SmarComm DB 연결** — 전체 Mock 상태 (5월 예정)
- **MADLeague DB 연결** — 전체 Mock (5월 예정)

---

## 현재 DB 상태 (2026-04-08 기준)

| 테이블 | 건수 | 비고 |
|--------|------|------|
| agent_profiles | 21개 | L0×1, L1×3, L2×17 |
| mindle_trends | 67건 | 11개 카테고리 (자동 파이프라인 가동 중) |
| newsroom_items | 8건 | 초기 시드 데이터 |
| hit_c_results | 스키마만 | 실제 응시 대기 |
| hit_d/e/f_results | 스키마만 | 실제 응시 대기 |
| hit_questions layer_f | 154건 | Phase 9 시딩 완료 |
| newsletter_issues | 0건 발행 | Resend 연결 완료 |

---

## HIT 재구축 진행 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 0 | DB 마이그레이션 | ✅ |
| Phase 1 | HIT A 재구축 (PT+BT+CH+AP) | ✅ |
| Phase 2 | 멤버십 게이트 (4티어) | ✅ |
| Phase 3 | 심화 모듈 (CH Deep 45 + AP Deep 30) | ✅ |
| Phase 3b | 프론트엔드 (심화 검사 UI) | ✅ |
| Phase 4 | B/C/D/E/F 레이어 링크 정렬 | ✅ |
| Phase 5 | hit_questions DB 시딩 (247건) | ✅ |
| Phase 6 | HIT C 재구축 (122문항 + CTYPE 4유형) | ✅ |
| Phase 7 | HIT D 재구축 (142문항 + 7역할 fit_score) | ✅ |
| Phase 8 | HIT E 재구축 (142문항 + 2막 방향 Top2) | ✅ |
| Phase 9 | HIT F 재구축 (154문항 + 방향 Top1 + 미끼 탐지) | ✅ |
| Phase 10 | HIT B 재구축 (50문항 + 채점 재작성) | ✅ |
| **Phase 2b** | **차등 멤버십 완성 (3회 제한 + 구독 동기화)** | **✅** |

### Phase 2b 세부 내역 (2026-04-08 완료)
- `hit_chat_messages` → `member_id` 컬럼 추가 + INDEX
- `hero_subscriptions` status→active/expired/cancelled 시 `members.membership_tier` 자동 동기화 트리거 생성
- `/api/hit/chat/stream` — Free 티어 3회 제한 (member_id 기반 카운트), member_id 저장
- `/api/hit/chat/route.ts` — 동일 제한 로직 추가
- `/api/hit/chat/usage/route.ts` — 신규 엔드포인트 (사용 횟수 조회)
- `HeroChatPanel` — memberId/chatRemaining prop 추가, 제한 도달 시 업그레이드 CTA 표시
- HIT A 결과 페이지 — memberId + chatRemaining 전달

## 이번 세션 (세션 37) 완료 항목

| 항목 | 내용 |
|------|------|
| trend-crawl v4 재작성 | Next.js HTTP 홉 제거 → Supabase+Anthropic 직접 호출, limit 5건/회 (76s 실행) |
| trend-to-draft v2 수정 | content_drafts 스키마 수정 (stage→status, ai_generated 제거) |
| daily-vrief v3 수정 | 트렌드 조회 today→최근 7일 (trends:[] 버그 수정) |
| pg_cron 스케줄 등록 | 3개 cron job 활성화 (trend-crawl/trend-to-draft/daily-vrief) |
| 파이프라인 검증 | mindle_trends 52→67건, content_drafts 15건 신규, agent_messages green |

## 이번 세션 (세션 36) 완료 항목

| 항목 | 내용 |
|------|------|
| QA 파일 분리 — guide-sections | `lib/smarcomm/guide-sections.ts` 1392→19줄, 6개 파셜 파일로 분리 |
| QA 파일 분리 — evolution-school | `app/intra/evolution-school/page.tsx` 2064→751줄, course-data/quiz-modal/course-list-tab 추출 |
| QA 파일 분리 — messenger | `app/intra/myverse/messenger/page.tsx` 1891→760줄, messenger-data/modals/sidebar 추출 |
| QA 파일 분리 — WIO settings | `app/(WIO)/wio/app/settings/page.tsx` 1673→400줄, settings-data + 5개 탭 컴포넌트 추출 |
| tsc 검증 | 전체 0 에러 확인 |

## 이전 세션 (세션 35) 완료 항목

| 항목 | 내용 |
|------|------|
| UMS 회원 초대 기능 | `/intra/ums/members/invite/page.tsx` 신규 — MADLeague/MADLeap OB 초대 관리 페이지 |
| 초대 API | `/app/api/ums/invite/route.ts` 신규 — Supabase upsert + Resend 이메일 발송 |
| member_invites 테이블 | Supabase 신규 테이블 생성 (invite_token, expires_at 7일) |
| /crew-invite 삭제 | 공개 지원 폼 → 용도 없음으로 삭제 (인트라 UMS 초대 기능으로 대체) |
| intra-nav.ts | UMS 회원 하위에 "초대" 메뉴 추가 |
| ccusage 모니터링 | `~/.claude/usage-status.js` — 캐시 방식(10분) + Stop 훅 연결 |
| settings.json hooks | Stop 이벤트에 usage-status.js 실행 추가 |
| N-03 뉴스레터 공통 컴포넌트 | `components/newsletter/NewsletterSubscribeForm.tsx` 신규 — dark/light 테마, accentColor, source prop |
| 전 브랜드 뉴스레터 삽입 | 22개 브랜드 메인 페이지에 NewsletterSubscribeForm 삽입 완료 (FWN 기존 인라인 → 컴포넌트 교체) |
| CLAUDE.md 업데이트 | Context Rot 방지 → 토큰 최적화 전략 섹션으로 교체 |
| hooks.json | `.claude/hooks.json` strategic-compact 훅 추가 (Edit/Write PreToolUse) |

## 이전 세션 (세션 34) 완료 항목

| 항목 | 내용 |
|------|------|
| N-04 Latest 섹션 | STATIC_NEWS 제거 + newsroom feed 필드 매핑 수정 → 실데이터 4건 (2026-04-*) 노출 |
| /crew-invite 확인 | 이미 완성 상태였음 (244줄 지원 폼 구현) |
| HIT 리포트 확인 | 코드 정상. seed member_id=NULL 이슈 — 실사용자 데이터로 해결될 것 |
| 뉴스레터 API 확인 | /api/newsletter 단일 엔드포인트 이미 통일 완료 |

## 이전 세션 (세션 33) 완료 항목

| 항목 | 내용 |
|------|------|
| 뉴스레터 send route 수정 | blocks 기반 매거진 렌더러 적용 + fallback (legacy html), `is_active` 필터 버그 수정 |
| 뉴스레터 페이지 3분할 | 단일 탭 → dashboard / issues(뉴스레터 관리) / subscribers 독립 페이지 |
| nav "이슈 관리" → "뉴스레터 관리" | `lib/intra-nav.ts` 레이블 변경 |
| UMS 사이트 필터 재구성 | 전체 UMS 레이아웃에서 제거 → boards/content PageHeader children에만 배치 |
| Claude settings 업데이트 | `~/.claude/settings.json` — model: sonnet, MAX_THINKING_TOKENS, CLAUDE_AUTOCOMPACT_PCT_OVERRIDE, CLAUDE_CODE_SUBAGENT_MODEL |

## 이전 세션 (세션 32) 완료 항목

| 항목 | 내용 |
|------|------|
| HeRo hydration fix | `useMemo(Math.random)` → `useState+useEffect` (서버/클라 렌더 불일치 수정) |
| MADLeague 가짜 데이터 제거 | recentActivities 빈 배열, 섹션 조건부 노출 |
| Mindle 동의 체크박스 | 뉴스레터 이메일 수집 동의 체크박스 추가 (N-03) |
| middleware.ts 보완 | domo.ne.kr, hero.tenone.biz 등 9개 도메인 매핑 추가 |
| CrewInvite 경로 수정 | PascalCase → kebab-case 폴더 rename (404 수정) |
| /intra/universe/ 삭제 | UMS로 대체된 고아 폴더 제거 |
| RELAY.md 신규 | Code→Chat 단방향 완료 보고 구조 |
| 빌드 검증 | `npx next build` — 에러 없음 ✅ |

## 다음 스텝 후보

1. **DNS 이전** — madleap.co.kr, madleague.net, rook.co.kr, badak.biz → Vercel NS (텐원 직접 처리)
2. ~~**/crew-invite 폼 DB 저장**~~ — UMS 초대 기능으로 대체 완료
3. ~~**N-03 뉴스레터 구독 폼 통일**~~ ✅ 공통 컴포넌트 + 22개 브랜드 완료
4. **N-10 privacy@tenone.biz 실수신 확인** — 운영자 직접 확인
5. **SmarComm/MADLeague DB 연결** — 전체 Mock 상태 (5월 예정)
6. **Mindle 메인 인라인 폼 → 공통 컴포넌트 교체** — `app/(Mindle)/mindle/page.tsx` 내 기존 인라인 뉴스레터 폼 → `NewsletterSubscribeForm`으로 교체 (낮은 우선순위)
7. **TenOne/newsletter 페이지 교체** — `app/(TenOne)/newsletter/page.tsx` 내 중복 코드 → 공통 컴포넌트 사용 (낮은 우선순위)
