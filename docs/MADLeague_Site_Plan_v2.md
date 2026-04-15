# MADLeague 사이트 기획서 v2

> 작성일: 2026-04-16
> 현 사이트: madleague.net (imweb 기반)
> 신규: tenone.biz/madleague → 개발 완료 후 madleague.net 이관
> 기술: Next.js 16 + React 19 + TypeScript + Tailwind v4 + Supabase

---

## 0. 현 사이트 (madleague.net) 정밀 분석

### 플랫폼

imweb(아임웹) 기반 노코드 사이트. 커스터마이징 한계가 명확하다.

### 현재 네비게이션 구조

```
홈
경쟁 PT .................. Hall of Fame (2024 지평주조, 2025 대성학원, 2025 리제로스)
프로그램
  ├── 크리에이지 .......... + 참가신청
  ├── 댐 파티 ............. 히스토리 + 학생/현업/기업 참가신청 3종
  └── 아이디어 무브먼트
매드 진
  ├── 매드진 .............. 인터뷰·케이스·리포트·커버 (활발 운영 중)
  ├── 공모전/프로젝트
  └── 동아리 소식
히어로 ................... 커리어 상담 신청 폼 (이름/연락처/이메일/관심분야/이력서/포트폴리오)
활동인증서 ............... 단순 요청 폼 (이름/연락처/내용)
매드 리거
  ├── 자유 게시판
  └── 매드리거 보드
About
  └── 문의/의뢰
```

### 현재 동아리 (About 페이지 기준)

공식 7개 (전부 active 확정): ABC(광주전남), ADlle(대구경북), MADLeap(수도권), PAM(부산경남), SUZAK(제주), P:ad(강원), AD Zone(충청)

### 현재 BI

- 로고: 빨간 점(●) + MAD League 워드마크
- 브랜드 컬러: Red(#EC1D25) + Black(#000000) + Gold(#FFC000)
- 캐릭터: DAMbe(담비) — "호랑이 잡아 먹는 담비", 젊은 도전자 상징
- 슬로건: Match, Act, Develop / "실전이 우리를 강하게 하리라"

### About 페이지 프로그램 라인업 (7개, CreaZy 제외)

| 프로그램 | 설명 |
|----------|------|
| PJT | 실전 프로젝트 OJT |
| 경쟁 PT | 기업 실제 과제 경쟁 |
| 마케톤 | Marketing + Hacking + Marathon, 72시간 |
| 인사이트 투어링 | 지역/기업 투어 후 제안 |
| 아이디어 무브먼트 | 사회 문제 해결 아이디어 |
| 히어로 프로그램 | 커리어 솔루션 |
| 댐 파티 | 기업-학생 네트워킹 |

### 콘텐츠 현황

MADzine이 가장 활발. 인터뷰(동아리 회장 시리즈), 케이스 스터디, 리포트, 커버 매거진 형태.

### 문제점

1. imweb 한계 — DB 연동 불가, 동적 페이지 불가, 인증서 자동 발급 불가
2. 활동인증서 — 수동 요청 폼
3. 히어로 — 단순 폼. HeRo 서비스와 시스템적 연결 없음
4. 경쟁PT — Hall of Fame에 이미지만 나열. 필터 없음
5. 멤버 관리 — 기수/활동 이력 추적 불가
6. Universe 연결 — 푸터 링크 깨짐
7. DAM 파티 참가 신청 3종 분리
8. 반응형 부족

---

## 1. 설계 원칙

### 학생 관점 최우선

학생이 느껴야 하는 건 하나: **"여기서 진짜 실전을 할 수 있겠다."**
Universe 생태계는 깊이 들어온 멤버에게만 자연스럽게 열린다.

### 용어 정리

| 이전 기획서 | 수정 | 이유 |
|------------|------|------|
| 거점(Hub) | **동아리** | 학생에게 익숙한 단어 |
| CreaZy | **삭제** | 프로그램에서 제외 |
| /member/team | **삭제** | 팀은 경쟁PT마다 바뀜 |
| /admin | **TenOne Intra** | Intra에서 관리 |
| Badak 졸업 후 편입 | **아무때나 가입** | 재학 중에도 가능 |

### 정보 계층

```
[Public]  누구나 → MADLeague가 뭔지, 뭘 하는지, 어떻게 들어오는지
[Member]  매드리거 → 내 활동, 프로젝트, 커뮤니티, 인증서
[Growth]  깊은 멤버 → 커리어(HeRo), 네트워크(Badak), 프로젝트 크루(YIO)
[Intra]   운영 → TenOne Intra에서 관리
```

### 인증

tenone.biz 통합 Supabase Auth 사용. 별도 프로젝트 분리 없음.
회원가입 시 Universe 가이드 확인 단계 포함.
매드리거 가입 = tenone.biz 계정 + mad_members 레코드 생성.

---

## 2. 사이트맵

```
madleague
│
├── / ............................... 랜딩 (Home)
├── /about .......................... 매드리그란
│   ├── /about/story ................ 탄생 스토리 + 타임라인
│   └── /about/awards ............... 수상 실적
│
├── /clubs .......................... 동아리
│   └── /clubs/[slug] ............... 동아리 상세 (7개 전부 active)
│
├── /programs ....................... 프로그램
│   ├── /programs/competition ....... 경쟁 PT + Hall of Fame
│   ├── /programs/project ........... PJT
│   ├── /programs/markethon ......... 마케톤
│   ├── /programs/insight-touring ... 인사이트 투어링
│   ├── /programs/im ................ 아이디어 무브먼트
│   └── /programs/dam ............... DAM 파티 (참가 신청 통합)
│
├── /madzine ........................ MADzine (매거진)
│   └── /madzine/[slug]
│
├── /archive ........................ 아카이브
│   └── /archive/[id]
│
├── /apply .......................... 지원하기
│
├── /member ......................... 🔒 매드리거 대시보드
│   ├── /member/profile
│   ├── /member/projects
│   ├── /member/portfolio
│   └── /member/certificate ......... ⭐ 자동 발급
│
├── /community ...................... 🔒 커뮤니티
│   ├── /community/feed
│   ├── /community/club/[slug]
│   ├── /community/pinboard
│   └── /community/notice
│
├── /competition .................... 🔒 경쟁PT 워크스페이스
│   ├── /competition/current
│   ├── /competition/brief
│   ├── /competition/submit
│   └── /competition/results
│
├── /growth ......................... 🔒 성장 경로 (Universe 연계)
│   ├── /growth/career .............. HeRo
│   ├── /growth/network ............. Badak (아무때나 가입)
│   └── /growth/crew ................ YouInOne
│
├── /hero ........................... HeRo 프로그램 (Public)
│
└── /portfolio/[member-id] .......... 퍼블릭 포트폴리오
```

---

## 3. 페이지별 상세 기획

(원본 기획서 참조 — 너무 길어 여기서는 요약)

### 핵심 변경

- 경쟁PT Hall of Fame → **필터 가능** (연도/동아리/과제기업)
- 활동인증서 → **자동 발급 + 검증 URL + QR**
- DAM 파티 3종 → **1페이지 탭 전환**
- /clubs → **전국 지도 + 7개 핀 + 동아리별 상세**
- /archive → **2023~현재 필터링**
- /competition → **경쟁PT 전용 워크스페이스**
- /growth → **Universe 연계**

---

## 4. 데이터 모델 (Supabase)

### 네이밍 원칙

- 접두사: `mad_` (MADLeague 브랜드 전용)
- 8원칙 #6 준수: 모든 테이블 `tenant_id TEXT DEFAULT 'tenone'`
- brand_id는 implicit (mad_* = madleague brand)

### Phase 1 테이블 (8개)

1. mad_clubs — 동아리 (7개 시드)
2. mad_cohorts — 활동연도 + 기수
3. mad_competitions — 경쟁PT
4. mad_competition_results — 결과 + MAD Crown
5. mad_archive — 2023~현재 작품
6. mad_articles — MADzine
7. mad_applications — 지원서
8. mad_hero_applications — HeRo 상담 신청

### Phase 2 추가

- mad_members, mad_competition_teams, mad_submissions
- mad_certificates (자동 발급)
- mad_posts, mad_comments

### Phase 3 추가

- mad_growth_hero, mad_growth_badak, mad_growth_crew
- mad_dam_applications

상세 스키마는 `sql/madleague_phase1.sql` 참조.

---

## 5. 인증서 시스템

### 인증서 유형

| 유형 | 트리거 | 내용 |
|------|--------|------|
| 활동인증서 | 활동연도 종료 자동 | 이름, 동아리, 활동연도, 참여 프로그램 |
| 경쟁PT 참여 확인서 | 제출 완료 | 경쟁PT 명, 과제기업, 참여 기간 |
| 수상 확인서 | 수상 기록 | 대회명, 수상 내역, 날짜 |
| MAD Crown 인증서 | Crown 수여 | 팀명, 과제기업, Crown 수여 사실 |

### 검증

- `/certificate/verify/[code]` — Public
- QR 코드 포함
- 기업 인사담당자 진위 확인

---

## 6. 디자인 시스템

### 브랜드 컬러

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--mad-red` | #EC1D25 | Primary |
| `--mad-black` | #000000 | 배경 (다크) |
| `--mad-gold` | #FFC000 | MAD Crown |
| `--mad-white` | #FFFFFF | 배경 (라이트) |
| `--mad-gray` | #F5F5F5 | 서브 |

### 모드

- 기본: **다크** (--mad-black 배경)
- 콘텐츠 영역(MADzine, Archive): 라이트
- 전환 가능, 기본 다크

### 타이포

- 한글: Pretendard
- 영문 Display: 볼드 산세리프
- Numbers: 탭룰러

### 캐릭터

DAMbe(담비) — 로딩, Empty State, 에러, 인증서 워터마크

---

## 7. 도메인 전략

| 단계 | 도메인 | 용도 |
|------|--------|------|
| 개발 중 | tenone.biz/madleague | 개발·테스트 |
| 스테이징 | madleague.tenone.biz | 스테이징 |
| 런칭 후 | madleague.net | 프로덕션 |

---

## 8. 개발 우선순위

### Phase 1 — 얼굴 (4주)

Home / About+Awards / Clubs / Programs / MADzine / Archive / Apply / HeRo
**DB:** mad_clubs, mad_cohorts, mad_competitions, mad_competition_results, mad_archive, mad_articles, mad_applications, mad_hero_applications

### Phase 2 — 멤버 (4주)

Member Dashboard / Projects / Portfolio / Certificate / Competition Workspace / Community
**DB:** mad_members, mad_competition_teams, mad_submissions, mad_certificates, mad_posts, mad_comments

### Phase 3 — 성장 (3주)

Growth (Career / Network / Crew) / DAM 참가 신청 / 인증서 검증
**DB:** mad_growth_*, mad_dam_applications

---

## 9. 콘텐츠 이관

| 콘텐츠 | 현 위치 | 이관 대상 | 우선순위 |
|--------|--------|----------|---------|
| MADzine 아티클 | /59 | mad_articles | Phase 1 |
| 경쟁PT Hall of Fame | /pt | mad_competitions + mad_archive | Phase 1 |
| 공모전/프로젝트 | /pinboard | mad_posts | Phase 2 |
| 동아리 소식 | /dongart_news | mad_articles (news) | Phase 1 |
| 자유게시판 | /freeboard | mad_posts | Phase 2 |
| DAM 히스토리 | /DAMHistory | mad_programs + mad_archive | Phase 1 |
| 회원 데이터 | imweb 회원 | mad_members | Phase 2 |

---

## 10. TenOne Intra 연동

MADLeague 사이트에 Admin 없음. 모든 관리는 TenOne Intra에서.
같은 Supabase DB 공유 → 실시간 반영.

### Intra 관리 항목

멤버/동아리/경쟁PT/프로그램/인증서/지원서/MADzine/아카이브
