# 바닥쇠 — 카카오 오픈채팅 크롤러

메신저봇R (안드로이드)을 이용한 카카오톡 오픈채팅 메시지 수집기.

## 구조

```
안드로이드 공기계 (메신저봇R)
  → 메시지 수신
  → badaksoe.js 실행
  → HTTP POST → /api/trendhunter/collect
  → Supabase collected_data 저장
```

## 필요 장비

- 안드로이드 공기계 (카카오톡 + 메신저봇R 설치)
- 카카오톡 오픈채팅방 입장

## 메신저봇R 설정

1. 메신저봇R 앱 설치
2. 새 봇 생성 → 이름: "바닥쇠"
3. 아래 `badaksoe.js` 코드를 봇 스크립트에 붙여넣기
4. 봇 활성화

## 수집 방 설정

`ROOMS` 객체에 수집할 방 이름과 토픽 매핑.
`EXTERNAL_ROOMS`에 외부 방 (digest 모드로 수집).

## 보안

- 개인정보 마스킹은 서버(/api/trendhunter/collect)에서 처리
- API_KEY 인증으로 외부 접근 차단
- 오픈채팅방 메시지만 수집 (개인 채팅 수집 금지)
