# WIO 모듈 사용 맵 v2 — 전면 재설계

> "작은 브랜드는 없다. 모든 브랜드는 커뮤니티이고, 커뮤니티에는 체계가 필요하다."
> Ten:One은 23개 브랜드를 종합 관리한다.

---

## 핵심 인식 전환

**v1의 실수**: 브랜드를 "크다/작다"로 분류했다.
**v2의 원칙**: 모든 브랜드는 **커뮤니티**다. 규모만 다를 뿐 필요한 관리 체계는 동일하다.

모든 커뮤니티에 필요한 것:
```
1. 멤버 관리 — 누가 있는가, 어떤 역할인가
2. 소통 — 공지, 게시판, 일정
3. 콘텐츠 — 소식, 뉴스레터, 아카이브
4. 활동 관리 — 프로젝트, 이벤트, 프로그램
5. 성과 추적 — 멤버 성장, KPI, 통계
6. 관리자 도구 — 권한, 설정, 대시보드
```

---

## 브랜드 유형별 필요 체계

### Type A: 운영 조직 (수익 사업)
> TenOne, WIO, SmarComm, HeRo, Brand Gravity, RooK, Naming Factory

**특징**: 프로젝트 기반 수익, 클라이언트 관리, 재무/정산 필수

```
Core: Home · Project · Sales · Finance · Timesheet · Insight
Operations: People · Approval · HR · GPR
Content: Content · Wiki
AI: AI Assistant · AI Creative
```

### Type B: 커뮤니티 조직 (인재 · 네트워크)
> MADLeague, MADLeap, Badak, domo, FWN, YouInOne Alliance

**특징**: 멤버 풀 관리, 이벤트/프로그램, 커뮤니티 콘텐츠, 인재 파이프라인

```
Core: Home · People · Talk · Content
Community: 멤버 프로필 · 가입/탈퇴 · 등급/포인트 · 활동 이력
Programs: Project(프로그램/경연) · Learn(교육) · GPR(성장 추적)
Events: Talk 일정 · 참가 관리 · 후기
Pipeline: HeRo 연계 · 추천 · 매칭
Analytics: Insight · 멤버 활동 통계
```

### Type C: 콘텐츠 플랫폼
> Mindle, 0gamja, Seoul360, Jakka, MoNTZ

**특징**: 콘텐츠 생산/발행, 구독자 관리, 트래픽 분석

```
Core: Home · Content · Insight
Production: AI Creative · AI Crawler (Mindle)
Distribution: 뉴스레터 · SNS · 블로그
Community: People(구독자/기여자) · Talk(댓글/포럼)
Analytics: 조회수 · 구독자 · 키워드
```

### Type D: 교육 조직
> Evolution School, Planner's, ChangeUp

**특징**: 교육 과정 운영, 수강생 관리, 수료/인증

```
Core: Home · Learn · People · Content
Education: 과정 관리 · 출석 · 퀴즈 · 수료증
Community: Talk · Wiki
Pipeline: HeRo 연계 (수료→인재 등록)
Commerce: Shop(교재/굿즈)
```

### Type E: 지역/특화 커뮤니티
> Townity, Mullaesian, NatureBox, Myverse

**특징**: 지역 기반, 특정 관심사 중심

```
Core: Home · Talk · People · Content
Local: 일정/이벤트 · 장소 · 지역 정보
Commerce: Shop (NatureBox 등)
Personal: Wiki/기록 (Myverse)
```

---

## 서비스별 상세 (v2)

### 🔴 MADLeague — 전국 대학생 동아리 연합

**MADLeague는 작지 않다.**
- 전국 7개 대학 거점
- 기수제 운영 (현재 8기)
- 경연 PT (기획안 경쟁)
- 교육 프로그램
- 콘텐츠 (MADzine)
- 인재 파이프라인 (→HeRo)

```
필수 모듈:
├── Home          — 리거 대시보드. 오늘 할 일, 공지, 일정
├── People        — 리거 DB. 기수별, 대학별, 역할별 관리
│                   프로필, 역량, 활동 이력, 포인트, 등급
├── Project       — 경연 PT 관리. 팀 구성, 제출, 심사, 결과
│                   Idea Movement, 기획안 아카이브
├── Talk          — 공지사항, 자유게시판, Q&A, 기수별 채널
│                   일정 (경연, 세미나, MT, 총회)
├── Content       — MADzine 원고 관리, 발행
│                   SNS 콘텐츠, 활동 사진/영상
├── Learn         — 마케팅 기초, 기획 방법론, PT 스킬
│                   Planner's Vrief·GPR 연계 교육
├── GPR           — 리거 개인 성장 목표 관리
│                   기수별 KPI (참여율, 성장률, 수료율)
├── Insight       — 기수별 활동 통계, 대학별 비교
│                   인재 파이프라인 현황 (→HeRo 전환율)
└── Wiki          — 운영 매뉴얼, 역대 경연 아카이브

보조:
├── Finance       — 회비 관리, 행사 예산 (간단)
├── AI Assistant  — 경연 PT 피드백, 기획안 검토
└── 활동인증서     — 수료/참여 인증서 자동 발급
```

**일상 시나리오**:
- **월요일**: Talk 공지에 주간 일정. People에서 신규 리거 승인 3명
- **화요일**: Project "8기 3차 경연 PT" — 5팀 기획안 제출 마감. 심사위원 배정
- **수요일**: Learn "마케팅 리서치 방법론" 온라인 강의 (Badak 멘토 강사)
- **목요일**: Content MADzine 5월호 원고 마감. 편집장 검수
- **금요일**: GPR 리거별 주간 성장 지표 업데이트. Insight에서 기수 활동률 체크
- **월말**: People에서 우수 리거 데이터 → HeRo에 인재 추천
- **분기**: Insight에서 전체 리그 성과 리포트. 차기 기수 기획

**TenOne 관리자가 보는 것**:
- 전체 리거 수, 기수별 활동률
- 경연 PT 참여율, 우수 팀
- HeRo 전환율 (리거→인재 등록)
- 대학별 거점 현황

---

### 🌙 Badak — 현업 네트워킹 (등록 9,000명)

**Badak은 9,000명 규모의 현업 네트워크.**

```
필수 모듈:
├── Home          — 네트워크 피드. 새 멤버, 새 글, 이벤트
├── People        — 9,000명 프로필 DB
│                   업종/직종/경력/스킬 태그
│                   바닥 스타 (추천 멤버)
│                   연결 요청/수락 시스템
├── Talk          — 커뮤니티 게시판 (업종별 방)
│                   Q&A, 고민 상담, 정보 공유
│                   일정 (DAM 네트워킹 이벤트)
├── Content       — 바닥 인사이트 뉴스레터
│                   멤버 기고 콘텐츠
│                   바닥이란 (소개 콘텐츠)
├── Insight       — 회원 활동 통계, 업종별 분포
│                   연결 네트워크 분석
│                   이벤트 참석률
├── AI Matching   — 멤버 간 매칭 추천
│                   "이 사람을 알면 좋겠어요"

보조:
├── Shop          — 유료 멤버십, 프리미엄 기능
├── Learn         — 멘토 특강, 직무 교육 (→Evo School 연계)
├── Project       — 협업 프로젝트 (멤버 간 비즈니스)
└── Finance       — 유료 이벤트 결제, 멤버십 정산
```

**TenOne 관리자가 보는 것**:
- 총 회원 수, 월간 신규/이탈
- DAM 이벤트 참석률
- 멘토 풀 현황 (→Evo School 강사 후보)
- SmarComm 클라이언트 소스 전환율

---

### 💜 0gamja — 공감 콘텐츠 커뮤니티

**0gamja는 "작은 브랜드"가 아니다. 중고대학생 마음을 돌보는 커뮤니티.**

```
필수 모듈:
├── Home          — 오늘의 영감, 추천 콘텐츠
├── Content       — 공감 콘텐츠 (글, 일러스트, 영상)
│                   작가 기고 관리, 발행 스케줄
├── People        — 작가 DB, 구독자 관리
│                   상담사 프로필 (향후)
├── Talk          — 커뮤니티 (고민 나눔, 응원 게시판)
│                   익명 글 지원

보조:
├── Insight       — 콘텐츠 조회수, 공감 수, 구독자 추이
├── Shop          — 굿즈 (스티커, 엽서, 다이어리)
├── AI Creative   — 공감 카드, 일러스트 소재 생성
└── Learn         — 자기계발 미니 강의 (→MADLeague 이전 단계)
```

**Universe에서의 역할**: MADLeague 이전 가장 이른 접점. 여기서 마음이 움직인 학생이 MADLeague로 유입.

---

### 🟤 domo — 시니어 비즈니스 네트워킹

```
필수 모듈:
├── Home          — 네트워크 피드, 이벤트 일정
├── People        — 시니어 비즈니스맨 프로필
│                   업종/경력/관심사/멘토링 가능 분야
├── Talk          — 네트워킹 게시판, 사업 제안, 조언
│                   일정 (비즈니스 모임, 골프, 식사)
├── Content       — 비즈니스 인사이트, 멤버 칼럼

보조:
├── Project       — 공동 사업 제안, 협업 프로젝트
├── Insight       — 멤버 활동, 모임 참석률
└── Sales         — B2B 기회 공유 (→SmarComm 연계)
```

---

### 👗 FWN — 패션 네트워크

```
필수 모듈:
├── Home          — 패션위크 일정, 뉴스 피드
├── People        — 패션 종사자 프로필 (디자이너/바이어/에디터/모델)
├── Content       — 패션위크 소식, 트렌드 리포트, 화보
├── Talk          — 업계 게시판, 채용 정보, 이벤트

보조:
├── Project       — 패션 프로젝트 (쇼, 화보, 캠페인)
├── Insight       — 트렌드 분석, 키워드 (→Mindle 연계)
└── AI Creative   — 패션 콘텐츠 소재 생성
```

---

### 🚀 ChangeUp — 창업 교육

```
필수 모듈:
├── Home          — 프로그램 일정, 공지
├── Project       — 창업 프로젝트 관리 (팀 구성, 발표, 심사)
├── Learn         — 창업 교육 과정, 멘토링 세션
├── People        — 참가자 + 멘토 + 투자자(학부모/학교) DB
├── Talk          — 팀별 소통, Q&A, 후기

보조:
├── Content       — 창업 사례, 참가자 스토리
├── GPR           — 팀별 마일스톤 관리
├── Finance       — 시드머니 관리, 상금
└── Insight       — 프로그램 성과 (창업 성공률, 참가자 만족도)
```

---

### 🏘️ Townity — 지역 커뮤니티

```
필수 모듈:
├── Home          — 우리 동네 피드, 오늘 일정
├── Talk          — 동네 게시판, 공동육아 방, 중고거래
│                   일정 (동네 모임, 행사)
├── People        — 이웃 프로필, 관심사 매칭
├── Content       — 동네 소식, 맛집, 가볼 곳

보조:
├── Shop          — 동네 장터, 공동구매
├── Project       — 마을 프로젝트 (환경, 축제, 봉사)
└── Insight       — 주민 참여율, 인기 게시글
```

---

### 기타 브랜드

| 브랜드 | 유형 | 핵심 모듈 | Universe 역할 |
|--------|------|----------|-------------|
| **MADLeap** | B 커뮤니티 | MADLeague와 동일 구조 (서울/경기 거점) | MADLeague 핵심 거점 |
| **MoNTZ** | C 콘텐츠 | Home·People·Content·AI Creative | 크리에이터 발굴 (→HeRo) |
| **Myverse** | E 특화 | Home·Wiki·People·Content | 개인 세계관 기록 |
| **Seoul360** | C 콘텐츠 | Home·Content·Talk·People | 서울 여행 가이드 |
| **Jakka** | C 콘텐츠 | Home·Content·People·Shop | 아티스트 포트폴리오+판매 |
| **NatureBox** | E+커머스 | Home·Shop·Content·Talk | 자연 식품 브랜드 |
| **Mullaesian** | E 지역 | Home·Talk·People·Content | 문래동 창작촌 |
| **Naming Factory** | A 수익 | Home·Project·Sales·Shop·Content | 네이밍+네임드림 |

---

## TenOne 종합 관리 대시보드

Ten:One은 23개 브랜드를 **한 화면에서** 관리해야 한다.

### Universe Dashboard (TenOne Admin)

```
┌─────────────────────────────────────────────────────────┐
│  Ten:One™ Universe Dashboard                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 전체 현황                                            │
│  ├── 총 멤버: 12,340명 (이번 달 +234)                    │
│  ├── 활성 프로젝트: 47개 (진행중 23, 완료 18, 대기 6)     │
│  ├── 이번 달 매출: 8,400만원 (SmarComm 4,200 + HeRo 2,100 + ...)  │
│  └── 콘텐츠 발행: 128건                                  │
│                                                          │
│  👥 브랜드별 멤버 현황                                    │
│  ├── Badak: 9,000명 (활성 2,100)                         │
│  ├── MADLeague: 480명 (8기 120명 활동중)                  │
│  ├── 0gamja: 1,200명 (구독자)                            │
│  ├── domo: 340명                                         │
│  └── ... (전체 23개)                                     │
│                                                          │
│  🔄 인재 파이프라인                                      │
│  MADLeague(120) → HeRo(34 추천) → 기업 매칭(12) → 성사(5) │
│                                                          │
│  📈 서비스별 KPI                                         │
│  ├── SmarComm: 수주율 34%, MRR 4,200만원                 │
│  ├── HeRo: 매칭 성공률 87%, 인재 풀 500+명               │
│  ├── Mindle: 일 수집 50건, 주간 리포트 구독자 3,200명     │
│  └── WIO: 외부 고객 3사, ARR 추적                        │
│                                                          │
│  ⚠️ 주의 필요                                            │
│  ├── MADLeague 8기 활동률 하락 (지난주 대비 -12%)         │
│  ├── Badak DAM 이벤트 참석률 저조 (목표 50명, 현재 23명)  │
│  └── SmarComm C사 프로젝트 마감 3일 전                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 관리자가 볼 수 있어야 하는 것

| 관점 | 보는 것 | WIO 모듈 |
|------|--------|----------|
| **멤버** | 전체 멤버 수, 브랜드별 분포, 신규/이탈, 활동률 | People + Insight |
| **수익** | 브랜드별 매출, 프로젝트별 손익, MRR/ARR | Finance + Insight |
| **프로젝트** | 진행 현황, 마감 임박, 리스크 | Project + Insight |
| **인재** | 파이프라인 (발굴→육성→매칭→데뷔), 전환율 | People + GPR + Insight |
| **콘텐츠** | 발행 수, 조회수, 구독자, 트렌드 키워드 | Content + Insight |
| **커뮤니티** | 게시글 수, 댓글 수, 이벤트 참석률 | Talk + Insight |
| **교육** | 수강률, 수료율, 만족도 | Learn + Insight |

---

## 모듈별 사용 빈도 (v2 재계산)

| 순위 | 모듈 | 사용 브랜드 수 | 비고 |
|------|------|-------------|------|
| 1 | **Home** | 23/23 (100%) | 모든 브랜드의 대시보드 |
| 2 | **People** | 22/23 (96%) | 멤버 관리는 모든 커뮤니티의 기본 |
| 3 | **Talk** | 21/23 (91%) | 소통 없는 커뮤니티는 없다 |
| 4 | **Content** | 21/23 (91%) | 콘텐츠 없는 브랜드는 없다 |
| 5 | **Insight** | 20/23 (87%) | 관리하려면 측정해야 한다 |
| 6 | **Project** | 16/23 (70%) | 경연, 캠페인, 프로그램 모두 프로젝트 |
| 7 | **Learn** | 12/23 (52%) | 교육 연계가 Universe 핵심 |
| 8 | **GPR** | 10/23 (43%) | 성장 추적이 필요한 곳 |
| 9 | **Shop** | 8/23 (35%) | 커머스, 멤버십, 굿즈 |
| 10 | **Sales** | 7/23 (30%) | 수익 사업 전용 |
| 11 | **Finance** | 7/23 (30%) | 수익 사업 + 회비 관리 |
| 12 | **Wiki** | 7/23 (30%) | 지식 아카이브 |
| 13 | **Timesheet** | 6/23 (26%) | 프로젝트 시수 관리 |
| 14 | **Approval** | 4/23 (17%) | 결재 필요한 조직 |
| 15 | **HR** | 2/23 (9%) | 직원 관리 (TenOne, SmarComm) |
| 16 | **AI Creative** | 8/23 (35%) | 콘텐츠 자동 생성 |
| 17 | **AI Crawler** | 2/23 (9%) | Mindle + SmarComm |
| 18 | **AI Matching** | 3/23 (13%) | HeRo + Badak + SmarComm |
| 19 | **AI Assistant** | 12/23 (52%) | 모든 곳에서 AI 비서 |

**v1 → v2 변화**:
- People: 65% → **96%** (모든 커뮤니티에 멤버 관리 필수)
- Talk: 61% → **91%** (소통 없는 커뮤니티는 없다)
- Insight: 30% → **87%** (관리하려면 측정해야)
- Content: 78% → **91%**
- Learn: 35% → **52%** (교육이 Universe 핵심 가치)

**결론**: TOP 5 모듈(Home·People·Talk·Content·Insight)이 **87%+** 브랜드에서 사용. 이 5개를 완벽하게 만들면 Universe 전체가 돌아간다.

---

## 개발 우선순위 (v2)

```
1순위: Home · People · Talk · Content · Insight (87%+ 커버)
2순위: Project · Learn · GPR (52~70% 커버)
3순위: Sales · Finance · Shop · AI (30~35% 커버)
4순위: Timesheet · Approval · HR · Wiki (9~30% 커버)
```

**각 모듈의 완성 기준**:
- 멀티테넌트 (tenant_id 격리)
- CRUD 완전 동작
- 서버 사이드 권한 체크
- 모바일 반응형
- 로딩 상태 + 에러 핸들링
- 실시간 or 폴링 데이터 갱신
