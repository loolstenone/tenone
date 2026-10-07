# 프로그램 모듈 (코어) — 설계안 v0.1

> 2026-10-08 · 상태: **1·2단계 적용** (3단계 인증서 · 4단계 RooK·HeRo 예정)
> 원칙: **기능은 하나(코어), 주인은 브랜드(`brand_id`), 창구는 여러 곳(`channels`)**
> 근거: 데이터 계약 3조 — MADLeague(경쟁 PT)·RooK(실전 프로젝트) 두 집중 브랜드가 같은 기능을 필요로 함 → 코어로 끌어올림

---

## 1. 쓰는 곳

| 프로그램 | 주인 `brand_id` | 창구 `channels` | 유형 `kind` |
|---|---|---|---|
| 경쟁 PT · 동아리 프로젝트 | madleague | madleague | competition · project |
| HeRo 커리어 프로그램 | hero | hero, madleague | program |
| RooK 실전 프로젝트 | rook | rook, madleague | project |
| 기획자 교육 과정 | (출시 시 결정) | 해당 사이트, madleague | course |

- 같은 회차가 여러 사이트에 보일 수 있다 (`channels`). 데이터 주인은 하나 (`brand_id`)
- 신청 시 **주인 브랜드** 동의를 받는다 → `member_brand_joins(brand_id)` (헌법 원칙 1 · 데이터 계약 4조). MADLeague 화면에서 RooK 프로젝트를 신청해도 "운영: RooK"

## 2. 테이블

모든 테이블: `tenant_id` · `brand_id` · RLS 활성. 공개 읽기 표시가 없으면 **anon·authenticated 권한 없음 (서버 API만)**

| 테이블 | 역할 | 주요 컬럼 | 공개 읽기 |
|---|---|---|---|
| `program_rounds` | 회차 | brand_id · **channels text[]** · kind · **mode**(team/individual) · title · year · client_name · client_logo_url · brief_title · brief_content(참여자만) · start_date · end_date(예선 마감) · final_deadline · presentation_date · status · form_id · results_published_at · **context jsonb**(브랜드별 추가값) | 회차 기본 정보 (brief_content 제외 — 뷰) |
| `program_teams` | 팀 | round_id · name · description · is_finalist · **invite_code**(초대 링크, 2단계) · **context jsonb**(MADLeague: `{club_id}`) | 팀 이름 |
| `program_participants` | 참가자 (팀원·개인 참가) | round_id · team_id(개인 참가는 NULL) · **member_id**(members.id, 필수) · role(leader/member) · joined_via(staff/officer/invite) | — |
| `program_submissions` | 제출물 | round_id · team_id 또는 member_id · stage(prelim/final) · title · description · presentation_url · file_path · file_name · file_size · status · submitted_at · submitted_by · consent | — |
| `program_submission_comments` | 코멘트 | submission_id · author_member_id · author_role(staff/client) · body · visible_to_team | — |
| `program_results` | 결과 | round_id · team_id 또는 member_id · rank · award_name · feedback · **team_name·context 스냅샷** | 발표된 회차만 (RLS) |
| `program_notices` | 공지 | round_id · title · body · pinned · author | — |
| `program_questions` · `program_answers` | Q&A | 질문: round_id · team_id · asker · is_private · status / 답변: author_role · body | — |
| (3단계) `program_certificates` | 인증서 | brand_id · round_id · member_id · **구분**(type) · **코드** · **발급일** · **비고** · **결과** · 발급 시점 스냅샷(이름·소속·기수·대학·전공·생년월일·출전팀명) | 코드 진위 확인만 |

- **한 회차에 한 사람 한 번**: `program_participants UNIQUE(round_id, member_id)` — 지금은 앱 코드로만 막는 것을 DB 제약으로
- 클라이언트 연결 = 기존대로 capability `(showcase, {주인 brand}, host, {type:'corporate', round_id})`
- 제출 파일 = 비공개 버킷 `program-submissions` (`{brand}/{round}/{team|member}/…`) — `mad-submissions`(비어 있음) 대체
- 브랜드 전용 화면 값(MADLeague 동아리 등)은 `context jsonb`에 — 코어가 `mad_clubs`를 직접 참조하지 않는다 (데이터 계약 3조)

## 3. 권한 (코어 함수 `lib/programs/access.ts`)

| 역할 | 판단 | 할 수 있는 것 |
|---|---|---|
| staff | `member_roles` staff 계열 (+ 브랜드 관리 `role={brand}, context=brand`) | 전부 |
| client | capability showcase/host `{round_id}` | 공지·Q&A·최종 제출물 열람, 답변·코멘트 |
| team / participant | program_participants | 자기 팀 제출·질문, 공개 Q&A·공지 |
| (2단계) officer | MADLeague 회장단 — 브랜드 확장 훅 | 자기 동아리 팀 구성 |

## 4. 관리 화면 — 별도 / 통합

| 화면 | 범위 |
|---|---|
| 인트라 › 각 브랜드 › 프로그램 (`/intra/ums/{brand}/programs`) | 그 브랜드 회차만 (`brand_id`) — MADLeague는 기존 "경쟁 PT" 메뉴가 이 화면 |
| 인트라 › 통합 관리 › 프로그램 (`/intra/ums/programs`) | 전 브랜드 회차·참가·제출·결과 현황 |
| 사이트 회차 방 (`/{brand}/pt/{id}` 등) | 공지·Q&A·제출물 — 창구 사이트마다 같은 컴포넌트 |
| 회원 상세 · 마이페이지 | 한 사람의 전 브랜드 프로그램 이력 |

## 5. 이전 계획 (1단계)

1. `program_*` 테이블 생성 (SQL 파일 + apply_migration, GRANT·REVOKE 포함)
2. `mad_*` 데이터 복사 — 같은 UUID 유지 (옛 경쟁 PT 3건 + 데모 1건 · 팀·결과 0~6건)
3. 코드 전환 — API `/api/programs/rounds/{id}/…` · 인트라 `/api/intra/programs/…` · 접근 함수 코어로. MADLeague 화면(워크스페이스·회차 방·명예의 전당·포트폴리오·동아리·홈)은 겉모습 그대로
4. 검증 — 지금까지 한 시나리오 전부 다시 (제출·본선·공지·Q&A·클라이언트·결과 발표·익명 차단)
5. **옛 `mad_*` 경쟁 PT 테이블 삭제는 배포 후** — 배포된 옛 코드가 읽고 있으므로 (승인 후 별도 실행)
   대상: mad_competitions · mad_competition_teams · mad_team_members · mad_submissions · mad_competition_results · mad_round_* · mad_submission_comments · 버킷 mad-submissions · (`mad_archive` 0건 — competition_id FK 정리)

## 6. 법적 체크 (§0.1)

- 신청 동의 = 주인 브랜드 기준, 버전 기록 (제15조)
- 다른 브랜드 화면·공개 포트폴리오에 이력 표시 = 본인 공개 설정 (제18조)
- 클라이언트에게 참가자 개인정보 비노출 — 팀 이름·제출물만 (제17조, 2026-10-08 결정)
- 인증서 스냅샷은 발급 기록 — 탈퇴 시 처리 기준을 `docs/Data_Lifecycle.md`에 추가 (3단계)
- RooK 실전 프로젝트: "참여 확인서" 명칭 · 무급 참여 근로자성 · 직업소개 연결 금지(미신고) — 4단계 출시 전 법률 검토

---

## 7. 2단계 — 사이트 팀 구성 · 초대 링크 · 참가 동의 (2026-10-08 적용)

| 기능 | 누가 | 어디서 | 구현 |
|---|---|---|---|
| 참가 동의 | 참가자 (직원·클라이언트 제외) | 회차 방 첫 입장 · 팀 관리 · 초대 링크 합류 | `member_brand_joins(주인 브랜드)` origin `program` · terms_version `program-2026-10-08` (`lib/programs/consent.ts`, 문구 `consent-text.ts`) |
| 팀 꾸리기 | 직원 · 동아리 운영진(club 임원 → 자기 동아리 팀만) | `/madleague/pt/{id}/teams` | 그 해 활동 회원(현역·임원, `context.year` = 회차 연도 또는 미기록)을 끌어다 놓기 · 모바일은 이름 → "여기로" · 팀장 지정 · 빈 팀 삭제 |
| 초대 링크 | 팀장 · 운영진 · 직원 | 팀 카드 | `program_teams.invite_code` (10자, 재발급·끄기) → `/madleague/pt/join/{code}` → 가입·로그인 → 동의 → 합류 (`joined_via='invite'`) |
| 팀명·소개 | 팀장 · 운영진 · 직원 | 팀 카드 "수정" | `rename` |

- 권한: `lib/programs/teams.ts` (`getTeamScope` · `canRunTeam` · `canEditTeam`) — 운영진 권한은 모집 예정·진행 중 회차만, 직원은 항상
- 브랜드 훅: `officerGroupIds` · `groupCandidates` (`lib/programs/brands.ts`) — 다른 브랜드는 훅 추가로 같은 화면 사용
- 운영진은 자기 동아리 그 해 활동 회원만 직접 배정 — 그 외(미가입·타 동아리)는 초대 링크로 본인이 동의하고 합류
- 한 회차 한 팀: DB UNIQUE → 다른 팀 소속이면 409 (이동은 운영진)
- 브리프 내용은 회차 방에서 동의 후에만 (워크스페이스 목록에서 제거)
- API: `/api/programs/rounds/{id}/teams` (GET 보드 · POST create_team·rename·assign·set_leader·invite·delete_team) · `/api/programs/invite` (GET 미리보기 · POST 합류) · `/api/programs/consent`
