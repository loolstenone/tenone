# TenOne 인트라 구조 정리안

> 날짜: 2026-03-30
> 목적: 중복 메뉴 통합, 불필요한 모듈 정리, 역할 명확화

---

## 현재 구조 (11개 모듈)

```
인트라 사이드바
├── 1. Myverse      — 개인 포털 (대시보드/메신저/Todo/타임시트/결재/GPR/근태/급여/경비/포인트/Library)
├── 2. Townity      — 사내 커뮤니티 (공지/자유게시판/일정)
├── 3. Project      — 프로젝트 관리 (관리/Job/타임시트/Partner Pool)
├── 4. HeRo         — 인재 매칭 (HIT검사/이력서/커리어/퍼스널브랜딩)
├── 5. Evolution School — 교육 (전체 과정)
├── 6. SmarComm     — 마케팅 스튜디오 (Workflow/Schedule/Assets/Brands/Universe + Marketing + Opportunity)
├── 7. Wiki         — 지식 관리 (Culture/Onboarding/Handbook/FAQ/Library)
├── 8. ERP          — 기업 운영 (결재/GPR/HR/Project/경영관리/Finance/설정)
├── 9. BUMS         — 사이트 관리 (대시보드/통계/고객/문의/쇼핑/예약/프로모션/마케팅/사이트/게시판/콘텐츠/뉴스레터/일정/라이브러리)
├── 10. Universe    — 유니버스 관리 (대시보드/회원/구독/교육/예약/손익/게스트/개인정보)
└── 11. Agent       — AI 에이전트
```

---

## 문제점

| 문제 | 상세 |
|------|------|
| **Universe ↔ BUMS 중복** | 둘 다 "여러 사이트/서비스를 관리"하는 기능. 회원관리, 교육, 일정, 콘텐츠가 겹침 |
| **ERP ↔ WIO Orbi 중복** | ERP의 HR/Finance/결재/GPR 기능이 WIO Orbi에 더 정교하게 구현되어 있음 |
| **SmarComm ↔ smarcomm.biz 중복** | 인트라 SmarComm 스튜디오 vs 독립 사이트 smarcomm.biz |
| **Myverse 기능 산재** | 결재/GPR/근태/급여가 Myverse에도 있고 ERP에도 있음 |
| **HeRo 방향** | hero.ne.kr 독립 서비스로 전문화 예정 → 인트라에서 분리 필요 |
| **Evolution School** | Planner's로 브랜드 전환 |

---

## 정리안

### 삭제 대상 (5개 → 0개)

| 현재 모듈 | 처리 | 이유 |
|----------|------|------|
| **Universe** | 삭제 → BUMS에 통합 | BUMS와 기능 중복. 회원/구독/교육/이벤트 관리를 BUMS 하위로 이동 |
| **ERP** | 삭제 → WIO Orbi로 이관 | Orbi가 People/Goal/Finance/Approval 서비스로 더 정교. 인트라 ERP는 Orbi 바로가기로 대체 |
| **SmarComm** | 삭제 → smarcomm.biz 독립 | 마케팅 기능은 독립 사이트로. Orbi Marketing 서비스와도 중복 |
| **HeRo** | 삭제 → hero.ne.kr 독립 | HIT/이력서/커리어를 hero.ne.kr에서 전문화. 인트라에서는 링크만 |
| **Evolution School** | 삭제 → Planner's로 이관 | 교육 콘텐츠를 planners.tenone.biz로 이동 |

### 통합/변경 대상

| 현재 모듈 | 처리 | 상세 |
|----------|------|------|
| **Townity** | 유지 (커뮤니티) | MADLeague/MADLeap 커뮤니티 기능에 맞게 고도화 |
| **Wiki** | Townity에 통합 | Culture/Onboarding/Library → Townity의 "지식" 섹션으로 |

### 유지 대상

| 모듈 | 유지 이유 |
|------|----------|
| **Myverse** | 개인 포털 — 단, 결재/GPR/근태/급여는 Orbi 바로가기로 변경 |
| **Project** | 프로젝트 관리 — 핵심 업무 |
| **BUMS** | 사이트 관리 — Universe 기능 흡수하여 강화 |
| **Agent** | AI 에이전트 — 유지 |

---

## 정리 후 구조 (6개 모듈)

```
인트라 사이드바 (정리 후)
├── 1. Myverse      — 개인 포털
│   ├── Dashboard (오늘 할 일, 메시지, 일정)
│   ├── 메신저
│   ├── Todo
│   ├── 타임시트
│   ├── 포인트
│   └── → Orbi 바로가기 (결재/GPR/근태/급여)
│
├── 2. Townity      — 커뮤니티 + 지식
│   ├── 공지사항
│   ├── 자유게시판
│   ├── 전체 일정
│   ├── Culture (Wiki에서 이관)
│   ├── Handbook (Wiki에서 이관)
│   └── Library (Wiki에서 이관)
│
├── 3. Project      — 프로젝트 관리
│   ├── 프로젝트 관리
│   ├── Job 관리
│   ├── 타임시트
│   └── Partner Pool
│
├── 4. BUMS         — 사이트 + 유니버스 통합 관리
│   ├── 대시보드 (Universe 대시보드 흡수)
│   ├── 통계
│   ├── 통합 회원 (Universe에서 이관)
│   ├── 구독 관리 (Universe에서 이관)
│   ├── 고객 관리 / 고객문의
│   ├── 사이트 관리 / 게시판 / 콘텐츠
│   ├── 뉴스레터
│   ├── 교육 관리 (Universe에서 이관)
│   ├── 예약/이벤트 (Universe에서 이관)
│   ├── 손익 관리 (Universe에서 이관)
│   └── 개인정보 (Universe에서 이관)
│
├── 5. Agent        — AI 에이전트
│
└── ⚙️ 외부 서비스 바로가기
    ├── → WIO Orbi (orbi.tenone.biz) — ERP 기능
    ├── → SmarComm (smarcomm.biz) — 마케팅
    ├── → HeRo (hero.ne.kr) — 인재 매칭
    └── → Planner's (planners.tenone.biz) — 교육
```

---

## 이관 상세

### ERP → WIO Orbi 이관 매핑

| ERP 기능 | Orbi 서비스 | 비고 |
|----------|-----------|------|
| 전자결재 | Approval | 이미 구현 |
| GPR | Goal | STR-KPI, HR-EVL |
| HR (People/근태/급여/교육) | People + Finance | 이미 구현 |
| 경영관리 (계획/관리/분석) | Goal + Finance | STR-PLN, FIN-* |
| Finance (경비/법인카드/청구) | Finance | FIN-AP, FIN-AR |
| Project 손익 | Finance | 프로젝트 수익성 |
| 운영설정 (결재라인/권한/HR설정) | System | SYS-ORG, SYS-CFG |

### Universe → BUMS 이관

| Universe 기능 | BUMS 위치 | 비고 |
|-------------|----------|------|
| 유니버스 대시보드 | BUMS 대시보드에 통합 | 전체 현황 탭 추가 |
| 통합 회원 | BUMS > 고객 관리 확장 | 멤버 + 고객 통합 뷰 |
| 구독 관리 | BUMS > 구독 관리 (신규 메뉴) | |
| 교육 관리 | BUMS > 교육 관리 (신규 메뉴) | |
| 예약/이벤트 | BUMS > 예약 관리 | 기존 메뉴 확장 |
| 손익 관리 | BUMS > 통계에 통합 | 매출/손익 탭 |
| 게스트 관리 | BUMS > 고객 관리에 통합 | 게스트/회원 구분 |
| 개인정보 | BUMS > 개인정보 (신규 메뉴) | |

### Wiki → Townity 이관

| Wiki 기능 | Townity 위치 | 비고 |
|----------|-------------|------|
| Culture | Townity > 문화 | |
| Onboarding | Townity > 온보딩 | |
| Handbook | Townity > 핸드북 | |
| FAQ | Townity > FAQ | |
| Library | Townity > Library | Myverse Library와 공유 |

---

## 커뮤니티 기능 → MADLeague/MADLeap 반영

Townity의 커뮤니티 기능을 MADLeague/MADLeap에 맞게 고도화:

| 기능 | MADLeague 활용 | MADLeap 활용 |
|------|--------------|-------------|
| 공지사항 | 시즌 공지, 대회 일정 | 프로젝트 공지 |
| 자유게시판 | 동아리 간 소통 | 스터디룸 토론 |
| 일정 | 대회 일정, 워크숍 | 프로젝트 마일스톤 |
| Library | 대회 자료, 우수작 | 포트폴리오 레퍼런스 |

---

## 실행 순서

```
Phase 1: 코드 정리 (삭제)
  1. Wiki 메뉴 → Townity에 통합
  2. Universe 메뉴 → BUMS에 통합
  3. Evolution School → 이름만 "Planner's"로 변경 후 분리
  4. HeRo 메뉴 → 외부 링크로 변경
  5. SmarComm 메뉴 → 외부 링크로 변경

Phase 2: ERP → Orbi 이관
  6. ERP 메뉴 → "WIO Orbi" 외부 링크로 변경
  7. Myverse의 결재/GPR/근태/급여 → Orbi 바로가기

Phase 3: 사이드바 재구성
  8. IntraSidebar.tsx modules 배열 재구성 (11 → 6모듈)
  9. 외부 서비스 바로가기 섹션 추가
```

---

## 주의사항

- **페이지 파일은 즉시 삭제하지 않는다** — 먼저 사이드바 메뉴에서 제거하고, 페이지는 나중에 정리
- **ERP 페이지의 우수한 기능은 Orbi에 반영** 후 삭제
- **데이터(DB 테이블)는 유지** — 메뉴만 재배치
- **URL은 당분간 유지** — 기존 북마크/링크 깨지지 않도록

---

*TenOne 인트라 구조 정리안 v1.0*
*2026-03-30*
