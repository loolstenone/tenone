# TenOne Multi-Site 관리 가이드

## 1. 사이트 관리 체계

### 일괄 적용 (Global) — `lib/site-config.ts > globalConfig`

| 항목 | 설정 위치 | 예시 |
|------|----------|------|
| Footer copyright 형식 | `globalConfig.copyrightTemplate` | `© {name}. All rights reserved.` |
| 로그인/회원가입 버튼 | `globalConfig.showAuthButtons` | `true` |
| Universe 배지 표시 | `globalConfig.showUniverseBadge` | `true` |
| middleware 도메인 분기 | `middleware.ts` | 새 사이트 추가 시 등록 |
| Vercel 도메인 | Vercel Dashboard | 새 도메인 추가 시 등록 |

### 사이트별 적용 (Per-site) — `lib/site-config.ts > siteConfigs.{사이트}`

| 항목 | 필드명 | 예시 |
|------|--------|------|
| 사이트명 | `name` | `MAD League` |
| 로고 | `logoText`, `logoStyle` | `MAD LEAGUE`, `badge` |
| 브랜드 색상 | `colors.*` | primary, headerBg, footerBg |
| 메뉴 구성 | `nav[]` | 사이트별 네비게이션 |
| 푸터 링크 | `footerLinks[]` | 사이트별 푸터 |
| 메타데이터 | `meta.*` | title, description, ogImage |
| 도메인 | `domain` | `madleague.net` |
| 경로 프리픽스 | `homePath` | `/ml` |

---

## 2. 새 서비스 런칭 절차

### Phase 1: 기획 확정

- [ ] 서비스명, 도메인, 프리픽스 확정
- [ ] 브랜드 색상, 로고 디자인
- [ ] 메뉴 구조 (nav 항목) 확정
- [ ] 타겟 사용자 및 가입 유형 결정 (Member/Crew/Alliance 등)
- [ ] 게시판 구성 결정 (board_configs에 등록할 게시판)

### Phase 2: 코드 작업

```
1. lib/site-config.ts
   - SiteIdentifier에 ID 추가
   - siteConfigs에 설정 추가
   - domainMap에 도메인 매핑

2. middleware.ts
   - domainPrefixMap에 도메인 → 프리픽스 추가

3. lib/auth-transfer.ts
   - ALLOWED_RETURN_DOMAINS에 도메인 추가 (소셜 로그인용)

4. app/(사이트명)/ 라우트 그룹 생성
   - layout.tsx (헤더/푸터 래핑)
   - {프리픽스}/page.tsx (홈)
   - {프리픽스}/about/page.tsx 등 페이지들
   - {프리픽스}/my/page.tsx (마이페이지)

5. components/
   - {사이트명}Header.tsx (auth + /my 링크 포함)
   - {사이트명}Footer.tsx

6. public/brands/{사이트명}/
   - favicon.png
   - og-image.png
   - logo.svg (있으면)
```

### Phase 3: 인프라 작업

```
1. 도메인 구매 (가비아 등)

2. DNS 설정
   - A @ 76.76.21.21
   - CNAME www cname.vercel-dns.com.

3. Vercel Dashboard → Settings → Domains
   - {도메인} 추가
   - www.{도메인} 추가
   - SSL 인증서 자동 생성 확인

4. Supabase → Authentication → URL Configuration
   - Redirect URLs에 https://{도메인}/auth/callback 추가
```

### Phase 4: 데이터 설정

```
1. Supabase SQL Editor — board_configs 등록
   INSERT INTO board_configs (site, slug, name, description, categories, settings)
   VALUES ('{사이트ID}', '{게시판슬러그}', '{게시판명}', '{설명}', '["카테1","카테2"]', '{}');

2. seed 데이터 (선택)
   - 초기 게시글, 공지사항 등

3. 가입 유형 설정 (types/auth.ts)
   - origin_site → 초기 역할 매핑 확인
```

### Phase 5: 검증

- [ ] `npm run build` 성공
- [ ] git push → Vercel 자동 배포
- [ ] 라이브 접속 확인 (도메인)
- [ ] 소셜 로그인 테스트 (Google + 카카오)
- [ ] 이메일 가입 테스트
- [ ] 게시판 표시 확인
- [ ] 마이페이지 (/my) 접속 확인
- [ ] 모바일 반응형 확인

---

## 3. 회원 등급 체계

### 내부

| 등급 | 설명 |
|------|------|
| Staff | 직원, 직접 선발/입력, 모든 기능 접근 |

### 외부 (높음 → 낮음)

| 등급 | 설명 | 인트라 접근 |
|------|------|-----------|
| Partner | 텐원의 세계관과 뜻을 같이 하는 사람 | 6개 모듈 |
| Alliance | 지역 거점 멘토 | 4개 모듈 |
| Crew | 프로젝트에 참여하고 싶은 사람 | 6개 모듈 |
| MADLeaguer | MAD League 동아리에서 가입 | 6개 모듈 |
| Member | 각 사이트에서 가입한 사람 | /my만 |

### 가입 경로별 초기 역할

| 가입 사이트 | 초기 역할 |
|------------|----------|
| tenone.biz | Member |
| badak.biz | Member |
| madleague.net | MADLeaguer |
| madleap 동아리 | MADLeaguer |
| youinone.com | Alliance |
| changeup.company | Crew |
| smarcomm.biz | Member |
| hero.ne.kr | Member |

### 승급 경로

```
Member → Crew → Partner → Staff
MADLeaguer → Crew → Partner
Alliance → Partner
```

---

## 4. 권한 매트릭스

```
              Staff  Partner  Alliance  Crew  MADLeaguer  Member
Myverse        ✅     ✅       ✅       ✅      ✅         ❌
Townity        ✅     ✅       ✅       ✅      ✅         ❌
Project        ✅     ✅(리드)  ❌       ✅(멤버) ❌         ❌
HeRo           ✅     ✅       ✅       ✅      ✅         ❌
Evo School     ✅     ✅       ✅       ✅      ✅         ❌
Wiki           ✅     ✅       ✅       ✅      ✅         ❌
ERP            ✅     ❌       ❌       ❌      ❌         ❌
Vridge         ✅     ❌       ❌       ❌      ❌         ❌
SmarComm       ✅     ❌       ❌       ❌      ❌         ❌
BUMS           ✅     ❌       ❌       ❌      ❌         ❌
각 사이트 /my   ✅     ✅       ✅       ✅      ✅         ✅
```

---

## 5. 현재 사이트 목록

| 사이트 | 도메인 | 프리픽스 | 상태 |
|--------|--------|---------|------|
| Ten:One™ | tenone.biz | / | 운영중 |
| MAD League | madleague.net | /ml | 운영중 |
| YouInOne | youinone.com | /yi | 운영중 |
| RooK | rook.co.kr | /rk | 운영중 |
| Badak | badak.biz | /bk | 운영중 |
| SmarComm | smarcomm.biz | /sc | 운영중 |
| HeRo | hero.ne.kr | /hr | 운영중 |
| 0gamja | 0gamja.com | /0g | 운영중 |
| Seoul/360° | seoul360.net | /s360 | 운영중 |
| FWN | fwn.co.kr | /fw | 운영중 |
| MADLeap | madleap.tenone.biz | /mlp | 서브도메인 |
| LUKI | luki.tenone.biz | /lk | 서브도메인 |
| MoNTZ | montz.tenone.biz | /mtz | 서브도메인 |
| 문래지앙 | mullaesian.tenone.biz | /mls | 서브도메인 |
| Trend Hunter | trendhunter.tenone.biz | /th | 서브도메인 |
| ChangeUp | changeup.tenone.biz | /cu | 서브도메인 |
| Domo | domo.tenone.biz | /dm | 서브도메인 |
| JAKKA | jakka.tenone.biz | /jk | 서브도메인 |
| Townity | townity.tenone.biz | /tw | 서브도메인 |
| NatureBox | naturebox.tenone.biz | /nb | 서브도메인 |
| My Universe | myverse.tenone.biz | /mv | 서브도메인 |
| Planners | planners.tenone.biz | /pln | 서브도메인 |

---

## 6. DB 현황

### Supabase 테이블

| 테이블 | 용도 | 데이터 |
|--------|------|--------|
| members | 통합 회원 | 1건 |
| posts | 통합 게시글 | 50+건 |
| comments | 댓글 | 0건 |
| board_configs | 게시판 설정 | 8건 |
| likes/bookmarks | 좋아요/북마크 | 0건 |
| projects | 프로젝트 | 8건 |
| approvals | 결재 | 0건 (테이블 생성) |
| expenses | 경비 | 0건 (테이블 생성) |
| gpr_goals | GPR 목표 | 0건 (테이블 생성) |
| attendance | 근태 | 0건 (테이블 생성) |
| payroll | 급여 | 0건 (테이블 생성) |
| biz_plans | 사업계획 | 0건 (테이블 생성) |
| hit_results | HIT 검사 결과 | 0건 |
| career_profiles | 커리어 프로필 | 0건 |
| resumes | 이력서 | 0건 |
| bums_sites | BUMS 사이트 | 6건 |
| bums_boards | BUMS 게시판 | 9건 |
| bums_posts | BUMS 게시글 | 0건 (legacy) |

### CRUD 레이어

| 파일 | 대상 |
|------|------|
| lib/supabase/board.ts | posts, board_configs, comments, likes, bookmarks |
| lib/supabase/members.ts | members |
| lib/supabase/erp.ts | approvals, expenses, gpr_goals, attendance, payroll, biz_plans, staff, people |
| lib/supabase/projects.ts | projects |
| lib/supabase/education.ts | 교육 과정 |
| lib/supabase/hero.ts | HIT, career, resumes |
| lib/supabase/wiki.ts | 라이브러리 |
| lib/supabase/townity.ts | Townity (legacy) |

---

## 7. 수정 가이드

| 바꾸고 싶은 것 | 수정 위치 |
|--------------|----------|
| 사이트 메뉴 변경 | `siteConfigs.{사이트}.nav` |
| 사이트 색상 변경 | `siteConfigs.{사이트}.colors` |
| SEO 메타 변경 | `siteConfigs.{사이트}.meta` |
| 새 도메인 추가 | `middleware.ts` + `auth-transfer.ts` + `site-config.ts` + Vercel |
| 회원 유형 추가 | `types/auth.ts` + Supabase ENUM |
| 게시판 추가 | `board_configs` INSERT + 페이지에 BoardPage 컴포넌트 |
| ERP 기능 추가 | `lib/supabase/erp.ts` + 페이지 수정 |
| 인트라 메뉴 변경 | `components/IntraSidebar.tsx` |
