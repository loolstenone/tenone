# RooK 브랜드 가이드

> **RooK** — AI Creator. "밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다"
> Tier **집중** (2026-10-07 승격) · 공식 주소 `www.rook.co.kr` (외부 아임웹 운영 중 → Vercel 버전은 비공개 스테이징 `rook.tenone.biz`, is_open=false, noindex) · §0.1 "새로 제작, 이전 없음"

---

## 정체성

- **한 줄 소개**: AI 크리에이터 — AI로 음악·영상·밈·광고·아트워크를 만들고, AI 모델(아티스트)을 브랜드에 제공
- **톤앤매너**: 자유로움·창의적·도전적 ("Just Do It!")
- **주 컬러**: 초록 `#00d255` (포인트) + 검정 헤더 / 흰 본문 (원본 사이트 톤)
- **디자인 방향**: 원본 www.rook.co.kr(아임웹) 그대로 — 흰 배경 38px 모집 배너 + 검정 78px 메뉴, 본문 950px, 매스너리 3열(원본 비율 이미지), 섹션 제목 36px, 본문 16px, 사각 모서리. 카테고리 색 Works #FF635D · Artist #F9A746 · 자유게시판 #FF635D(망했어요 ㅋ #00B8FF)
- **채널**: YouTube `@RooK_AI_Creator`

---

## 접근 모델

- **유형**: 오픈 — 보기는 누구나, 자유게시판 글쓰기는 Ten:One ID 회원
- **RooKie**: 창작 커뮤니티 지원 = RooKie 페이지 팝업 폼(`form_type='rook_rookie'`, 이력서·포트폴리오 첨부 = contact-attachments 서명 업로드) → 내부 심사. 승인 회원 관리 체계는 아직 없음 (이월)
- **문의**: About "상담 / 문의" 팝업 (`form_type='rook_inquiry'`) — `/api/contact` (Turnstile·개인정보 동의)

---

## 콘텐츠 (2026-10-07 www.rook.co.kr에서 이전)

| 게시판 (`ums_boards`, site rook) | 쓰기 | 카테고리 | 내용 |
|---|---|---|---|
| `works` (Works) | 직원(admin) | Meme · AD · Music · Contents · RooK BooK · Art work | 운영사 작품 20편 (slug `rk-{아임웹 idx}`) |
| `artist` (AI Artist) | 직원(admin) | Woman · Man · High teen · Kids · Baby · Senior · Animal · Character · Musician | AI 모델 30명 |
| `freeboard` (Free board) | 회원 | Imge · Video · Music · Text · Big Contents · 망했어요 ㅋ | 자랑게시판. 원본 '공지' 3편만 이전 (작성자 관리자·매니악 취향) — 일반 회원 글·스팸은 이전하지 않음 |

- 글 = `ums_posts` (`category_id`=카테고리명, `image`=원본 목록 썸네일, `extra_fields.youtube_id`·`source`=원본 URL·`sort`=원본 목록 순서, `author_name`=원본 작성자)
- 정렬: `sort` 없는 새 글(최신순) → 이전 글은 원본 순서 (`getRookPosts`)
- 이미지 = Storage `board-assets/rook/{works|artist}/{idx}/` · 사이트 이미지 `board-assets/rook/site/`
- 이전 스크립트 `Scripts/rook-import.mjs` (멱등, slug 기준 갱신)
- ⚠️ AD 카테고리(비타500·벤츠·서울우유·LG Gram)는 실제 브랜드명을 쓴 AI 시안 — 공식 오픈 전 상표·광고 표기 검토

---

## 프로필 특화

- 특화 테이블 없음 (공통 `members`). 마이페이지 = MyProfileCard + CapabilitySection + 내 자유게시판 글

## 권한 체계

- 브랜드 자체 권한 없음 (데이터 계약 2조). 직원 = `member_roles` staff 계열, 인트라 관리 = `member_roles(role='rook', context='brand')`
- capability: `community`, `meetup` (brand_capabilities). RooKie 체계가 생기면 `club`(루키·슈퍼 루키) 검토

## UC 정책 특이사항

- 브랜드 전용 액션 없음 (`brand_id='rook'`)

## Action Hub Entries

- 없음 (문의는 `contact_submissions` form_type `rook_*` — 인트라 CS 인박스)

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(RooK)/layout.tsx` | generateMetadata + 헤더·푸터 |
| `app/(RooK)/rook/page.tsx` | 홈 (배경 영상·Works·Free board·AI Artist·AI Model·RooKie) |
| `app/(RooK)/rook/works/` · `works/[slug]/` | 작품 목록(카테고리 필터)·상세 |
| `app/(RooK)/rook/artist/` · `artist/[slug]/` | AI 아티스트 목록·상세 |
| `app/(RooK)/rook/freeboard/` | 자유게시판 (BoardPage). `[id]` → `?postId=` |
| `app/(RooK)/rook/rookie/` · `about/` | 원본 2단 레이아웃·문구 + 팝업 폼 |
| `app/(RooK)/rook/board/` · `home/` | 옛 경로 → freeboard·홈 리다이렉트 |
| `app/(RooK)/rook/my/page.tsx` | 마이페이지 |
| `lib/supabase/rook.ts` | 공개 콘텐츠 조회 (anon + RLS, ISR 10분) |
| `features/rook/RooKUI.tsx` | 사이트 이미지·영상·카테고리 색 상수, 섹션 제목, 카테고리 탭, 매스너리, 홈 오버레이 카드·목록 카드, 배경 영상 |
| `features/rook/RooKPostBody.tsx` | 본문 HTML (클라이언트 정화, YouTube embed만 허용) |
| `features/rook/RooKContactForm.tsx` | `RooKContactModalButton` — Contact·RooKie 지원 팝업 (원본 필드) |
| `features/rook/RooKPostDetail.tsx` | Works·Artist 상세 (원본: 카테고리+제목 20px → 본문) + 직원 수정 버튼 |
| `features/rook/RooKStaffPostButton.tsx` | 직원 전용 글쓰기·수정 (PostEditor 모달, /api/board/posts) |
| `features/rook/RooKHeader.tsx` · `RooKFooter.tsx` | 헤더(UtilityBar·MobileMenu)·푸터(UniverseFooter) |

## 인트라 관리 경로

- **사이트 헤더 메뉴·인트라 메뉴·화면 제목 = `lib/brand-site-menus.ts`(rook) 한 곳** (CLAUDE.md §1.9.5). `RooKHeader`가 `siteHeaderNav("rook")`로 렌더 — 메뉴 이름·순서는 레지스트리에서만 바꾼다. 인트라 이름은 사이트 표기 그대로 (Free board * · RooKie › RooKie 지원하기 · About › 상담 / 문의)
- `/intra/ums/rook` 대시보드 — 가입 회원·게시글·미답변 문의 + 사이트 메뉴별 현황 (`/api/intra/sites/status?site=rook`, 통합 관리 › 사이트 현황과 같은 숫자)
- `/intra/ums/rook/works`·`/artist`·`/freeboard` 게시판별 글 (`RookPostsAdmin`) · `/community` 전체 글
- `/intra/ums/rook/rookie` RooKie › RooKie 지원하기(form_type `rook_rookie`) · `/intra/ums/rook/cs` About › 상담 / 문의(`rook_inquiry`)
- `/intra/ums/rook/members` 회원 — `member_brand_joins(brand_id=rook)` 기준
- 작품·아티스트 글 작성·수정: **사이트 Works·Artist 목록 "글쓰기 (직원)"·상세 "수정 (직원)"** (`features/rook/RooKStaffPostButton.tsx` → 통합 게시판 PostEditor, 서버 권한 write_permission=admin). ISR 10분 — 다른 방문자에게는 최대 10분 뒤 반영

---

## 개발 주의사항

- 원본 사이트 대조가 기준 — 임의 레이아웃·문구·"More" 섹션 추가 금지 (세션 160 사용자 지적). 바꿀 땐 원본 실측(폭·글자 크기·순서) 후
- 링크는 `/rook/...` prefix로 (rook.tenone.biz·rook.co.kr에서도 동작, localhost 경로 분기 대응)
- 본문 HTML은 서버에서 정화 불가(`lib/sanitize-html.ts`) → `RooKPostBody`가 마운트 후 표시. 상세 페이지 서버 HTML에 본문 없음 (SEO는 summary·og로)
- 홈 배경 영상: `_xly_E2iphk`(비열한 저잣거리) · AI 모델 섹션 `NXdOyBWZkvw` (원본과 동일)
- DNS 전환 시: `ums_sites.hosting='vercel'`, CANONICAL_HOSTS `hosting:'vercel'`, next.config noindex 목록에서 제거, 옛 URL `/works/?idx={n}&bmode=view` → `/rook/works/rk-{n}` (artist 동일) 308 매핑 필요, 기존 아임웹 회원 30일 전 공지·재가입 안내

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | 새 사이트 제작 — 비공개 스테이징 (2026-10-07 세션 161 — ums_sites.is_open=false로 다시 닫음) |
| **세션 161 완료** | 배포 확인(Works 20·Artist 30·자유게시판 공지 3) · "매니악 취향" = 운영자 본인 확인(유지) · 인트라 RooK 실데이터 연결(옛 posts → ums_posts, affiliations → member_brand_joins) · 직원 글쓰기·수정 버튼 · **새 글 상세 404 수정**(slug 없는 글은 id로 조회 — getRookPost) · 미사용 게시판 challenge·feedback 삭제 · RooKHeader aboutPath 타입 오류 |
| **세션 160 완료** | 원본 대조 재작성(메뉴·배너·카테고리 순서·매스너리·상세·About/RooKie 2단·팝업 폼·자유게시판 공지 3편·원본 정렬) · 집중 Tier 승격(ums_sites·CANONICAL_HOSTS·noindex·사이트맵 제외) · 게시판 works/artist/freeboard 구성 · Works 20·Artist 30·이미지 이전 · 전 페이지 원본 콘텐츠로 재작성 · 문의·RooKie 지원 폼 · 마이페이지 내 글 필터 버그 수정 |
| **이월 작업** | ⓪ 팝업 폼 실제 제출(첨부 포함) → 인트라 문의 인박스 확인 · 직원 글쓰기 실사용 1건(작성→상세 열림→삭제) · 인트라 RooK 화면 직원 로그인 확인 ② RooKie 승인 회원 체계(capability) ③ AD 시안 상표 검토 ④ DNS 전환 계획(아임웹 회원 수 확인 → 공지) ⑤ 본문 서버 렌더(SEO) |
