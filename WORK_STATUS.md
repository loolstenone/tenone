# 작업 현황

> 마지막 업데이트: 2026-03-30 (사무실 야간, 퇴근 전)

## 오늘 한 작업 (3/30 사무실)

### 코드 작업 (오전~오후)
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

### Myverse 개발 전략 검토 (야간)
- Myverse_Dev_Guide_v3_final.md 분석 완료
- **결론: 별도 레포로 분리 개발** (React Native Expo, 별도 Supabase)
- 웹 = 소개/랜딩 페이지만, 모든 기능은 앱
- 도메인: 큰 관심 없음. 단, 공유 URL은 짧게 가야 함 (my.tenone.biz/s/{id} 등)
- **Mac 필요**: iOS 로컬 빌드 + 시뮬레이터를 위해 맥북 구매 검토 중
  - M1 Air 16GB이면 충분 (Xcode + Android Studio + Claude Code 동시 구동)
  - Windows에서도 Android 개발 + EAS 클라우드 iOS 빌드는 가능하지만, Mac이 양쪽 다 네이티브 빌드 가능

---

## 다음 할 일

### 즉시 — TenOne 안정화
1. posts 400 Bad Request — 네트워크 탭에서 발견. API 쿼리 파라미터 문제 가능성. `app/api/board/posts/route.ts` 확인.
2. Multiple GoTrueClient — 싱글톤 통합 커밋(11976ed) 이후 재발 여부 모니터링.

### 단기 — TenOne
3. CRM DB 테이블 생성 + 모듈 실DB
4. 마케팅 나머지 13개 모듈 DB 테이블
5. 뉴스룸 상세 페이지 — 타 브랜드 게시물 외부 링크 처리

### 단기 — Myverse 앱 착수 준비
6. 맥북 구매 확정 후 → Expo 프로젝트 초기화 (`C:\Projects\myverse` 또는 Mac에서)
7. Myverse 전용 Supabase 프로젝트 생성
8. Myverse_Dev_Guide_v3_final.md를 프로젝트 CLAUDE.md로 정제

### 중기
9. 설정 서비스/모듈 → Supabase 저장 (localStorage → DB)
10. Rule Engine + Event Bus 구현
11. SmarComm 독립 배포

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v2.md, docs/Myverse_Dev_Guide_v3_final.md (G드라이브)
- MyVerse 랜딩 가이드: docs/Myverse_Landing_Dev_Guide_v1.md
- 개발 현황: docs/PROJECT_STATUS.md
