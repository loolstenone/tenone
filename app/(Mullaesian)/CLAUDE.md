# Mullaesian 브랜드 가이드

> **문래지앙(Mullaesian)** — 작은 철공소, 골목 그리고 가난한 예술가들. "18년 거주자의 로컬 기록"

---

## 정체성

- **한 줄 소개**: 문래동 18년 거주자의 로컬 프로젝트 (철공소·갤러리·꼬뮨)
- **톤앤매너**: 정성스러움·기록·공동체. 로컬 중심.
- **주 컬러**: 파란색 (#007BBF)
- **디자인 방향**: 뚜르 드 문래 (투어) + 갤러리 + 문래 꼬뮨 (공동체)

---

## 접근 모델

- **유형**: 오픈 + 커뮤니티 (누구나 참여 가능한 로컬 프로젝트)
- **가입 경로**:
  1. 회원가입 (선택적)
  2. 투어·갤러리·꼬뮨 참여 가능
- **멤버 권한**: member, guide, artist, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: location, interest_tags, participation_history

---

## 권한 체계

- **role 종류**: member, guide, artist, admin
- **context**: `brand:mullaesian`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: join_tour (월 2회, 무료)
- **brand_id 지정**: `brand_id = 'mullaesian'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Mullaesian)/layout.tsx` | generateMetadata |
| `app/(Mullaesian)/mullaesian/page.tsx` | 메인 (프로젝트 소개) |
| `app/(Mullaesian)/mullaesian/tour/page.tsx` | 뚜르 드 문래 |
| `app/(Mullaesian)/mullaesian/gallery/page.tsx` | 갤러리 문래 |
| `app/(Mullaesian)/mullaesian/commune/page.tsx` | 문래 꼬뮨 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — 커뮤니티 중심 콘텐츠 구축 중 |
| **이월 작업** | 예술가 프로필 시스템 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
