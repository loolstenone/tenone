// myverse.kr/llms.txt — LLM 검색 엔진을 위한 사이트 요약
// (myverse.kr 호스트에서 미들웨어가 /myverse 프리픽스로 rewrite하므로
//  실제 URL은 myverse.kr/llms.txt 로 접근 가능)

export const dynamic = "force-static";

export async function GET() {
    const text = `# Myverse

> My Universe — 디지털 속 나를 키운다. Personal Black Box for the Digital Age

마이버스는 9개 영역으로 자동 정리되는 개인 데이터 통합 플랫폼이다.
일상의 5가지 채집 행동(사진·영상·위치·음성·글쓰기)을 자동 분류하고,
사용자가 선택한 콘텐츠만 myverse.kr/@handle 에서 외부에 공개한다.

## 3 원칙

1. 나의 일상을 기록하고 관리하고 성장하고
2. 내가 선택한 것들만 외부에 공유하고
3. 지금까지의 디지털 흔적은 나의 것이다

## 9 영역 (Domains)

- **BODY** — 운동·식사·수면 (헬스킷·구글핏·음식 사진)
- **업무** — 회의·프로젝트·업무 노트 (캘린더 매칭·근무 시간대)
- **공부** — 강의·필기·자기학습
- **일상** — 일기·기분·자유 기록 (기본값)
- **일정** — 캘린더 약속·기념일
- **여행** — 평소 거점에서 30km+ 1박 이상
- **이동** — GPS 자동 동선
- **관계** — 사람과의 만남
- **사람** — 모든 영역을 가로지르는 횡단축

## 5축 메타데이터

모든 데이터는 시간·위치·사람·내용·컨텍스트 5축으로 자동 라벨링된다.

## 7 시스템

1. 채집(Capture) — Quick Capture·갤러리 자동·OAuth 임포트
2. 분류 엔진(Classification) — 룰 + ML 라우팅
3. 통합 저장소(Blackbox) — 영구 보존·데이터 주권
4. 시간축(Timeline) — 일·주·월·분기·년·평생 6단계
5. 관계(Relations) — 사람 단위 모든 영역 횡단
6. AI 코칭(RAG) — 나와의 대화·교차 인사이트
7. 공개(VERSE) — 슬쩍 토글·@handle·외부 SNS 공유

## 사생활 3원칙

- 능동 입력은 기본 ON
- 자동 수집(갤러리·GPS·헬스·메일)은 기본 OFF·명시 동의 필수
- 마이크 상시 녹음·화면 캡처는 절대 금지

## 주요 페이지

- / — 브랜드 랜딩
- /philosophy — 데이터 주권·AI 신뢰 철학
- /service — 서비스 소개
- /technology — 기술·보안
- /roadmap — 로드맵
- /team — 팀 소개
- /contact — 연락
- /@handle — 사용자 공개 페이지 (선택 공개 콘텐츠만)
- /app/{body,work,study,daily,schedule,travel,move,relation} — 9 영역 (로그인, traces ?domain= 으로 흡수)
- /app/traces — 9 영역 통합 타임라인 (도메인 필터 지원)
- /app/ask — Mukki AI (mode=ask|diary|coach 단일 인터페이스)
- /app/settings/imports — 외부 백업 가져오기 허브
- /app/settings/privacy — 자동 수집 동의 토글

## 외부 임포트 지원

Instagram·Facebook (GDPR ZIP) / Apple Health (export.xml) /
Google Timeline (Semantic Location History) / Apple Photos

## 가격

- 무료: 채집·정리·6단계 시각화 + AI 코칭 일일 5회
- 구독: 무제한 코칭 + 외부 자동 임포트
`;
    return new Response(text, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600",
        },
    });
}
