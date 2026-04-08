# 작업 현황

> 마지막 업데이트: 2026-04-08 (집, 세션 31)

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
- **N-04** 메인 Latest 섹션 오래된 날짜 (2025.08) — DB 실데이터 필요
- **N-10** privacy@tenone.biz 실수신 확인 — 운영자 직접 확인
- **SmarComm DB 연결** — 전체 Mock 상태 (5월 예정)
- **MADLeague DB 연결** — 전체 Mock (5월 예정)

---

## 현재 DB 상태 (2026-04-08 기준)

| 테이블 | 건수 | 비고 |
|--------|------|------|
| agent_profiles | 21개 | L0×1, L1×3, L2×17 |
| mindle_trends | 52건 | 11개 카테고리 |
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

## 이번 세션 (세션 31) 완료 항목

| 항목 | 내용 |
|------|------|
| HIT D/E/F 심화 채점 통합 | scoring-d/e/f.ts — CH Deep 45 + AP Deep 30 재사용 채점, Dark flag 탐지 (NR+MK≥50 → hit_admin_flags) |
| Admin HIT 리포트 페이지 | `/intra/hero/hit/report` — 멤버 목록 + 레이어 완료 배지 + 소비자 뷰 팝업 (iframe) |
| Mock 미리보기 API | `/api/hit/a/result/preview` — D-INFJ 전체 프로필 + report_modules 포함 |
| 소비자 카드 높이 일정화 | `h-[540px] overflow-hidden` — 모든 페이지 동일 사이즈, 내용 많으면 내부 스크롤 |
| 통합 보고서 내부 스크롤 | 페이지 4: 제목 고정 + 모듈 스크롤 + PDF버튼 고정 (`flex-col` 구조) |
| MembershipGate 리디자인 | 노란 자물쇠 → 그레이 미니멀 + 빨간 태그 + 다크 CTA |
| HitPdfButton 레이블 수정 | `PDF 보고서 다운로드` → `전체 보고서 보기` |

## 다음 스텝 후보

1. **E 레이어 심화 시딩 검증** — `HIT_E_Deep_75.md` 기준 hit_questions에 E 레이어 75문항(che_*/ape_*) 정확히 들어갔는지 카운트 확인
2. **Admin 리포트 데이터 연결** — 실제 members + hit_a_results JOIN이 동작하는지 실계정으로 확인
3. **/crew-invite 페이지 제작** — 링크는 고쳤는데 실제 페이지가 없음 (404 상태)
4. **N-03 뉴스레터 폼 통일** — 메인/Mindle/newsletter 3곳 단일 API로 정리
5. **PG 연동** — 토스페이먼츠/포트원 결정 후 WIO 구독 결제 구현
