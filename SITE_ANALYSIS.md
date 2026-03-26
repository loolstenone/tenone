# 전체 사이트 종합 분석 보고서

> 분석일: 2026-03-26 (집)
> 분석 대상: TenOne 퍼블릭, WIO, SmarComm, Mindle, 기타 브랜드 (23개)

---

## 점수 요약

| 사이트 | 점수 | 페이지 수 | 핵심 상태 |
|--------|------|-----------|-----------|
| **TenOne 퍼블릭** | 7/10 | 12+ | UI 완성, 이미지/링크 미비 |
| **WIO** | 6.5/10 | 25+ | 마케팅 우수, 앱 모듈 Mock 의존 |
| **SmarComm** | 6.5/10 | 20+ | 랜딩 우수, 대시보드 백엔드 부재 |
| **Mindle** | 8.5/10 | 9 | 가장 완성도 높음, DB 연결됨 |
| **기타 브랜드** | 7.5/10 | 50+ | 대부분 완성, 소수 Mock 잔여 |

---

## 🔴 CRITICAL — 즉시 수정 필요

| # | 사이트 | 이슈 | 영향 |
|---|--------|------|------|
| 1 | **WIO** | `/contact` 페이지 없음 — 모든 "상담 신청" CTA가 404 | 전환 경로 끊김 |
| 2 | **WIO** | 이메일 인증 플로우 없음 — 가입 후 "이메일 확인" 표시만 됨 | 실제 가입 완료 불가 |
| 3 | **WIO** | 프로젝트 상세 페이지 없음 (`/wio/app/project/{id}`) | 핵심 기능 미완성 |
| 4 | **WIO** | Settings 페이지 전부 읽기 전용 — CRUD 없음 | 조직/멤버 관리 불가 |
| 5 | **SmarComm** | "개발중" 15+ 페이지가 사이드바에 노출 | 사용자 UX 혼란 |
| 6 | **SmarComm** | TierGate 인증이 localStorage 기반 — 클라이언트에서 우회 가능 | 보안 취약 |
| 7 | **TenOne** | Universe 페이지가 `/about?tab=universe`로 리다이렉트만 | 빈 페이지 |
| 8 | **TenOne** | hero-banner.png 등 이미지 에셋 부재 | 홈페이지 깨짐 |

---

## 🟡 HIGH — 스프린트 내 수정

| # | 사이트 | 이슈 |
|---|--------|------|
| 9 | **WIO** | 비밀번호 재설정 플로우 없음 |
| 10 | **WIO** | 모듈 접근 제어 없음 — Starter 유저도 Enterprise 모듈 전체 접근 |
| 11 | **WIO** | Timesheet 데이터 하드코딩 → Supabase 연결 필요 |
| 12 | **WIO** | Sales 모듈: 상태 업데이트 불가, 파이프라인 뷰 없음 |
| 13 | **SmarComm** | `/api/scan`, `/api/advisor/campaign-plan` 엔드포인트 미구현 |
| 14 | **SmarComm** | scan/대시보드 데이터 전부 localStorage 의존 → DB 마이그레이션 필요 |
| 15 | **SmarComm** | 멤버 초대 기능이 로컬 state만 변경 — 실제 API 미연결 |
| 16 | **SmarComm** | Pricing CTA가 `/meeting`으로 가는데 해당 페이지 없음 |
| 17 | **TenOne** | 로그아웃 버튼 한/영 혼용 (데스크톱 "Logout" vs 모바일 "로그아웃") |
| 18 | **TenOne** | Privacy Policy / Terms of Service 링크 비활성 (텍스트만) |
| 19 | **TenOne** | Brands 페이지에 헤더/푸터 래퍼 누락 |
| 20 | **Mindle** | Newsletter 구독 폼이 Supabase 미연결 (TODO 주석 남아있음) |

---

## 🟢 MEDIUM — 다음 스프린트

### WIO
- Sales 칸반(Kanban) 보드 뷰 추가
- People 멤버 프로필 상세 페이지
- Content 모듈 리치텍스트 에디터
- Insight 드릴다운 + 기간 필터
- Finance 결재 체인/코멘트
- Talk 댓글/스레딩
- Learn 실제 코스 콘텐츠 + 퀴즈
- Wiki 편집/버전관리
- Timesheet PM 승인 로직
- 반응형 모바일 최적화 (사이드바, 테이블)

### SmarComm
- 실제 결제/빌링 연동
- 리포트 PDF/CSV 내보내기
- 실시간 데이터 갱신 (polling 또는 subscription)
- 대시보드 차트 드릴다운
- A/B 테스트 프레임워크
- GA4 트래픽 연동
- CRM 채널별 관리

### TenOne 퍼블릭
- Contact 폼 유효성 검증 (이메일, URL)
- 브랜드 URL 대소문자 통일
- API 에러 핸들링 + fallback UI
- OG 이미지 / 소셜 메타데이터 설정
- Works/Newsroom 상세 페이지 이미지
- My 페이지: 북마크 API, 작성자 필터

### Mindle
- 크롤러 cron 실행 확인 (Vercel 배포 후)
- Admin AI 분석 → Claude API 연결
- Newsletter 구독자 DB 테이블 + 실제 저장
- About 페이지 콘텐츠 보강

---

## 사이트별 상세 분석

### TenOne 퍼블릭 (7/10)

**강점:**
- 홈 히어로 섹션 강력한 메시지
- Works/Newsroom Supabase 연동
- 다크/라이트 모드 지원
- Crew 모집 섹션 효과적

**약점:**
- 이미지 에셋 부재 (hero-banner, 브랜드 로고/썸네일)
- Universe 페이지 리다이렉트만 (실제 콘텐츠 없음)
- 한/영 UI 텍스트 혼용
- Privacy/Terms 링크 비활성
- 일부 페이지(Brands, History) 헤더/푸터 래퍼 누락

---

### WIO (6.5/10)

**강점:**
- 마케팅 사이트 완성도 높음 (5종 랜덤 카피, 5F 사이클, 모듈 그리드)
- 10개 앱 모듈 전체 UI 구현
- Timesheet 모듈 거의 프로덕션 수준
- 일관된 인디고 테마

**약점:**
- `/contact` 페이지 미존재 (CTA 전환 끊김)
- 이메일 인증/비밀번호 재설정 없음
- 프로젝트 상세 페이지 미구현
- Settings 전부 읽기 전용
- 모듈 접근 제어 없음 (plan별 제한 미적용)
- 대부분 모듈 Mock 데이터 의존
- 에러 핸들링 부재
- `any` 타입 다수 사용

---

### SmarComm (6.5/10)

**강점:**
- 랜딩 페이지 UTM 기반 동적 헤드라인 (37종)
- 스캔 진행 UI 우수
- 대시보드 멀티탭 인터페이스
- 게이지/레이더/라인 차트 커스텀 구현

**약점:**
- "개발중" 15+ 페이지가 네비에 노출 → 피처플래그 필요
- TierGate 보안 취약 (localStorage 기반)
- 스캔 API 미구현 (프론트만 존재)
- 전부 localStorage/sessionStorage 의존 → 서버 DB 필요
- 로그인/가입 페이지가 리다이렉트 스텁만
- 멤버 초대/관리 Mock only
- 에러 메시지 부재 또는 generic

---

### Mindle (8.5/10)

**강점:**
- 전 페이지 영문, 일관된 다크 테마
- Supabase 실데이터 연결 (Admin, RSS 크롤러)
- 콘텐츠 파이프라인 구축 (수집→분석→초안)
- 2단 → 1단 헤더 정리 완료
- Newsletter 페이지 + Admin 검색/필터/AI 트리거

**약점:**
- Newsletter 구독 DB 미연결 (TODO)
- RSS 크롤러 2개 피드 교체 완료, cron 배포 후 확인 필요
- AI 분석이 rule-based (Claude API 연결 전)

---

### 기타 브랜드 (7.5/10)

| 브랜드 | 페이지 | 품질 | 이슈 |
|--------|--------|------|------|
| RooK | 7 | 높음 | 없음 |
| Badak | 13 | 양호 | 입력 placeholder만 |
| MADLeague | 11 | 양호 | 1개 Mock 배열, 1개 placeholder 주석 |
| YouInOne | 8 | 높음 | 없음 |
| 0gamja | 6 | 양호 | 기본 구조 |
| Seoul360 | 5 | 양호 | 기본 구조 |
| HeRo | 6 | 양호 | DB 연결됨 |
| 나머지 16개 | 각 3~5 | 기본 | 홈+About+My 기본 구조 |

---

## 액션 플랜

### Sprint 1: 즉시 수정 (코드만)
1. [ ] WIO `/contact` 페이지 생성 (상담 신청 폼)
2. [ ] SmarComm "개발중" 페이지 네비에서 숨김 (피처플래그)
3. [ ] TenOne Universe 페이지 실제 콘텐츠 렌더링
4. [ ] TenOne 한/영 UI 통일 (로그아웃, 네비 등)
5. [ ] TenOne Privacy/Terms 페이지 생성 또는 링크 연결
6. [ ] Mindle Newsletter Supabase 연결

### Sprint 2: 핵심 기능 (백엔드 포함)
7. [ ] WIO Settings CRUD (조직/멤버/모듈/브랜딩)
8. [ ] WIO 프로젝트 상세 페이지 (팀/타임라인/예산/태스크)
9. [ ] WIO 이메일 인증 + 비밀번호 재설정
10. [ ] WIO 모듈 접근 제어 (plan → activeModules 필터링)
11. [ ] SmarComm 스캔 API 실제 구현
12. [ ] SmarComm TierGate 서버 인증 전환

### Sprint 3: 고도화
13. [ ] WIO Sales 칸반 뷰 + 상태 업데이트
14. [ ] WIO Timesheet Supabase 연결
15. [ ] SmarComm localStorage → Supabase 마이그레이션
16. [ ] SmarComm 결제/빌링 연동
17. [ ] TenOne 이미지 에셋 정리 (hero-banner, 브랜드 로고)
18. [ ] 전체 에러 핸들링 + 로딩 상태 통일

### Sprint 4: 폴리시
19. [ ] WIO 반응형 모바일 최적화
20. [ ] SmarComm 리포트 PDF 내보내기
21. [ ] 전체 접근성 개선 (ARIA, 컬러 대비)
22. [ ] 전체 TypeScript `any` 제거
23. [ ] OG 이미지 / SEO 메타데이터

---

## 코드 품질 공통 이슈

### 반복 패턴
- `catch {}` 빈 에러 핸들링 → 최소 `console.error` 추가 필요
- `any` 타입 남용 → 인터페이스 정의 필요
- 하드코딩된 색상값 → CSS 변수 또는 디자인 토큰으로
- Tab/Badge/Modal 패턴 중복 → 공유 컴포넌트 추출
- localStorage 과의존 → 서버 DB 마이그레이션

### 긍정 패턴
- TypeScript strict mode 준수
- Tailwind 유틸리티 일관 사용
- Supabase SSR/Client 분리 잘 됨
- 다크/라이트 테마 변수 체계적
- 브랜드별 헤더/푸터 컴포넌트 분리 일관됨
