// Gmail 동기화 — 최근 메일 메타·snippet을 myverse_email_imports에 캐시
// AI 분류는 stub (auto_category 키워드 기반) — 후속에서 LLM 호출로 강화

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMemberId } from "@/lib/myverse/auth";
import { getValidAccessToken } from "@/lib/myverse/google-calendar";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

interface AiClassification {
    category: "receipt" | "invite" | "newsletter" | "personal" | "work" | null;
    amount: number | null;
    confidence: number;
}

/** Claude Haiku로 메일 일괄 분류 — 키워드 fallback보다 정확 */
async function classifyWithLLM(items: Array<{ subject: string; snippet: string; sender: string | null }>): Promise<AiClassification[]> {
    if (!anthropic || items.length === 0) return items.map(() => ({ category: null, amount: null, confidence: 0 }));

    const list = items.map((m, i) => `${i + 1}. From: ${m.sender ?? "?"} | Subject: ${m.subject} | Snippet: ${m.snippet.slice(0, 200)}`).join("\n");
    const prompt = `다음 메일들을 분류하세요. 카테고리: receipt(영수증·결제), invite(초대·일정·미팅), newsletter(뉴스레터·소식), personal(개인), work(업무), null(분류불가).
receipt면 금액(KRW)도 추출. 메일 개수만큼 JSON 배열로:

[
  {"category": "receipt|invite|newsletter|personal|work|null", "amount": 12000 or null, "confidence": 0.0-1.0},
  ...
]

메일:
${list}

JSON만 반환:`;

    try {
        const response = await anthropic.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });
        const text = response.content.find(c => c.type === "text");
        if (text?.type !== "text") return items.map(() => ({ category: null, amount: null, confidence: 0 }));

        // JSON 추출 (모델이 ```json...``` 블록으로 감쌀 수 있음)
        const match = text.text.match(/\[[\s\S]*\]/);
        if (!match) return items.map(() => ({ category: null, amount: null, confidence: 0 }));

        const parsed: AiClassification[] = JSON.parse(match[0]);
        // 개수 안 맞으면 padding
        while (parsed.length < items.length) parsed.push({ category: null, amount: null, confidence: 0 });
        return parsed.slice(0, items.length);
    } catch (e) {
        console.error("[gmail-sync llm classification]", e);
        return items.map(() => ({ category: null, amount: null, confidence: 0 }));
    }
}

interface GmailMessageMeta {
    id: string;
    threadId: string;
    snippet?: string;
    labelIds?: string[];
    internalDate?: string;
    payload?: {
        headers?: Array<{ name: string; value: string }>;
    };
}

function findHeader(headers: Array<{ name: string; value: string }> | undefined, key: string): string | null {
    if (!headers) return null;
    const h = headers.find(h => h.name.toLowerCase() === key.toLowerCase());
    return h?.value ?? null;
}

function parseFrom(fromHeader: string | null): { email: string | null; name: string | null } {
    if (!fromHeader) return { email: null, name: null };
    // "Name <email@x.com>" 또는 "email@x.com" 형태
    const m = fromHeader.match(/^"?([^"<]+?)"?\s*<([^>]+)>$/);
    if (m) return { name: m[1].trim(), email: m[2].trim() };
    if (/@/.test(fromHeader)) return { name: null, email: fromHeader.trim() };
    return { name: fromHeader.trim(), email: null };
}

/** 키워드 기반 간단 분류 — 후속 LLM 분류로 대체 */
function autoCategorize(subject: string, snippet: string, sender: string | null): { category: string | null; amount: number | null } {
    const text = `${subject} ${snippet} ${sender ?? ""}`.toLowerCase();

    // 영수증
    if (/(영수증|receipt|결제|주문|order|payment|invoice|청구|입금|carrot|toss|kakao\s*pay|card)/i.test(text)) {
        // 금액 추출 시도 (KRW)
        const amountMatch = text.match(/([\d,]+)\s*원|krw\s*([\d,]+)|\$([\d,.]+)/i);
        let amount: number | null = null;
        if (amountMatch) {
            const raw = amountMatch[1] ?? amountMatch[2] ?? amountMatch[3];
            const num = Number(raw.replace(/,/g, ""));
            if (!isNaN(num)) amount = num;
        }
        return { category: "receipt", amount };
    }

    // 초대·일정
    if (/(초대|invite|invitation|meeting|미팅|일정|calendar)/i.test(text)) {
        return { category: "invite", amount: null };
    }

    // 뉴스레터
    if (/(newsletter|unsubscribe|구독|소식|월간|주간)/i.test(text)) {
        return { category: "newsletter", amount: null };
    }

    return { category: null, amount: null };
}

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const token = await getValidAccessToken(memberId);
    if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });

    // 1) 최근 20개 메시지 ID 목록
    const listRes = await fetch(`${GMAIL_API}/users/me/messages?maxResults=20&q=newer_than:7d`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!listRes.ok) {
        const txt = await listRes.text().catch(() => "");
        return NextResponse.json({ error: "gmail_list_failed", detail: txt }, { status: 500 });
    }
    const listJson = await listRes.json();
    const messages: Array<{ id: string; threadId: string }> = listJson.messages ?? [];

    if (messages.length === 0) {
        return NextResponse.json({ imported: 0, skipped: 0 });
    }

    // 2) 각 메시지 메타 조회 (parallel — 20개 정도 안전)
    const fetches = messages.map(async m => {
        const r = await fetch(`${GMAIL_API}/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return null;
        return (await r.json()) as GmailMessageMeta;
    });
    const results = (await Promise.all(fetches)).filter((m): m is GmailMessageMeta => m !== null);

    // 3) 메타 추출 → LLM 분류 (가능 시) → fallback 키워드 분류
    const admin = createAdminClient();
    const prepped = results.map(m => {
        const from = findHeader(m.payload?.headers, "From");
        const subject = findHeader(m.payload?.headers, "Subject") ?? "(제목 없음)";
        const sender = parseFrom(from);
        const snippet = m.snippet ?? "";
        const receivedAt = m.internalDate ? new Date(Number(m.internalDate)).toISOString() : new Date().toISOString();
        return { m, from, subject, sender, snippet, receivedAt };
    });

    const llmInputs = prepped.map(p => ({ subject: p.subject, snippet: p.snippet, sender: p.sender.email }));
    const llmResults = await classifyWithLLM(llmInputs);

    const rows = prepped.map((p, i) => {
        // LLM이 분류 못했거나 confidence 낮으면 키워드 fallback
        let category: string | null = llmResults[i]?.category ?? null;
        let amount: number | null = llmResults[i]?.amount ?? null;
        if (!category || (llmResults[i]?.confidence ?? 0) < 0.6) {
            const kw = autoCategorize(p.subject, p.snippet, p.sender.email);
            category = kw.category ?? category;
            amount = kw.amount ?? amount;
        }

        return {
            member_id: memberId,
            provider: "gmail",
            external_id: p.m.id,
            thread_id: p.m.threadId,
            sender_email: p.sender.email,
            sender_name: p.sender.name,
            subject: p.subject,
            snippet: p.snippet.slice(0, 300),
            received_at: p.receivedAt,
            labels: p.m.labelIds ?? [],
            triage_state: "inbox",
            auto_category: category,
            auto_amount: amount,
            content_axis: `${p.subject} ${p.snippet}`.slice(0, 1000),
        };
    });

    if (rows.length > 0) {
        await admin.from("myverse_email_imports").upsert(rows, {
            onConflict: "member_id,provider,external_id",
            ignoreDuplicates: false,
        });
    }

    // 4) integration last_sync_at 갱신
    await admin
        .from("myverse_integrations")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("member_id", memberId)
        .eq("provider", "google_calendar");  // 같은 OAuth 사용

    return NextResponse.json({ imported: rows.length, skipped: messages.length - rows.length });
}
