# Mindle Discord Bot Crawler

Discord 서버의 메시지를 수집해 Mindle 데이터 파이프라인에 전달하는 봇.

## 설치

```bash
cd bots/discord
npm install
```

## 환경 변수

`.env` 파일 생성:

```
DISCORD_TOKEN=your_discord_bot_token
COLLECT_API_URL=https://tenone.biz/api/trendhunter/collect
TRENDHUNTER_API_KEY=your_api_key
```

## 실행

```bash
node bot.js
```

## Discord Bot 생성 방법

1. https://discord.com/developers/applications 접속
2. "New Application" → 이름: "Mindle Crawler"
3. Bot 탭 → "Add Bot" → Token 복사
4. OAuth2 → URL Generator → Scopes: `bot` → Permissions: `Read Messages/View Channels`, `Read Message History`
5. 생성된 URL로 서버에 봇 초대

## 수집 채널 설정

`bot.js`의 `WATCH_CHANNELS` 배열에 수집할 채널 이름 추가.
기본값: 모든 텍스트 채널 수집.
