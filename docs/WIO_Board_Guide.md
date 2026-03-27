# WIO 게시판 모듈 가이드

> WIO 게시판은 아임웹 게시판과 동일한 역할을 한다.
> 모든 브랜드 사이트가 하나의 게시판 모듈을 공유한다.

---

## 1. 게시판 추가 및 기본 설정

### 게시판 생성
페이지에 `<BoardPage>` 컴포넌트를 추가하면 게시판이 생성된다.

```tsx
// app/(TenOne)/works/page.tsx
import BoardPage from "@/components/board/BoardPage";

export default function WorksPage() {
    return (
        <BoardPage
            site="tenone"        // 멀티테넌트 키 (브랜드별)
            board="works"        // 게시판 슬러그
            title="Works"        // 게시판 제목
            description="설명"   // 게시판 설명
            accentColor="#171717" // 강조 색상
            showWriteButton={true}  // 글쓰기 버튼 표시
        />
    );
}
```

### 멀티사이트 지원
| site 코드 | 브랜드 | 예시 게시판 |
|-----------|--------|------------|
| `tenone` | Ten:One™ | works, newsroom |
| `smarcomm` | SmarComm. | blog, cases |
| `badak` | Badak | community, events |
| `madleague` | MADLeague | notice, gallery |
| ... | 모든 브랜드 | 무제한 |

### 게시판 설정 (board_configs)
Supabase `board_configs` 테이블에서 관리:
- `site`: 브랜드 코드
- `slug`: 게시판 슬러그
- `name`: 게시판 이름
- `categories`: 카테고리 목록 (JSON 배열)
- `settings`: 상세 설정 (JSON)

### 권한 설정
| 기능 | 현재 상태 | 아임웹 비교 |
|------|----------|------------|
| 누구나 읽기 | ✅ | ✅ |
| 로그인 유저 글쓰기 | ✅ | ✅ |
| 비회원(게스트) 글쓰기 | ✅ 닉네임+비밀번호 | ✅ |
| Admin API Key 글쓰기 | ✅ AI 에이전트용 | ❌ (아임웹에 없음) |
| 회원등급별 권한 | ❌ 미구현 | ✅ |
| 비밀글 | ❌ 미구현 | ✅ |

---

## 2. 카테고리 구성

### 카테고리 설정
`board_configs` 테이블의 `categories` 필드에 JSON 배열로 지정:
```json
["AI", "브랜딩", "프로젝트", "네트워크", "교육", "콘텐츠"]
```

### 카테고리 탭 UI
BoardList 컴포넌트가 자동으로 카테고리 탭을 렌더링한다.
- 전체 / AI / 브랜딩 / 프로젝트 / ... 형태로 표시
- 클릭 시 해당 카테고리 게시물만 필터링

---

## 3. 게시판 디자인

### 레이아웃 종류
| 레이아웃 | 현재 상태 | 용도 |
|---------|----------|------|
| 카드형 (그리드) | ✅ | 포트폴리오, 갤러리 |
| 리스트형 | ✅ | 공지사항, 자유게시판 |
| 아코디언(FAQ)형 | ❌ 미구현 | FAQ, Q&A |
| 슬라이드형 | ❌ 미구현 | 배너, 프로모션 |

### 뷰 전환
사용자가 카드뷰 ↔ 리스트뷰를 토글할 수 있다.

### 테마 대응
모든 컴포넌트가 `tn-*` CSS 변수를 사용하여 라이트/다크 테마에 자동 대응한다.

---

## 4. 게시글 작성 및 운영

### 작성 방법
1. **사이트에서 직접**: 게시판 페이지의 [글쓰기] 버튼 클릭
2. **API로 작성**: `POST /api/board/posts` (AI 에이전트, 외부 시스템)
3. **관리자 대시보드**: (향후 인트라 오피스에서 관리)

### 에디터 기능
- **Tiptap 리치 에디터**: 볼드, 이탤릭, 링크, 이미지, 코드블록 등
- **이미지 붙여넣기**: Ctrl+V로 이미지 붙여넣기 → 자동 Storage 업로드
- **이미지 드래그&드롭**: 파일 드래그 → 자동 Storage 업로드
- **대표 이미지**: 별도 업로드 또는 본문 첫 이미지 자동 추출

### 대표 이미지 자동 추출 (아임웹 스타일)
1. 게시물 작성 시 `representImage`를 지정하지 않으면
2. 본문 첫 번째 `<img>` 태그의 src를 자동 추출
3. 리스트/위젯에서 썸네일로 표시

### 홈페이지 위젯 (최신글 보기)
```tsx
// 홈페이지에서 최신 Works 8개 가져오기
const res = await fetch('/api/board/posts?site=tenone&board=works&limit=8&status=published');
const { posts } = await res.json();
```

---

## 5. 인터랙션 기능

| 기능 | API | 현재 상태 |
|------|-----|----------|
| 조회수 카운트 | 상세 조회 시 자동 +1 | ✅ 실제 카운트 |
| 좋아요 토글 | `POST /api/board/like` | ✅ (로그인 필요) |
| 북마크 토글 | `POST /api/board/bookmark` | ✅ (로그인 필요) |
| 공유 (URL 복사) | 클라이언트 clipboard | ✅ |
| 댓글 | `POST /api/board/comments` | ✅ (게스트 가능) |
| 대댓글 | parentId 지정 | ✅ |

---

## 6. API 레퍼런스

### 게시글
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/board/posts?site=X&board=Y` | 게시글 목록 |
| GET | `/api/board/posts/:id` | 게시글 상세 (+조회수 증가) |
| POST | `/api/board/posts` | 게시글 작성 |
| PUT | `/api/board/posts/:id` | 게시글 수정 |
| DELETE | `/api/board/posts/:id` | 게시글 삭제 |

### 목록 파라미터
| 파라미터 | 기본값 | 설명 |
|---------|--------|------|
| `site` | `tenone` | 브랜드 코드 |
| `board` | - | 게시판 슬러그 |
| `category` | - | 카테고리 필터 |
| `tag` | - | 태그 필터 |
| `search` | - | 제목+본문 검색 |
| `sort` | `latest` | 정렬: latest, popular, comments, views |
| `period` | `all` | 기간: all, today, week, month, year |
| `page` | `1` | 페이지 번호 |
| `limit` | `12` | 페이지당 개수 |
| `status` | `published` | 상태 필터 |

### 기타
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/board/like` | 좋아요 토글 |
| POST | `/api/board/bookmark` | 북마크 토글 |
| GET | `/api/board/bookmark?userId=X` | 내 북마크 목록 |
| POST | `/api/board/comments` | 댓글 작성 |
| GET | `/api/board/tags?site=X&board=Y` | 인기 태그 |
| POST | `/api/board/upload` | 이미지 업로드 |
| GET | `/api/board/configs?site=X` | 게시판 설정 |

### 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/board/migrate-images?site=X` | base64 이미지 → Storage 마이그레이션 |

---

## 7. 아임웹 대비 미구현 기능 (로드맵)

| 기능 | 우선순위 | 상태 |
|------|---------|------|
| 게시글별 고유 URL | 🔴 높음 | 미구현 → URL ?postId= 파라미터 필요 |
| 회원등급별 권한 제어 | 🟡 중간 | 미구현 |
| 비밀글 | 🟡 중간 | 미구현 |
| 아코디언(FAQ) 레이아웃 | 🟡 중간 | 미구현 |
| 슬라이드 레이아웃 | 🟢 낮음 | 미구현 |
| 글양식(템플릿) | 🟡 중간 | 미구현 |
| 스팸 방지 (CAPTCHA) | 🟢 낮음 | 미구현 |
| 이미지 자동 리사이즈/WebP 변환 | 🟡 중간 | 미구현 |
| 프로필 내 북마크 목록 | 🟡 중간 | API만 있고 UI 없음 |
| 관리자 대시보드 게시물 관리 | 🔴 높음 | 인트라 오피스에서 구현 예정 |

---

## 8. 파일 구조

```
components/board/
  BoardPage.tsx      # 게시판 메인 (설정 로드, 모드 전환)
  BoardList.tsx      # 목록 (검색, 카테고리, 정렬, 페이지네이션)
  PostCard.tsx       # 카드뷰 아이템
  PostListItem.tsx   # 리스트뷰 아이템
  PostDetail.tsx     # 게시글 상세 (좋아요, 북마크, 공유)
  PostEditor.tsx     # 글쓰기/수정 에디터 (Tiptap)
  CommentSection.tsx # 댓글 섹션

app/api/board/
  posts/route.ts         # 게시글 목록/작성
  posts/[id]/route.ts    # 게시글 상세/수정/삭제
  comments/route.ts      # 댓글
  like/route.ts          # 좋아요
  bookmark/route.ts      # 북마크
  tags/route.ts          # 태그
  upload/route.ts        # 이미지 업로드
  configs/route.ts       # 게시판 설정
  migrate-images/route.ts # 이미지 마이그레이션

lib/supabase/board.ts    # Supabase CRUD (모든 DB 로직)
types/board.ts           # TypeScript 타입 정의
```

---

> **핵심 원칙**: 게시판은 WIO 모듈이다. 모든 브랜드가 같은 게시판 시스템을 사용한다.
> 새 브랜드에 게시판을 추가하려면 `<BoardPage site="브랜드코드" board="슬러그" />`만 넣으면 된다.
