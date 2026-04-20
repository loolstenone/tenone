# Wiki 브랜드 가이드

> **Universe Wiki** — 지식 허브. "Ten:One™ Universe의 공개 지식 기반"

---

## 정체성

- **한 줄 소개**: Ten:One Universe 공개 지식 허브 (브랜드·프로젝트·운영 노하우)
- **톤앤매너**: 투명함·공유·교육. 커뮤니티 문서화.
- **주 컬색**: 초록색 (#10B981)
- **디자인 방향**: 문서 검색 + 위키 문서 + 카테고리 네비

---

## 접근 모델

- **유형**: 오픈 (모든 지식 무료 공개)
- **가입 경로**: 회원가입 (선택적) → 문서 읽기 및 편집 가능
- **멤버 권한**: viewer, editor, moderator, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: contributed_articles, expertise_tags

---

## 권한 체계

- **role 종류**: viewer, editor, moderator, admin
- **context**: `brand:wiki`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: contribute_article (월 4회, 2000 UC)
- **brand_id 지정**: `brand_id = 'wiki'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Wiki)/layout.tsx` | generateMetadata |
| `app/(Wiki)/wiki/page.tsx` | 메인 (문서 검색) |
| `app/(Wiki)/wiki/docs/page.tsx` | 문서 목록 |
| `app/(Wiki)/wiki/search/page.tsx` | 전체 텍스트 검색 |
| `app/(Wiki)/wiki/[slug]/page.tsx` | 문서 상세 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 지식 기반 구축 중 |
| **이월 작업** | 위키 에디터 권한 시스템 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
