# 작업 현황

> 마지막 업데이트: 2026-03-31 (사무실, 2차)

## 오늘 한 작업 (3/31)

### MyVerse + ERP DB 연동 완료
- myverse/gpr → gpr_goals 테이블 실DB 연동 ✅
- myverse/projects → fetchMyProjects DB 연동 ✅
- myverse/payroll, attendance, expenses → 이전 세션 완료 ✅
- myverse/approval → approvals 테이블 연동 ✅
- project/financials → projects 테이블 연동 ✅
- erp/settings/approval-line → approval_templates 테이블 연동 ✅
- sql/approval_templates.sql Prod 실행 완료 ✅

### 버그 수정
- GET /api/board/posts 500 에러 → is_secret, author_name 없는 컬럼 제거 ✅
- tags contains JSON.stringify 버그 수정 ✅
- api/newsroom/feed 브라우저 client → 서버 client 수정 ✅

### Director Priority 작업
- **Priority 1 (Phase 2)**: identity-context.tsx + useIdentityAdapter + IntraSidebar 3계층 연동 ✅
- **Priority 2**: features/[brand] 폴더 분리 — 46개 컴포넌트 이동, import 경로 전체 업데이트 ✅
- **Priority 3**: next.config.ts 캐시 헤더 설정 (마케팅 1h, 인트라 no-store, API no-store) ✅

### settings localStorage → Supabase DB 마이그레이션 (완료)
- lib/supabase/settings.ts: member_id/settings JSONB 스키마 전면 재작성 ✅
- lib/wio-modules.ts: loadOrbiConfigDB / saveOrbiConfigDB / loadAccordionStateDB / saveAccordionStateDB ✅
- wio/app/layout.tsx + settings/page.tsx: DB-first 전환 ✅
- lib/library-context.tsx: bookmarks/user_items DB 연동 ✅
- lib/smarcomm/chart-palette.ts + scan-data.ts: DB 헬퍼 추가 ✅
- smarcomm/dashboard/scan, glossary, profile 페이지: DB 연동 ✅

---

## 다음 할 일

### 즉시
1. **Prod DB**: `sql/approval_templates.sql` 실행 완료 ✅
2. Multiple GoTrueClient — 모니터링 계속 (11976ed 커밋 이후 안정)

### 단기 — TenOne
3. ~~설정 서비스/모듈 → Supabase 저장 (localStorage → DB)~~ ✅ 완료
4. Rule Engine + Event Bus 구현 (Universe OS Phase 2)
5. SmarComm 독립 배포

### 단기 — 사이트 구조 개편
6. **TrendHunter → Mindle 통합 후 삭제**
   - TrendHunter 사이트를 Mindle(크롤링/트렌드 콘텐츠) 브랜드에 흡수
   - features/trendhunter/ 폴더 + 라우트 제거, Mindle로 리다이렉트
7. **TenOne Newsroom 페이지 일관성/폭 정비**
   - 현재 폭이 다른 섹션과 불일치 → 전체 max-w 통일
8. **로그인 문제 근본 해결** (tenone.biz/intra — "서버 응답이 지연되고 있습니다")
   - 반복적 타임아웃 원인 분석 필요 (Supabase cold start? 네트워크? 쿠키?)
9. **첫 페이지 콘텐츠 미리보기 클릭 → 해당 콘텐츠로 직접 연결**
   - 현재: 미리보기 클릭 → works/brands 등 목록 페이지로 이동
   - 목표: 클릭 시 해당 아이템 상세 페이지로 직접 이동
10. **게시판 + 위젯 개념 정립** (아임웹 스타일)
    - 게시판: 목록/상세/작성 표준 구조
    - 위젯: 페이지 어디서나 삽입 가능한 재사용 블록
    - CMS 관리 모드 연계 (project_cms_vision 메모리 참조)

### 단기 — Myverse 앱 착수 준비
11. 맥북 구매 확정 후 → Expo 프로젝트 초기화
12. Myverse 전용 Supabase 프로젝트 생성
13. Myverse_Dev_Guide_v3_final.md를 프로젝트 CLAUDE.md로 정제

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md
- Director 가이드라인: docs/DIRECTOR_COMMENTS.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v3_final.md (G드라이브)
- 개발 현황: docs/PROJECT_STATUS.md
