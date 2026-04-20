# Dokdae 브랜드 가이드

> **독대** — AI Agent 메시징 채널. "열시일분과 대화하기"

---

## 정체성

- **한 줄 소개**: AI Agent(열시일분 등)와 메시지를 주고받는 채널
- **톤앤매너**: 친근함·빠른 응답·실용. AI 대화 중심.
- **주 컬색**: 파란색 (#60A5FA)
- **디자인 방향**: 대화 인터페이스 + Agent 목록 + 대화 이력

---

## 접근 모델

- **유형**: 내부 기록용 (외부 노출 제한)
- **가입 경로**: 직원/권한자만 접근
- **멤버 권한**: member, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: agent_permissions, conversation_count

---

## 권한 체계

- **role 종류**: member, admin
- **context**: `brand:dokdae`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 없음
- **brand_id 지정**: `brand_id = 'dokdae'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Dokdae)/layout.tsx` | generateMetadata |
| `app/(Dokdae)/dokdae/page.tsx` | 메인 (Agent 목록) |
| `app/(Dokdae)/dokdae/agent/[id]/page.tsx` | Agent 대화 화면 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — AI Agent 메시징 채널 구축 중 |
| **이월 작업** | 다중 Agent 지원 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UOS (Universe Operating System): [docs/Universe_OS_Plan.md](../../docs/Universe_OS_Plan.md)
