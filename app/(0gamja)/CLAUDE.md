# 0gamja 브랜드 가이드

> **공감자(0gamja)** — 하찮고 귀여운 감자들의 공감 이야기. "소소하지만 따뜻한 일상"

---

## 정체성

- **한 줄 소개**: 감자(감정적 감자)들의 따뜻한 공감 블로그 및 라이프스타일 커뮤니티
- **톤앤매너**: 따뜻함·소소함·공감. 감성 중심.
- **주 컬러**: 노란색 (#F5C518)
- **디자인 방향**: 일상 이야기 + 프로그램 + 필찐감자 (작가) 소개

---

## 접근 모델

- **유형**: 오픈 (누구나 참여, 콘텐츠 공유 자유)
- **가입 경로**:
  1. 회원가입 (이메일)
  2. 즉시 글 작성 및 참여 가능
- **멤버 권한**: member, writer, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: bio, blog_posts_count, followers

---

## 권한 체계

- **role 종류**: member, writer (필찐감자), admin
- **context**: `brand:ogamja`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: write_post (월 4회, 500 UC)
- **brand_id 지정**: `brand_id = 'ogamja'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(0gamja)/layout.tsx` | generateMetadata |
| `app/(0gamja)/0gamja/page.tsx` | 메인 (블로그 피드) |
| `app/(0gamja)/0gamja/writers/page.tsx` | 필찐감자 (작가 목록) |
| `app/(0gamja)/0gamja/programs/page.tsx` | 프로그램 |
| `app/(0gamja)/0gamja/my/page.tsx` | 마이페이지 (내 글) |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 커뮤니티 구축 중 |
| **이월 작업** | 글 작성 에디터 고도화 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
