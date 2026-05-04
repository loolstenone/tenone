// 분류 엔진 v2 — Haiku 4.5 LLM 라우팅 (룰 confidence가 낮을 때만 호출)
//
// 호출 비용 통제:
//   - 룰 분류 confidence >= 0.6 → 룰 결과 그대로 사용 (LLM 호출 X)
//   - confidence < 0.6 일 때만 Haiku 호출
//   - 사용자별 일일 quota (myverse_users.ai_daily_calls)

import Anthropic from "@anthropic-ai/sdk";
import { DOMAIN_KEYS } from "../domains";
import type { DomainKey } from "../domains";
import type { ClassifyResult, ClassifyInput } from "./rules";

const SYSTEM_PROMPT = `당신은 사용자의 일상 데이터를 9 영역 중 하나로 분류하는 보조 분류기입니다.

영역 (key — 의미):
- body: 운동·식사·수면 (몸의 흔적)
- work: 업무·회의·프로젝트
- study: 강의·필기·자기학습
- daily: 일상·일기·여가 (기본값)
- schedule: 캘린더 약속·기념일
- travel: 여행 (평소 거점에서 멀리 떨어진 1박 이상)
- move: 이동·교통 (자동 GPS 기록)
- relation: 사람과의 만남·소셜

룰: 5축 메타와 컨텐츠를 보고 가장 가까운 영역 1개와 신뢰도(0~1), 1줄 사유, 1~3개 한국어 태그를 JSON으로 반환.
사진 정보가 없거나 모호하면 'daily', 신뢰도 0.4.

출력 형식 (반드시 JSON, 다른 텍스트 금지):
{"domain":"work","confidence":0.7,"reason":"평일 오전 사무실 거점 + 캘린더 미팅 매칭","tags":["미팅","기획"]}`;

interface MLResult extends ClassifyResult {
    via: "rule" | "ml";
}

export async function classifyWithML(
    input: ClassifyInput,
    ruleResult: ClassifyResult,
): Promise<MLResult> {
    // 룰 confidence가 충분히 높으면 LLM 호출 안 함
    if (ruleResult.confidence >= 0.6) {
        return { ...ruleResult, via: "rule" };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { ...ruleResult, via: "rule" };

    try {
        const anthropic = new Anthropic({ apiKey });

        const userPrompt = `5축 메타:
- 시간: ${JSON.stringify(input.time_axis ?? {})}
- 위치: ${JSON.stringify(input.geo_axis ?? {})}
- 사람: ${input.people_axis?.length ?? 0}명
- 컨텐츠: ${input.content_axis ?? "(없음)"}
- 캘린더 매칭: ${input.calendar_match ? `${input.calendar_match.kind} "${input.calendar_match.title}"` : "(없음)"}

거점 ${input.bases?.length ?? 0}개: ${(input.bases ?? []).map(b => `${b.name}(${b.type})`).join(", ")}

룰 분류 결과 (참고):
- 도메인: ${ruleResult.domain}
- 신뢰도: ${ruleResult.confidence}
- 사유: ${ruleResult.reason}

위 입력으로 9 영역 중 가장 가까운 1개 + 신뢰도 + 사유 + 태그 1~3개를 JSON으로.`;

        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 200,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
        });

        const text = msg.content
            .filter((b) => b.type === "text")
            .map(b => (b as { type: "text"; text: string }).text)
            .join("");

        // JSON 파싱
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { ...ruleResult, via: "rule" };

        const parsed = JSON.parse(jsonMatch[0]) as {
            domain?: string;
            confidence?: number;
            reason?: string;
            tags?: string[];
        };

        // 검증
        if (!parsed.domain || !DOMAIN_KEYS.includes(parsed.domain as DomainKey)) {
            return { ...ruleResult, via: "rule" };
        }

        return {
            domain: parsed.domain as DomainKey,
            confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
            reason: parsed.reason ?? "ML 분류",
            sub_tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [],
            via: "ml",
        };
    } catch {
        return { ...ruleResult, via: "rule" };
    }
}
