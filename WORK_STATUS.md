# 작업 현황

> 마지막 업데이트: 2026-03-23 (집, 2차)

## 오늘 한 작업 (2차)

### TenOne 내 SmarComm 대시보드 개선
- 모바일 사이드바: 아이콘 모드(56px) 상시 + 펼치면 오버레이
- 데스크탑 사이드바: 208px/56px 접기/펼치기
- 반응형 브레이크포인트 lg(1024px) 적용
- 우측 패널 (RightPanel): TODO, 추천 블로그, 가이드, 팀 채팅
  - 넓은 화면 기본 펼침, 좁은 화면 접힘+오버레이
- 스캔 페이지 반응형 (URL입력/게이지/비교 섹션)
- 차트 overflow 수정 (LineChart clipPath)
- 요금제 5단계 (Free/Standard/Pro/Premium/Ultra) + 비교표
- 메인 GEO&SEO 검색 → 로그인 유저 워크스페이스 연결
- 워크스페이스 설정: 로고 드래그앤드롭 업로드
- 사이드바 상단: 회사명 표시 (로고 설정 링크 제거)

### 이전 작업 (1차)
- RooK 사이트 신규 생성, YouInOne WordPress 콘텐츠 반영
- 도메인 연결, Footer copyright 통일, globalConfig
- Supabase Auth (Google + Kakao OAuth)
- members 테이블 + 마스터 계정
- siteConfig authMethods (SmarComm 이메일만)
- middleware 개선

## 현재 이슈 ⚠️
- **소셜 로그인 후 로그인 상태 전환 안 됨**: SIGNED_IN 이벤트는 발생하지만,
  members 테이블 조회 후 setUser → 페이지 전환이 안 되는 문제.

## 다음에 할 일
- [ ] 소셜 로그인 문제 해결 (라이브에서 최신 배포 확인)
- [ ] 소셜 가입 후 프로필 완성 페이지 유도
- [ ] 인력 구분 · 권한 체계 재설계
- [ ] HeRo 사이트 생성
- [ ] CMS 게시판 설정 (Imweb 수준)
- [ ] 브랜드 아이덴티티 체계 마무리 (SiteConfig nav/footerLinks)
- [ ] 디버그 로그 제거 (문제 해결 후)

## Vercel 배포 정보
- URL: https://tenone.vercel.app → tenone.biz (연결됨)
- 추가 도메인: youinone.com (연결됨)
- 자동 배포: git push origin master → 자동 빌드+배포
- 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

## 주의사항
- Tailwind CSS v4, Next.js 16 + React 19
- Mock 데이터 기반 (Supabase 연동 시작 단계)
- 멀티 사이트: TenOne/MADLeague/YouInOne/RooK/SmarComm/HeRo (middleware 도메인 분기)
- 새 사이트 추가 시 SITE_GUIDE.md 체크리스트 참조
