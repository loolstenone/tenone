# HIT API 명세
Base: `/api/hit/*` | Auth: Supabase anon key (세션 토큰 기반)

## 세션
```
POST   /api/hit/a/session          — HIT A 세션 생성
GET    /api/hit/a/session/:token   — 세션 상태 조회 (재진입용)
POST   /api/hit/b/session          — HIT B 세션 생성
GET    /api/hit/b/session/:token   — HIT B 세션 조회
```

## 문항
```
GET    /api/hit/b/questions?trackId=xxx  — HIT B 문항 목록 (DB 동적 로드)
GET    /api/hit/b/tracks                 — 트랙 목록
```

## 응답 저장
```
POST   /api/hit/a/response   — HIT A 응답 저장 (배치)
POST   /api/hit/b/response   — HIT B 응답 저장 (배치)
```

## 채점·분석
```
POST   /api/hit/a/score      — HIT A 교차분석 실행 → S-Power + 64유형 배정
POST   /api/hit/b/score      — HIT B 심화분석 → 인성/RIASEC/역량/준비도 + 주의신호
```

## 결과 조회
```
GET    /api/hit/a/result/:id      — HIT A 결과
GET    /api/hit/b/result/:id      — HIT B 결과 (소비자용 — dark_triad/alert 제외)
```

## AI 상담
```
POST   /api/hit/chat              — 히어로 AI 상담 (단발)
POST   /api/hit/chat/stream       — 히어로 AI 상담 (스트리밍)
POST   /api/hit/link-member       — 비회원 결과를 회원 계정에 연결
```

## OG 이미지
```
GET    /api/og/hit?id=xxx&layer=a  — HIT 결과 OG 이미지 생성
```

## 에러 코드
| 코드 | 의미 |
|------|------|
| HIT_001 | 세션 없음 |
| HIT_002 | 소유자 불일치 |
| HIT_003 | 스테이지 미완료 |
| HIT_004 | 응답 부족 |
| HIT_005 | 이미 완료된 세션 |
| HIT_006 | CVI 입력 누락 |
| HIT_007 | AI 리포트 생성 실패 |

## HIT B 주의 신호 (내부 — 소비자 비노출)
- `alert_n1`, `alert_m1`, `alert_p1`: 각 0~100
- `alert_level`: 0~3 (70 이상 코드 수)
- 관리자 설정: `hit_questions.alert_code = 'N1' | 'M1' | 'P1'`
- `alert_level >= 3` 시 #브리핑 채널에 자동 알림
