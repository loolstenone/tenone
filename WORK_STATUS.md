# 작업 현황

> 마지막 업데이트: 2026-03-30 (집, 야간 퇴근)

## 오늘 한 작업 (3/30 집)

### DB 안정화 + 실연동
1. posts 400 Bad Request 수정 ✅
2. GoTrueClient 싱글톤 확인 ✅
3. CRM DB 테이블 + 실DB 연동 ✅
4. 마케팅 13모듈 DB 테이블 ✅
5. 뉴스룸 상세 페이지 개선 ✅

### Myverse v4 앱 개발
6. Myverse v4 전면 재구성 ✅ — v3(소셜 수집) → v4(Personal Blackbox) 전환
   - 탭: ME/LOG 2탭, 디자인: 흑백 모노톤
   - 로컬 DB (expo-sqlite 6테이블), Blackbox 모듈, Zustand 4스토어
7. Android Studio 설치 완료 ✅ — Panda2, SDK 35, cmdline-tools
8. Android 에뮬레이터 생성 + 실행 ✅ — Pixel 7 (API 35, x86_64)
   - JAVA_HOME, ANDROID_HOME 환경변수 설정
   - ADB reverse port forwarding 설정
9. Myverse 앱 UI 리디자인 ✅ — Reflectly 수준으로 업그레이드
   - 이모지(📷😄🔒) → lucide-react-native 벡터 아이콘 교체
   - 기분 이모지 → 컬러 원(금/주황/회/파/보) + 라벨
   - 온보딩: 불꽃 오브 + 프로그레스 바 + 애니메이션 전환
   - ME탭: 불꽃 애니메이션, 기분 카드, 캘린더 카드, 빈 상태 디자인
   - LOG탭: 사진/메모 액션 카드, 타임라인 빈 상태, 그라디언트 CTA
   - new.tsx: 사진 추가 영역, 무드 선택 컬러 원, Blackbox 토글
10. Expo Go 에뮬레이터 실행 확인 ✅ — 온보딩 화면 표시 성공

## 이전 작업 (3/30 사무실)

- WIO Glossary v1 → 7계층 정렬 ✅
- COM-AI → Agent Hub 실연결 ✅
- SYS-USR 사용자 관리 실DB ✅
- 프로젝트 타임라인 SNS형 피드 ✅
- COM-WCL + MY-HR 실DB 연동 ✅
- 마케팅 campaign 실DB ✅
- TenOne 게시판 고도화 (PATCH API, 수정 버튼) ✅
- TenOne 뉴스룸 재설계 (유니버스 콘텐츠 허브) ✅
- Contact 관리자 + 정리 ✅
- MyVerse 랜딩 페이지 ✅
- 인트라 로그인 버그 수정 ✅ (크리티컬)
- DNS 정리 (auth A 레코드 삭제, trendhunter → mindle)
- Myverse 개발 전략 검토 (별도 레포, Mac 필요)

---

## 다음 할 일

### 즉시 — Myverse 앱 (Android)
1. Expo Go 로딩 이슈 해결 — 번들 로딩 후 흰 화면/무한 로딩 간헐 발생. `adb reverse tcp:8081 tcp:8081` + Expo Go 캐시 초기화로 해결되지만 불안정. 원인: expo run:android가 index.js 엔트리를 기대 vs expo-router/entry 충돌 가능성. `C:\Projects\myverse\android` 폴더 삭제 후 Expo Go 방식으로 통일 필요.
2. Myverse 전용 Supabase 프로젝트 생성
3. 온보딩 실연결 + ME 탭 실데이터 + 캘린더 연동
4. LOG 핵심 (카메라/갤러리, AI 분류, 사진 자동 수집)

### 중기 — TenOne 고도화
5. 설정 서비스/모듈 → Supabase 저장 (localStorage → DB)
6. 마케팅 13모듈 Supabase CRUD + Context 실DB 전환
7. 모바일 반응형 점검 / npm run build 에러 0개

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v2.md, docs/Myverse_Dev_Guide_v3_final.md (G드라이브)
- MyVerse 랜딩 가이드: docs/Myverse_Landing_Dev_Guide_v1.md
- 개발 현황: docs/PROJECT_STATUS.md
