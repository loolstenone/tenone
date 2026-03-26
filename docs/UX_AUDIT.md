# UX 감사 보고서

> 감사일: 2026-03-27 (집)
> 대상: 전 사이트 인증 UX + 페이지 성능

---

## 🔴 즉시 수정 (사용자 불편 직결)

### 1. 로그인 후 window.location.reload() 제거
- **문제**: 전체 페이지 리로드 → 느림, 깜빡임, 폼 데이터 유실
- **위치**: LoginModal.tsx, UniverseUtilityBar.tsx, 브랜드 헤더들
- **수정**: `window.location.reload()` → React state 업데이트만

### 2. 헤더 로딩 중 "로그인" 버튼 깜빡임
- **문제**: isLoading 중 "로그인/회원가입" 표시 → 로딩 끝나면 프로필로 전환
- **위치**: PublicHeader, UniverseUtilityBar, 전체 헤더
- **수정**: isLoading 중에는 아무것도 표시하지 않음 (빈 상태)

### 3. 비밀번호 재설정 없음
- **문제**: 비번 분실 시 복구 방법 없음
- **위치**: /login, /wio/login
- **수정**: "비밀번호 찾기" → Supabase resetPasswordForEmail() + 재설정 페이지

### 4. 이메일 인증 미구현
- **문제**: 가입 후 이메일 확인 없이 바로 로그인 가능
- **위치**: signup, auth-context
- **수정**: email_confirmed_at 체크 + "이메일 확인해주세요" 안내

### 5. 크로스탭 세션 동기화 없음
- **문제**: 탭A 로그인 → 탭B 여전히 비로그인
- **위치**: auth-context
- **수정**: storage 이벤트 리스너로 크로스탭 동기화

### 6. 데이터 로딩 중 빈 화면 (스켈레톤 없음)
- **문제**: fetch 중 "갤러리가 비어있습니다" 등 잘못된 상태 표시
- **위치**: MADLeague, Badak, WIO app layout
- **수정**: 로딩 중 스켈레톤 카드 표시

---

## 🟡 다음 스프린트

### 7. 에러 catch 블록 개선
- silent catch {} → console.error + 사용자 피드백

### 8. OAuth 에러 메시지 구체화
- "auth_callback_error" → "Google 로그인 실패. 다시 시도해주세요."

### 9. 비밀번호 강도 실시간 피드백
- 타이핑 중 8자/영문/숫자/특수문자 체크 표시

### 10. WIO 가입 메시지 수정
- "이메일 확인해주세요" → "가입 완료! 로그인해주세요."

### 11. img → next/image 전환
- TenOne 홈, Badak, MADLeague 갤러리

### 12. 폼 제출 disabled 시각 피드백
- disabled:opacity-50 + disabled:cursor-not-allowed

### 13. 에러 바운더리 추가
- 각 레이아웃에 error.tsx 파일

### 14. Supabase 타임아웃
- AbortController 10초 타임아웃 + "연결이 느립니다" 메시지
