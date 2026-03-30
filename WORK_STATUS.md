# 작업 현황

> 마지막 업데이트: 2026-03-30 (사무실 야간)

## 오늘 한 작업 (3/30 사무실 전체)

### WIO Glossary v1 → 7계층 정렬 ✅
- 사이드바 서비스 계층 (16서비스), 설정 서비스 모드 탭

### COM-AI → Agent Hub 실연결 ✅
### SYS-USR 사용자 관리 실DB ✅
### 프로젝트 타임라인 SNS형 피드 ✅
### COM-WCL + MY-HR 실DB 연동 ✅
### 마케팅 campaign 실DB ✅

### TenOne 게시판 고도화 ✅
- PATCH API, 수정 버튼 (로그인 사용자), BoardPage onEdit 전달

### TenOne 뉴스룸 재설계 ✅
- 유니버스 콘텐츠 허브 (LIVE 티커 + 브랜드 피드 + API)
- 홈 "새로운 소식" 뉴스룸 피드 API 통일

### Contact 관리자 + 정리 ✅
- inquiry/page.tsx 풀 CRUD, 회원가입 탭 제거

### MyVerse 랜딩 페이지 ✅
- 기획서 v1 기반 8섹션 (Hero→Fear→Bridge→HowItWorks→AppPreview→AI→Why→CTA)
- 라이트 테마 + flow.team 톤앤매너
- 이메일 수집 CTA (Supabase early_access)
- "안녕! 싸이월드, 카카오스토리 ㅠㅠ" 그라데이션

### 인트라 로그인 버그 수정 ✅ (크리티컬)
- window.location.reload() → setStatus("ok") 전환 (React hydration #418 해결)
- members 조회 5초 타임아웃 추가

### DNS 정리
- auth A 레코드 삭제 (CNAME 충돌), trendhunter → mindle 대체

---

## 다음 할 일 (집에서 이어서)

### 즉시 — 안정화
1. Multiple GoTrueClient 경고 근본 해결 — auth-context와 intra layout에서 createClient 중복 생성 통합. `lib/supabase/client.ts`의 싱글톤이 왜 안 먹히는지 조사 필요. 현재 auth-context.tsx(line ~20)에서 별도 createClient 호출 여부 확인.
2. posts 400 Bad Request — 네트워크 탭에서 발견. API 쿼리 파라미터 문제 가능성.

### 단기
3. CRM DB 테이블 생성 + 모듈 실DB
4. 마케팅 나머지 13개 모듈 DB 테이블
5. MyVerse 앱 프로젝트 초기화 (Expo + React Native)
6. 뉴스룸 상세 페이지 — 타 브랜드 게시물 외부 링크 처리

### 중기
7. 설정 서비스/모듈 → Supabase 저장 (localStorage → DB)
8. Rule Engine + Event Bus 구현
9. SmarComm 독립 배포

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v2.md, docs/Myverse_Landing_Dev_Guide_v1.md
- 개발 현황: docs/PROJECT_STATUS.md
