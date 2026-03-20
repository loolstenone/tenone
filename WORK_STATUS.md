# 작업 현황

> 마지막 업데이트: 2026-03-20 (집)

## 오늘 한 작업

### 구조 대통합
- 4개 독립 프로젝트(web/, erp/, marketing/, wiki/) → 단일 Next.js 프로젝트로 통합
- office/ 폴더 리네이밍 시도 후 최종적으로 프로젝트 루트(`C:\Projects\TenOne\`)로 통합
- 모든 내부 시스템을 `/intra` 하위로 배치:
  - `/intra` — Intra 홈 (공지, 일정, 퀵링크)
  - `/intra/studio` — 콘텐츠 제작 포털
  - `/intra/erp` — 사내 관리 포털
  - `/intra/marketing` — 마케팅 포털
  - `/intra/wiki` — 교육/온보딩
  - `/intra/cms` — 사이트 콘텐츠 관리

### Intra 홈 구현
- 직원 대상 공지사항 게시판
- 기업 스케줄 일정 위젯
- 상단 통계 카드 (Active Staff, Campaigns, Leads, GPR Goals)
- 퀵링크 카드 제거 (상단 네비에 이미 있으므로 중복)

### 기업 격언 시스템
- 100개 격언 리스트 작성 (TenOne Culture 기반)
- Intra 홈 인사말 하단에 랜덤 표시 적용

### 기타
- `.next/` 캐시 git 추적 제거
- `.git/` 용량 정리 (305MB → 92MB)
- GitHub push 완료 (loolstenone/tenone)
- 96번 격언("Ten:One™ — 열 개의 가치, 하나의 세계관") 삭제 후 대체

## 현재 진행 중
- 없음 (깔끔하게 정리 완료)

## 다음에 할 일
- [ ] Intra 각 섹션(Studio/ERP/Marketing/Wiki/CMS) 페이지 콘텐츠 보강
- [ ] 직원 프로필 vs 개인/기업 프로필 분리 구현
  - 직원: ERP 연동, 소속 로고, 사번, GPR 탭
  - 개인/기업: 기본 정보 수정
- [ ] 프로필 사진 업로드 기능
- [ ] 직원 등록 기능 (ERP HR)
  - 사번 체계: YYYY-NNNN
  - 조직(부서) 매칭
  - 시스템 접근 레벨 (중복 선택)
- [ ] 조직 설계 기능 (관리부서/사업부서/제작부서/지원부서)
- [ ] GPR 기능 (목표 설정, 합의, 자기평가, 상사평가)
- [ ] 권한 매트릭스 설계 (부서×기능별 접근 권한)
- [ ] Favicon PNG 적용 (현재 화질 이슈)
- [ ] 모바일 반응형 점검
- [ ] 소셜 로그인 준비

## 주의사항
- Tailwind CSS v4 사용 중
- Next.js 16 + React 19
- 모든 데이터는 Mock (새로고침 시 리셋)
- 브랜드 가이드: 문장 내 Ten:One™ 사용 필수
- 로고: 첨부 이미지 파일 사용 (SVG 재현 금지)
- 프로젝트 루트가 곧 Next.js 프로젝트 (별도 하위 폴더 없음)
