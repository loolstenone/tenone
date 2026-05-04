"use client";

import { useEffect, useState, useRef } from "react";
import { localDateStr } from "@/lib/planners/types";
import {
    Users, Plus, Search, Phone, Mail, Tag, X, ChevronDown,
    Pencil, Trash2, Upload, User, Cake, Loader2,
    Star, Copy, Check, Building2, MapPin, Briefcase, Download, CheckSquare, Square, Clock
} from "lucide-react";
import { AddressPickerButton } from "./AddressPicker";
import { ConfirmSheet } from "./ConfirmSheet";

// ── vCard 파서 유틸 ─────────────────────────────────────────────
// iPhone·Android·Outlook export 호환을 위해 다음을 처리한다:
// 1. CRLF + 라인 폴딩(다음 줄이 space/tab으로 시작) → 한 줄로 합침
// 2. CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE → UTF-8 디코딩 (한글 이름 깨짐 방지)
// 3. 다중 TEL·EMAIL → 첫 번째만 사용 (대표값). 나머지는 noteField로 합쳐도 됨.
// 4. BDAY: YYYY-MM-DD / YYYYMMDD / --MMDD / --MM-DD 모두 매칭

function decodeQuotedPrintable(s: string): string {
    // QP는 =XX 형태. UTF-8 멀티바이트는 =E1=84=80 식으로 연속됨.
    // 우선 hex 시퀀스를 바이트 배열로 모은 뒤 UTF-8 decode.
    const bytes: number[] = [];
    let i = 0;
    while (i < s.length) {
        if (s[i] === "=" && i + 2 < s.length && /[0-9A-Fa-f]{2}/.test(s.slice(i + 1, i + 3))) {
            bytes.push(parseInt(s.slice(i + 1, i + 3), 16));
            i += 3;
        } else if (s[i] === "=" && (s[i + 1] === "\r" || s[i + 1] === "\n")) {
            // soft line break — skip
            i += s[i + 1] === "\r" && s[i + 2] === "\n" ? 3 : 2;
        } else {
            bytes.push(s.charCodeAt(i));
            i += 1;
        }
    }
    try {
        return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    } catch {
        return s;
    }
}

function unfoldVcard(text: string): string {
    // RFC 6350: 다음 줄이 space/tab으로 시작하면 이전 줄의 연속.
    return text.replace(/\r?\n[ \t]/g, "");
}

function decodeValue(rawProp: string, rawValue: string): string {
    // rawProp 예: "FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE"
    const params = rawProp.toUpperCase();
    let v = rawValue;
    if (params.includes("QUOTED-PRINTABLE")) {
        v = decodeQuotedPrintable(v);
    }
    // vCard escaping: \,  \;  \n  \\
    v = v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
    return v.trim();
}

function findFirstField(block: string, fieldName: string): string | undefined {
    // 라인 단위로 매칭. 같은 필드 여러 개 있으면 첫 번째만 반환.
    const lines = block.split(/\r?\n/);
    const re = new RegExp(`^${fieldName}([^:]*):(.*)$`, "i");
    for (const line of lines) {
        const m = line.match(re);
        if (m) {
            const v = decodeValue(m[1], m[2]);
            if (v) return v;
        }
    }
    return undefined;
}

function parseBday(raw: string | undefined): string | undefined {
    if (!raw) return undefined;
    // YYYY-MM-DD 또는 YYYYMMDD 또는 --MMDD 또는 --MM-DD
    let m = raw.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
    if (m) return `${m[2]}-${m[3]}`;
    m = raw.match(/^--(\d{2})-?(\d{2})/);
    if (m) return `${m[1]}-${m[2]}`;
    return undefined;
}

interface ParsedContact {
    name: string;
    phone?: string;
    email?: string;
    birthday?: string;
    organization?: string;
    title?: string;
    address?: string;
    labels?: string[];
    note?: string;
    is_favorite?: boolean;
    group_name?: string;
}

// 시스템 라벨 — Google·iOS·Remember 앱이 자동 추가하는 메타라벨 (사용자 의도 X)
const SYSTEM_LABELS = new Set(["mycontacts", "remember", "starred", "* mycontacts", "favorites"]);
function isSystemLabel(l: string): boolean {
    return SYSTEM_LABELS.has(l.toLowerCase().trim());
}
function filterSystemLabels(labels?: string[]): string[] | undefined {
    if (!labels) return undefined;
    const cleaned = labels.filter(l => !isSystemLabel(l));
    return cleaned.length > 0 ? cleaned : undefined;
}

function parseVcardText(text: string): ParsedContact[] {
    const unfolded = unfoldVcard(text);
    const blocks = unfolded.split(/BEGIN:VCARD/i).slice(1); // 첫 split은 헤더 노이즈
    const out: ParsedContact[] = [];
    for (const block of blocks) {
        const name = findFirstField(block, "FN") || findFirstField(block, "N");
        if (!name) continue;
        const phone = findFirstField(block, "TEL");
        const email = findFirstField(block, "EMAIL");
        const birthday = parseBday(findFirstField(block, "BDAY"));
        const orgRaw = findFirstField(block, "ORG");
        const organization = orgRaw ? orgRaw.split(";")[0].trim() : undefined;
        const title = findFirstField(block, "TITLE");
        const adrRaw = findFirstField(block, "ADR");
        // ADR: ;;Street;Locality;Region;PostalCode;Country — 비어있지 않은 부분만 join
        const address = adrRaw ? adrRaw.split(";").map(s => s.trim()).filter(Boolean).join(", ") : undefined;
        const note = findFirstField(block, "NOTE");
        const catsRaw = findFirstField(block, "CATEGORIES");
        // CATEGORIES는 콤마로 구분된 라벨 목록 — 시스템 라벨 자동 제외
        const labels = catsRaw ? filterSystemLabels(catsRaw.split(",").map(s => s.trim()).filter(Boolean)) : undefined;
        const fav = findFirstField(block, "X-FAVORITE");
        const is_favorite = fav === "1" || fav === "true";
        // FN 없고 N만 있는 경우 합치기
        const finalName = !findFirstField(block, "FN") && name.includes(";")
            ? name.split(";").filter(Boolean).reverse().join("").trim() // 한국어: 성+이름 합침
            : name;
        out.push({ name: finalName, phone, email, birthday, organization, title, address, labels, note, is_favorite });
    }
    return out;
}

// ── 한글 초성 (Chosung) 유틸 ─────────────────────────────────
// "이호빈" → "ㅇㅎㅂ" 으로 변환해 검색·인덱스에 사용.
const CHOSUNG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
function getChosung(str: string): string {
    let r = "";
    for (const ch of str) {
        const code = ch.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) {
            r += CHOSUNG[Math.floor((code - 0xac00) / 588)];
        } else {
            r += ch;
        }
    }
    return r;
}

// 가나다 인덱스용 — 첫 글자에서 초성 1개. 한글 아니면 영문 대문자 또는 '#'.
function getInitialChar(name: string): string {
    if (!name) return "#";
    // 보이지 않는 문자 (BOM, ZWSP, RTL/LTR mark, control chars, NBSP) 제거 — 잘못 분류되는 원인.
    const cleaned = Array.from(name).filter(c => { const cc = c.charCodeAt(0); return !(cc < 0x20 || (cc >= 0x7F && cc <= 0xA0) || (cc >= 0x200B && cc <= 0x200F) || (cc >= 0x2028 && cc <= 0x202F) || (cc >= 0x205F && cc <= 0x206F) || cc === 0xFEFF); }).join("").trim();
    if (!cleaned) return "#";
    const ch = cleaned[0];
    const code = ch.charCodeAt(0);
    // 1) 한글 음절 (가-힣)
    if (code >= 0xac00 && code <= 0xd7a3) {
        return CHOSUNG[Math.floor((code - 0xac00) / 588)];
    }
    // 2) 영문
    if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
    // 3) 한글 호환 자모 (ㄱ~ㅎ U+3131~U+314E) — 직접 매핑
    const COMPAT: Record<number, string> = {
        0x3131: "ㄱ", 0x3132: "ㄲ", 0x3134: "ㄴ", 0x3137: "ㄷ", 0x3138: "ㄸ",
        0x3139: "ㄹ", 0x3141: "ㅁ", 0x3142: "ㅂ", 0x3143: "ㅃ", 0x3145: "ㅅ",
        0x3146: "ㅆ", 0x3147: "ㅇ", 0x3148: "ㅈ", 0x3149: "ㅉ", 0x314A: "ㅊ",
        0x314B: "ㅋ", 0x314C: "ㅌ", 0x314D: "ㅍ", 0x314E: "ㅎ",
    };
    if (COMPAT[code]) return COMPAT[code];
    // 4) 한글 자모 초성 (U+1100~U+1112) — vCard 분해형 입력 대비
    const JAMO_CHO: Record<number, string> = {
        0x1100: "ㄱ", 0x1101: "ㄲ", 0x1102: "ㄴ", 0x1103: "ㄷ", 0x1104: "ㄸ",
        0x1105: "ㄹ", 0x1106: "ㅁ", 0x1107: "ㅂ", 0x1108: "ㅃ", 0x1109: "ㅅ",
        0x110A: "ㅆ", 0x110B: "ㅇ", 0x110C: "ㅈ", 0x110D: "ㅉ", 0x110E: "ㅊ",
        0x110F: "ㅋ", 0x1110: "ㅌ", 0x1111: "ㅍ", 0x1112: "ㅎ",
    };
    if (JAMO_CHO[code]) return JAMO_CHO[code];
    return "#";
}

const ALPHABET_INDEX = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ",
                        "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","#"];

// ── 전화번호 자동 포맷 (한국) ────────────────────────────────
function formatPhoneKR(s: string): string {
    if (!s) return "";
    const d = s.replace(/[^0-9+]/g, "");
    // 국제번호 +82 → 010 변환 후 포맷
    if (d.startsWith("+82")) return formatPhoneKR("0" + d.slice(3));
    if (d.startsWith("82") && d.length >= 11) return formatPhoneKR("0" + d.slice(2));
    if (d.startsWith("010") && d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
    if (d.startsWith("011") || d.startsWith("016") || d.startsWith("017") || d.startsWith("018") || d.startsWith("019")) {
        if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
        if (d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
    }
    if (d.startsWith("02") && d.length >= 9 && d.length <= 10) {
        return d.length === 9 ? `${d.slice(0,2)}-${d.slice(2,5)}-${d.slice(5)}` : `${d.slice(0,2)}-${d.slice(2,6)}-${d.slice(6)}`;
    }
    if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
    if (d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
    return s;
}

// ── vCard 3.0 export ──────────────────────────────────────────
// iOS Contacts 앱과 macOS Contacts에서 100% import 되도록:
//   - VERSION:3.0 (iOS 표준)
//   - PRODID 명시
//   - N 필드 ASCII 안전하게 분해 (Last;First)
//   - TYPE=CELL,VOICE,pref 등 iOS가 인식하는 타입
//   - CATEGORIES → 라벨로 import (Google) / 그룹으로 (iOS)
//   - 모든 line CRLF 종결, 75자 fold (긴 NOTE 대응)
function escapeVcf(s: string): string {
    return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
// 75자 단위로 line folding (RFC 6350)
function foldVcardLine(line: string): string {
    if (line.length <= 75) return line;
    const out: string[] = [];
    out.push(line.slice(0, 75));
    let i = 75;
    while (i < line.length) {
        out.push(" " + line.slice(i, i + 74));
        i += 74;
    }
    return out.join("\r\n");
}
// 한국어 이름을 N 필드 형식으로 분해
// "홍길동" → "홍;길동;;;" (성;이름)
// "Hong Gildong" → "Gildong;Hong;;;"
function splitName(name: string): string {
    const trimmed = name.trim();
    // 한국어 성씨 (1~2글자)
    if (/^[가-힣]+$/.test(trimmed)) {
        if (trimmed.length >= 2) {
            return `${trimmed[0]};${trimmed.slice(1)};;;`;
        }
        return `${trimmed};;;;`;
    }
    // 영문: 마지막이 last name
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
        return `${parts.pop()};${parts.join(" ")};;;`;
    }
    return `${trimmed};;;;`;
}
function contactToVcf(c: Contact): string {
    const lines: string[] = [];
    lines.push("BEGIN:VCARD");
    lines.push("VERSION:3.0");
    lines.push("PRODID:-//Ten:One Universe//Planners Contacts//KO");
    lines.push(`FN:${escapeVcf(c.name)}`);
    lines.push(`N:${splitName(c.name).split(";").map(escapeVcf).join(";")}`);
    if (c.phone) {
        // 한 번만 추출해 디지트 형태로 저장 (iOS 호환 우선)
        lines.push(`TEL;TYPE=CELL,VOICE:${escapeVcf(c.phone)}`);
    }
    if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcf(c.email)}`);
    if (c.organization) {
        // ORG는 부서 구분에 ; 사용. 직책은 별도 TITLE.
        lines.push(`ORG:${escapeVcf(c.organization)}`);
    }
    if (c.title) lines.push(`TITLE:${escapeVcf(c.title)}`);
    if (c.address) {
        // ADR:PostOfficeBox;ExtendedAddr;Street;Locality;Region;PostalCode;Country
        lines.push(`ADR;TYPE=HOME:;;${escapeVcf(c.address)};;;;`);
    }
    if (c.birthday) {
        // c.birthday = "MM-DD" → 표준 YYYY-MM-DD 형식 (연도 없으면 1900 사용해 iOS 호환)
        const [mm, dd] = c.birthday.split("-");
        if (mm && dd) lines.push(`BDAY:1900-${mm}-${dd}`);
    }
    if (c.note) lines.push(`NOTE:${escapeVcf(c.note)}`);
    // 라벨 + 그룹을 CATEGORIES로 (Google·iOS 둘 다 인식)
    const cats: string[] = [];
    if (c.labels && c.labels.length > 0) cats.push(...c.labels);
    if (c.group_name) cats.push(c.group_name);
    if (c.relationship) cats.push(c.relationship);
    if (cats.length > 0) {
        // 중복 제거
        const uniq = Array.from(new Set(cats));
        lines.push(`CATEGORIES:${uniq.map(escapeVcf).join(",")}`);
    }
    if (c.is_favorite) {
        // Apple은 X-FAV, Google은 starred를 인식 안 하므로 LABEL로
        lines.push("X-FAVORITE:1");
    }
    lines.push("END:VCARD");
    return lines.map(foldVcardLine).join("\r\n");
}

// ── 다가오는 생일 계산 ────────────────────────────────────────
// birthday는 "MM-DD" 형식. 오늘부터 N일 이내 도래(또는 오늘)의 생일자만 반환.
interface BirthdayItem { id: string; name: string; mmdd: string; daysUntil: number; isToday: boolean; }
function computeUpcomingBirthdays<T extends { id: string; name: string; birthday?: string }>(
    list: T[], windowDays = 14
): BirthdayItem[] {
    const today = new Date();
    const yyyy = today.getFullYear();
    const out: BirthdayItem[] = [];
    for (const c of list) {
        if (!c.birthday) continue;
        const m = c.birthday.match(/^(\d{2})-(\d{2})$/);
        if (!m) continue;
        const [, mm, dd] = m;
        // 올해 도래 후보, 이미 지났으면 내년
        let target = new Date(yyyy, parseInt(mm) - 1, parseInt(dd));
        target.setHours(0, 0, 0, 0);
        const today0 = new Date(today); today0.setHours(0, 0, 0, 0);
        let diff = Math.round((target.getTime() - today0.getTime()) / 86400000);
        if (diff < 0) {
            target = new Date(yyyy + 1, parseInt(mm) - 1, parseInt(dd));
            diff = Math.round((target.getTime() - today0.getTime()) / 86400000);
        }
        if (diff <= windowDays) {
            out.push({ id: c.id, name: c.name, mmdd: `${mm}-${dd}`, daysUntil: diff, isToday: diff === 0 });
        }
    }
    return out.sort((a, b) => a.daysUntil - b.daysUntil);
}

// ── 빠른 추가 한 줄 파서 ──────────────────────────────────────
// "홍길동 010-1234-5678 hong@x.com Acme 대표" → { name, phone, email, organization, title }
const QUICK_PHONE_RE = /(\+?\d[\d\s\-()]{8,}\d)/;
const QUICK_EMAIL_RE = /([\w.+-]+@[\w-]+\.[\w.-]+)/i;
function parseQuickAdd(input: string): Partial<Contact> | null {
    const text = input.trim();
    if (!text) return null;
    let remaining = text;
    let phone = "";
    let email = "";
    const phoneM = remaining.match(QUICK_PHONE_RE);
    if (phoneM) {
        phone = phoneM[1].replace(/[^0-9+]/g, "");
        remaining = remaining.replace(phoneM[1], "").trim();
    }
    const emailM = remaining.match(QUICK_EMAIL_RE);
    if (emailM) {
        email = emailM[1];
        remaining = remaining.replace(emailM[1], "").trim();
    }
    // 남은 토큰: [이름, 회사?, 직책?]. 공백/콤마 분리.
    const tokens = remaining.split(/[,\s]+/).filter(Boolean);
    if (tokens.length === 0 && !phone && !email) return null;
    const name = tokens[0] || (phone || email || "이름 없음");
    const organization = tokens[1] || "";
    const title = tokens.slice(2).join(" ") || "";
    return { name, phone, email, organization, title };
}

// ── CSV import/export ─────────────────────────────────────────
// 자체 단순 포맷 + Google Contacts CSV 헤더도 인식.
// 자체 헤더: Name, Phone, Email, Organization, Title, Address, Birthday, Group, Labels, Note, Favorite
function csvEscape(v: unknown): string {
    const s = v == null ? "" : String(v);
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}
function contactsToCsv(list: Contact[]): string {
    const headers = ["Name", "Phone", "Email", "Organization", "Title", "Address", "Birthday", "Group", "Labels", "Note", "Favorite"];
    const rows = list.map(c => [
        c.name,
        c.phone || "",
        c.email || "",
        c.organization || "",
        c.title || "",
        c.address || "",
        c.birthday || "",
        c.group_name || "",
        (c.labels || []).join(";"),
        c.note || "",
        c.is_favorite ? "1" : "",
    ].map(csvEscape).join(","));
    // Excel 한글 호환을 위해 BOM 포함
    return "\uFEFF" + headers.join(",") + "\r\n" + rows.join("\r\n");
}
// 간단 CSV 파서 — quoted field, escaped quote, comma separator 처리
function parseCsv(text: string): string[][] {
    // BOM 제거
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuote) {
            if (ch === '"') {
                if (text[i + 1] === '"') { cell += '"'; i++; }
                else { inQuote = false; }
            } else {
                cell += ch;
            }
        } else {
            if (ch === '"') { inQuote = true; }
            else if (ch === ",") { row.push(cell); cell = ""; }
            else if (ch === "\r") { /* skip */ }
            else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
            else { cell += ch; }
        }
    }
    if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(c => c.trim()));
}
// Google Contacts CSV 헤더 매핑 (영문/한글 일부)
function findCsvCol(headers: string[], aliases: string[]): number {
    const lower = headers.map(h => h.toLowerCase().trim());
    for (const a of aliases) {
        const i = lower.indexOf(a.toLowerCase());
        if (i >= 0) return i;
    }
    return -1;
}
function parseCsvText(text: string): ParsedContact[] {
    const rows = parseCsv(text);
    if (rows.length < 2) return [];
    const headers = rows[0];
    // 자체 헤더
    const idxName  = findCsvCol(headers, ["name", "이름"]);
    const idxPhone = findCsvCol(headers, ["phone", "전화", "전화번호", "phone 1 - value", "mobile phone"]);
    const idxEmail = findCsvCol(headers, ["email", "이메일", "e-mail 1 - value", "e-mail address"]);
    const idxOrg   = findCsvCol(headers, ["organization", "회사", "organization 1 - name", "company"]);
    const idxTitle = findCsvCol(headers, ["title", "직책", "organization 1 - title", "job title"]);
    const idxAddr  = findCsvCol(headers, ["address", "주소", "address 1 - formatted"]);
    const idxBday  = findCsvCol(headers, ["birthday", "생일"]);
    const idxGroup = findCsvCol(headers, ["group", "그룹"]);
    const idxLabels= findCsvCol(headers, ["labels", "라벨", "group membership", "categories"]);
    const idxNote  = findCsvCol(headers, ["note", "메모", "notes"]);
    const idxFav   = findCsvCol(headers, ["favorite", "즐겨찾기", "starred"]);
    // Google CSV는 별도 Given Name/Family Name 등도 있음. fallback.
    const idxGiven = findCsvCol(headers, ["given name", "이름"]);
    const idxFamily= findCsvCol(headers, ["family name", "성"]);

    const out: ParsedContact[] = [];
    for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        let name = idxName >= 0 ? (row[idxName] || "").trim() : "";
        if (!name && idxFamily >= 0 && idxGiven >= 0) {
            name = `${row[idxFamily] || ""}${row[idxGiven] || ""}`.trim();
        }
        if (!name) continue;
        const labelsRaw = idxLabels >= 0 ? (row[idxLabels] || "") : "";
        // labels: ; 또는 , 또는 :::로 구분 (Google은 ::: 사용). 시스템 라벨 자동 제외
        const labels = labelsRaw
            ? filterSystemLabels(labelsRaw.split(/[;,:]{1,3}/).map(s => s.trim()).filter(Boolean))
            : undefined;
        out.push({
            name,
            phone: idxPhone >= 0 ? (row[idxPhone] || "").trim() || undefined : undefined,
            email: idxEmail >= 0 ? (row[idxEmail] || "").trim() || undefined : undefined,
            organization: idxOrg >= 0 ? (row[idxOrg] || "").trim() || undefined : undefined,
            title: idxTitle >= 0 ? (row[idxTitle] || "").trim() || undefined : undefined,
            address: idxAddr >= 0 ? (row[idxAddr] || "").trim() || undefined : undefined,
            birthday: idxBday >= 0 ? (row[idxBday] || "").trim() || undefined : undefined,
            labels,
            note: idxNote >= 0 ? (row[idxNote] || "").trim() || undefined : undefined,
            is_favorite: idxFav >= 0 ? !!(row[idxFav] || "").trim() : undefined,
            group_name: idxGroup >= 0 ? (row[idxGroup] || "").trim() || undefined : undefined,
        });
    }
    return out;
}

interface Contact {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    group_name?: string;
    relationship?: string;
    note?: string;
    birthday?: string;
    organization?: string;
    title?: string;
    address?: string;
    is_favorite?: boolean;
    last_contacted_at?: string;
    labels?: string[];
}

const RELATIONSHIPS = ["가족", "연인", "친구", "직장", "기타"] as const;

const RELATIONSHIP_COLORS: Record<string, string> = {
    가족: "bg-rose-100 text-rose-700",
    연인: "bg-pink-100 text-pink-700",
    친구: "bg-sky-100 text-sky-700",
    직장: "bg-amber-100 text-amber-700",
    기타: "bg-neutral-100 text-neutral-600",
};

function emptyForm(): Omit<Contact, "id"> {
    return {
        name: "", phone: "", email: "",
        group_name: "", relationship: "",
        note: "", birthday: "",
        organization: "", title: "", address: "",
        is_favorite: false,
        labels: [],
    };
}

export function ContactsView() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    // view: "all" | "favorites" | "unclassified" | "label:xxx" | "group:xxx"
    const [view, setView] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Contact | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
    // selectMode 제거 — selectedIds.size > 0 자체가 선택 상태.
    // 행 호버 시 체크박스 자동 노출, 한 명 체크하면 상단 액션바 자동 등장.
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [favoritingId, setFavoritingId] = useState<string | null>(null);
    // letterFilter: 'top' = 즐겨찾기+최근만 표시 (기본·빠른 로딩), 'all' = 전체, 'ㄱ'·'A' 등 = 해당 초성/알파벳만.
    // 우측 인덱스 클릭 시 해당 letter로 필터링 — 전체 렌더 X (성능 부담 방지).
    const [letterFilter, setLetterFilter] = useState<string>("top");
    // 인스타식 무한 스크롤 — visibleRows를 50개씩 점진 노출
    const PAGE_SIZE = 50;
    const [renderLimit, setRenderLimit] = useState(PAGE_SIZE);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string | null>(null);
    const [confirmAutoMerge, setConfirmAutoMerge] = useState(false);
    const [confirmImportMerge, setConfirmImportMerge] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    function showToast(text: string, ok = true) {
        setToast({ text, ok });
        setTimeout(() => setToast(null), 3000);
    }

    async function load() {
        setLoading(true);
        const res = await fetch("/api/planners/contacts", { cache: "no-store" });
        if (res.ok) {
            const d = await res.json();
            setContacts(d.contacts ?? []);
        }
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    // letterFilter / view / search 바뀔 때 무한 스크롤 limit 리셋
    useEffect(() => { setRenderLimit(PAGE_SIZE); }, [letterFilter, view, search]);

    // 인스타식 무한 스크롤 — sentinel이 viewport에 들어오면 50명씩 추가 로드
    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;
        const io = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting) {
                setRenderLimit(prev => prev + PAGE_SIZE);
            }
        }, { rootMargin: "300px 0px" });
        io.observe(node);
        return () => io.disconnect();
    }, [letterFilter, view, search, contacts.length]);

    // 라벨/그룹별 카운트 — 좌측 사이드바에 표시
    const labelCounts: Record<string, number> = {};
    const groupCounts: Record<string, number> = {};
    let unclassifiedCount = 0;
    contacts.forEach(c => {
        (c.labels || []).forEach(l => { labelCounts[l] = (labelCounts[l] || 0) + 1; });
        if (c.group_name) groupCounts[c.group_name] = (groupCounts[c.group_name] || 0) + 1;
        if (!c.group_name && (!c.labels || c.labels.length === 0)) unclassifiedCount++;
    });
    const allLabels = Object.keys(labelCounts).sort((a, b) => a.localeCompare(b, "ko"));
    const allGroups = Object.keys(groupCounts).sort((a, b) => a.localeCompare(b, "ko"));
    const favoritesCount = contacts.filter(c => c.is_favorite).length;

    // 검색: 이름/전화/이메일/회사 + 한글 초성 매칭
    const filtered = contacts.filter(c => {
        const q = search.trim();
        let matchSearch = !q;
        if (!matchSearch) {
            const ql = q.toLowerCase();
            const nameLower = c.name.toLowerCase();
            const orgLower = (c.organization || "").toLowerCase();
            if (
                nameLower.includes(ql) ||
                (c.phone ?? "").replace(/[^0-9]/g, "").includes(q.replace(/[^0-9]/g, "")) ||
                (c.email ?? "").toLowerCase().includes(ql) ||
                orgLower.includes(ql)
            ) {
                matchSearch = true;
            }
            // 초성 매칭
            if (!matchSearch && /^[ㄱ-ㅎ]+$/.test(q)) {
                if (getChosung(c.name).includes(q)) matchSearch = true;
            }
        }
        let matchView = true;
        if (view === "favorites") matchView = !!c.is_favorite;
        else if (view === "unclassified") matchView = !c.group_name && (!c.labels || c.labels.length === 0);
        else if (view === "recent") matchView = !!c.last_contacted_at;
        else if (view.startsWith("label:")) matchView = (c.labels || []).includes(view.slice(6));
        else if (view.startsWith("group:")) matchView = c.group_name === view.slice(6);
        return matchSearch && matchView;
    });

    // 정렬: recent 뷰면 last_contacted_at 내림차순, 그 외엔 즐겨찾기 → 가나다
    const sortedRows = view === "recent"
        ? [...filtered].sort((a, b) => (b.last_contacted_at || "").localeCompare(a.last_contacted_at || ""))
        : [...filtered].sort((a, b) => {
            if ((a.is_favorite ? 1 : 0) !== (b.is_favorite ? 1 : 0)) return a.is_favorite ? -1 : 1;
            return a.name.localeCompare(b.name, "ko");
        });
    const recentCount = contacts.filter(c => c.last_contacted_at).length;

    // 가나다 인덱스 — 실제 존재하는 첫 글자만 활성화
    const presentInitials = new Set<string>();
    sortedRows.forEach(c => presentInitials.add(getInitialChar(c.name)));

    // ── letterFilter 적용 (성능 최적화) ──
    // - 'top' = 즐겨찾기 + 최근 사용한 사람만 표시 (초기 진입 화면)
    // - 'all' = 전체
    // - 'ㄱ', 'A' 등 = 해당 초성/알파벳만
    // view가 favorites/recent/label/group일 때는 letterFilter 무시 (이미 좁혀진 결과)
    const isCompactView = view === "all" && !search.trim();
    const topFavoritesRows = view === "all" && letterFilter === "top"
        ? sortedRows.filter(c => c.is_favorite).slice(0, 50)
        : [];
    const topRecentRows = view === "all" && letterFilter === "top"
        ? sortedRows
            .filter(c => !!c.last_contacted_at && !c.is_favorite)
            .sort((a, b) => (b.last_contacted_at || "").localeCompare(a.last_contacted_at || ""))
            .slice(0, 30)
        : [];
    // 즐겨찾기·최근이 둘 다 비어 있으면 top 모드라도 자동으로 All 리스트 노출
    const topHasContent = topFavoritesRows.length > 0 || topRecentRows.length > 0;
    const visibleRows = (() => {
        if (!isCompactView) return sortedRows;
        if (letterFilter === "top") return topHasContent ? [] : sortedRows;
        if (letterFilter === "all") return sortedRows;
        return sortedRows.filter(c => getInitialChar(c.name) === letterFilter);
    })();
    // 인스타식 무한 스크롤 — 점진 노출
    const renderedRows = visibleRows.slice(0, renderLimit);
    const hasMore = visibleRows.length > renderedRows.length;
    // 인덱스별 카운트 (배지용)
    const initialCounts: Record<string, number> = {};
    sortedRows.forEach(c => {
        const init = getInitialChar(c.name);
        initialCounts[init] = (initialCounts[init] || 0) + 1;
    });

    function openNew() {
        setEditing(null);
        setForm(emptyForm());
        setModalOpen(true);
    }

    function openEdit(c: Contact) {
        setEditing(c);
        setForm({
            name: c.name,
            phone: c.phone ?? "",
            email: c.email ?? "",
            group_name: c.group_name ?? "",
            relationship: c.relationship ?? "",
            note: c.note ?? "",
            birthday: c.birthday ?? "",
            organization: c.organization ?? "",
            title: c.title ?? "",
            address: c.address ?? "",
            is_favorite: c.is_favorite ?? false,
            labels: c.labels ?? [],
        });
        setModalOpen(true);
    }

    async function save() {
        if (!form.name.trim()) return;
        setSaving(true);
        // 전화번호 입력 그대로 두지 않고 자동 포맷 적용
        const formattedPhone = form.phone ? formatPhoneKR(form.phone) : "";
        const payload = {
            name: form.name.trim(),
            phone: formattedPhone || null,
            email: form.email || null,
            group_name: form.group_name || null,
            relationship: form.relationship || null,
            note: form.note || null,
            birthday: form.birthday || null,
            organization: form.organization || null,
            title: form.title || null,
            address: form.address || null,
            is_favorite: !!form.is_favorite,
            labels: form.labels || [],
        };
        if (editing) {
            await fetch("/api/planners/contacts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
        } else {
            await fetch("/api/planners/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        }
        setSaving(false);
        setModalOpen(false);
        load();
    }

    async function remove(id: string) {
        setDeleting(id);
        await fetch(`/api/planners/contacts?id=${id}`, { method: "DELETE" });
        setDeleting(null);
        setContacts(prev => prev.filter(c => c.id !== id));
        showToast("삭제되었습니다.");
    }

    // 즐겨찾기 토글 — optimistic update
    async function toggleFavorite(c: Contact) {
        const next = !c.is_favorite;
        setFavoritingId(c.id);
        setContacts(prev => prev.map(x => x.id === c.id ? { ...x, is_favorite: next } : x));
        try {
            const r = await fetch("/api/planners/contacts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: c.id, is_favorite: next }),
            });
            if (!r.ok) throw new Error("fail");
        } catch {
            // 롤백
            setContacts(prev => prev.map(x => x.id === c.id ? { ...x, is_favorite: !next } : x));
            showToast("즐겨찾기 변경 실패", false);
        } finally {
            setFavoritingId(null);
        }
    }

    // 다중 선택 토글
    function toggleSelected(id: string) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }
    function selectAll() {
        setSelectedIds(new Set(filtered.map(c => c.id)));
    }
    function clearSelection() {
        setSelectedIds(new Set());
    }
    // 표시 중 행 전체 선택/해제 토글 (테이블 헤더 체크박스용)
    function toggleSelectAllVisible() {
        const visibleIds = sortedRows.map(c => c.id);
        const allSelected = visibleIds.every(id => selectedIds.has(id));
        if (allSelected) {
            // 표시 중인 것만 해제 (다른 뷰에서 선택된 건 유지)
            setSelectedIds(prev => {
                const next = new Set(prev);
                visibleIds.forEach(id => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                visibleIds.forEach(id => next.add(id));
                return next;
            });
        }
    }

    // 일괄 삭제 (bulk endpoint 사용 — 1번 요청)
    async function bulkDelete() {
        if (selectedIds.size === 0) return;
        const ids = [...selectedIds];
        const idSet = new Set(ids);
        const CHUNK = 1000;
        let totalDeleted = 0;
        for (let i = 0; i < ids.length; i += CHUNK) {
            const slice = ids.slice(i, i + CHUNK);
            const r = await fetch("/api/planners/contacts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: slice }),
            });
            if (r.ok) {
                const d = await r.json().catch(() => ({}));
                totalDeleted += d.deleted ?? slice.length;
            }
        }
        setContacts(prev => prev.filter(c => !idSet.has(c.id)));
        clearSelection();
        showToast(`${totalDeleted.toLocaleString("ko-KR")}명 삭제됨`, true);
    }

    // 내보내기 — format: "vcard" | "csv", scope: "selected" | "all" | "filtered"
    function exportContacts(format: "vcard" | "csv", scope: "selected" | "all" | "filtered") {
        setExporting(true);
        try {
            const target =
                scope === "selected" ? contacts.filter(c => selectedIds.has(c.id))
                : scope === "filtered" ? filtered
                : contacts;
            if (target.length === 0) {
                showToast("내보낼 연락처가 없습니다.", false);
                return;
            }
            const date = localDateStr(new Date());
            let blob: Blob;
            let filename: string;
            if (format === "csv") {
                blob = new Blob([contactsToCsv(target)], { type: "text/csv;charset=utf-8" });
                filename = `contacts-${date}.csv`;
            } else {
                const vcf = target.map(contactToVcf).join("\r\n");
                blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
                filename = `contacts-${date}.vcf`;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            showToast(`${target.length.toLocaleString("ko-KR")}명을 ${format.toUpperCase()}로 내보냈습니다.`);
            if (scope === "selected") clearSelection();
        } finally {
            setExporting(false);
        }
    }
    // 호환 alias (기존 호출부)
    const exportVcards = (scope: "selected" | "all" | "filtered") => exportContacts("vcard", scope);

    // ── 라벨 관리 함수들 ────────────────────────────────────
    async function applyLabelsToSelected(add: string[], remove: string[] = []) {
        if (selectedIds.size === 0) return;
        const ids = [...selectedIds];
        const r = await fetch("/api/planners/contacts/labels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, add, remove }),
        });
        if (r.ok) {
            const d = await r.json();
            // optimistic local update
            setContacts(prev => prev.map(c => {
                if (!selectedIds.has(c.id)) return c;
                const cur = new Set(c.labels || []);
                add.forEach(l => cur.add(l));
                remove.forEach(l => cur.delete(l));
                return { ...c, labels: [...cur] };
            }));
            const fmt = (n: number) => n.toLocaleString("ko-KR");
            const action = add.length > 0 ? `+${add.join(", ")}` : `-${remove.join(", ")}`;
            showToast(`${fmt(d.updated ?? ids.length)}명에 라벨 적용 (${action})`);
        } else {
            showToast("라벨 적용 실패", false);
        }
    }
    async function renameLabel(from: string, to: string) {
        if (!to.trim() || from === to) return;
        const r = await fetch("/api/planners/contacts/labels", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from, to }),
        });
        if (r.ok) {
            const d = await r.json();
            // optimistic
            setContacts(prev => prev.map(c => {
                if (!c.labels?.includes(from)) return c;
                return { ...c, labels: Array.from(new Set(c.labels.map(l => l === from ? to : l))) };
            }));
            // 현재 view가 이 라벨이면 새 이름으로 갱신
            if (view === `label:${from}`) setView(`label:${to}`);
            showToast(`라벨 "${from}" → "${to}" (${(d.updated ?? 0).toLocaleString("ko-KR")}명 갱신)`);
        } else {
            showToast("이름 변경 실패", false);
        }
    }
    async function deleteLabel(name: string) {
        const r = await fetch(`/api/planners/contacts/labels?name=${encodeURIComponent(name)}`, { method: "DELETE" });
        if (r.ok) {
            const d = await r.json();
            setContacts(prev => prev.map(c =>
                c.labels?.includes(name) ? { ...c, labels: c.labels.filter(l => l !== name) } : c
            ));
            if (view === `label:${name}`) setView("all");
            showToast(`라벨 "${name}" 제거 (${(d.updated ?? 0).toLocaleString("ko-KR")}명)`);
        } else {
            showToast("삭제 실패", false);
        }
    }

    // 라벨 적용 popover 상태
    const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);
    // 빠른 추가 입력
    const [quickInput, setQuickInput] = useState("");
    const [quickAdding, setQuickAdding] = useState(false);
    // Bulk edit · 수동 병합 모달
    const [bulkEditOpen, setBulkEditOpen] = useState(false);
    const [mergeOpen, setMergeOpen] = useState(false);

    // ── 다가오는 생일 (14일 내) ────────────────────────
    const upcomingBirthdays = computeUpcomingBirthdays(contacts, 14);

    // ── 빠른 추가 ─────────────────────────────────────
    async function quickAdd() {
        const parsed = parseQuickAdd(quickInput);
        if (!parsed) { showToast("입력 형식을 인식하지 못했습니다", false); return; }
        setQuickAdding(true);
        try {
            const r = await fetch("/api/planners/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed),
            });
            if (r.ok) {
                const d = await r.json();
                if (d.contact) setContacts(prev => [...prev, d.contact]);
                setQuickInput("");
                showToast(`${parsed.name} 추가됨`);
            } else {
                showToast("추가 실패", false);
            }
        } finally {
            setQuickAdding(false);
        }
    }

    // ── 마지막 연락 자동 추적 ──────────────────────────
    async function recordContact(id: string) {
        const now = new Date().toISOString();
        // optimistic
        setContacts(prev => prev.map(c => c.id === id ? { ...c, last_contacted_at: now } : c));
        try {
            await fetch("/api/planners/contacts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, last_contacted_at: now }),
            });
        } catch { /* silent */ }
    }

    // ── 수동 병합 ─────────────────────────────────────
    async function performMerge(keepId: string, mergeIds: string[], merged: Partial<Contact>) {
        // 1) keep 행을 merged 데이터로 update
        const r = await fetch("/api/planners/contacts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: keepId, ...merged }),
        });
        if (!r.ok) { showToast("병합 실패", false); return; }
        // 2) 나머지 ids 삭제
        if (mergeIds.length > 0) {
            await fetch("/api/planners/contacts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: mergeIds }),
            });
        }
        const removed = new Set(mergeIds);
        setContacts(prev => prev.map(c => c.id === keepId ? { ...c, ...merged } as Contact : c).filter(c => !removed.has(c.id)));
        clearSelection();
        showToast(`${(mergeIds.length + 1).toLocaleString("ko-KR")}명을 1명으로 병합 완료`);
    }

    // ── Bulk Edit ────────────────────────────────────
    async function bulkEditApply(patch: Partial<Contact>) {
        if (selectedIds.size === 0) return;
        const ids = [...selectedIds];
        const CHUNK = 50;
        let updated = 0;
        for (let i = 0; i < ids.length; i += CHUNK) {
            const slice = ids.slice(i, i + CHUNK);
            const results = await Promise.all(
                slice.map(id =>
                    fetch("/api/planners/contacts", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, ...patch }),
                    }).then(r => r.ok).catch(() => false)
                )
            );
            updated += results.filter(Boolean).length;
        }
        // optimistic
        setContacts(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, ...patch } : c));
        showToast(`${updated.toLocaleString("ko-KR")}명 일괄 수정`);
    }

    // 클립보드 복사 (전화·이메일)
    async function copyText(text: string, key: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 1500);
        } catch {
            showToast("복사 실패", false);
        }
    }

    // 가나다 인덱스 점프
    function jumpToInitial(initial: string) {
        const el = listRef.current?.querySelector(`[data-initial="${initial}"]`);
        if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function importContactsFile(file: File) {
        setImporting(true);
        const reader = new FileReader();
        reader.onerror = () => {
            setImporting(false);
            showToast("파일을 읽을 수 없습니다.", false);
        };
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) {
                    showToast("빈 파일입니다.", false);
                    return;
                }
                // 파일 형식 자동 감지 (확장자 + 내용)
                const fname = file.name.toLowerCase();
                const isCsv = fname.endsWith(".csv") || fname.endsWith(".tsv") || (text.startsWith("\uFEFF") || /^[A-Za-z][^,\n]*,/.test(text.slice(0, 200)));
                const isVcf = fname.endsWith(".vcf") || fname.endsWith(".vcard") || /BEGIN:VCARD/i.test(text);
                const parsed = isVcf ? parseVcardText(text) : isCsv ? parseCsvText(text) : parseVcardText(text);
                if (parsed.length === 0) {
                    showToast("파일에서 연락처를 찾지 못했습니다.", false);
                    return;
                }
                // 1000개씩 chunk → bulk POST.
                // mergeLabels=true면 기존 매칭 연락처에 라벨/빈 필드 병합 update.
                const mergeLabels = !!(window as unknown as { __plannersImportMergeMode?: boolean }).__plannersImportMergeMode;
                const CHUNK = 1000;
                let inserted = 0;
                let skipped = 0;
                let merged = 0;
                for (let i = 0; i < parsed.length; i += CHUNK) {
                    const slice = parsed.slice(i, i + CHUNK);
                    const r = await fetch("/api/planners/contacts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contacts: slice, skip_duplicates: true, merge_labels: mergeLabels }),
                    });
                    if (r.ok) {
                        const d = await r.json().catch(() => ({}));
                        inserted += d.inserted ?? 0;
                        skipped += d.skipped ?? 0;
                        merged += d.merged ?? 0;
                    }
                }
                load();
                const fmt = (n: number) => n.toLocaleString("ko-KR");
                if (mergeLabels) {
                    showToast(`동기화 완료: ${fmt(merged)}명 라벨 병합 · ${fmt(inserted)}명 신규`);
                } else if (skipped > 0 && inserted > 0) {
                    showToast(`${fmt(inserted)}명 추가 · ${fmt(skipped)}명 중복 스킵`);
                } else if (skipped > 0 && inserted === 0) {
                    showToast(`전부 중복(${fmt(skipped)}명) — 추가 없음`, false);
                } else if (inserted > 0) {
                    showToast(`${fmt(inserted)}명 가져왔습니다.`);
                } else {
                    showToast("가져오기 실패", false);
                }
                (window as unknown as { __plannersImportMergeMode?: boolean }).__plannersImportMergeMode = false;
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file, "utf-8");
    }

    // 중복 검출 — phone(숫자만, 한국 끝 8자리), email(소문자 trim), 같은 이름+회사 fallback.
    // 한국 휴대폰 +82 prefix·국가코드 변환 고려하여 마지막 8자리로 비교 (010-1234-5678 → 12345678).
    function findDuplicateGroups(): Contact[][] {
        function normalizePhone(p: string): string {
            const digits = p.replace(/[^0-9]/g, "");
            if (!digits) return "";
            // 국제번호 +82 → 0 변환
            const normalized = digits.startsWith("82") && digits.length >= 11 ? "0" + digits.slice(2) : digits;
            // 마지막 8자리 (한국 휴대폰·일반전화 모두 마지막 8자리는 식별자)
            return normalized.length >= 8 ? normalized.slice(-8) : normalized;
        }
        const byPhone = new Map<string, Contact[]>();
        const byEmail = new Map<string, Contact[]>();
        const byNameOrg = new Map<string, Contact[]>();
        for (const c of contacts) {
            if (c.phone) {
                const key = normalizePhone(c.phone);
                if (key.length >= 7) {
                    const list = byPhone.get(key) || [];
                    list.push(c);
                    byPhone.set(key, list);
                }
            }
            if (c.email) {
                const key = c.email.toLowerCase().trim();
                if (key) {
                    const list = byEmail.get(key) || [];
                    list.push(c);
                    byEmail.set(key, list);
                }
            }
            // 이름+회사 fallback (전화·이메일 둘 다 없는 경우만 비교 의미)
            if (!c.phone && !c.email && c.name) {
                const key = `${c.name.trim().toLowerCase()}|${(c.organization || "").trim().toLowerCase()}`;
                const list = byNameOrg.get(key) || [];
                list.push(c);
                byNameOrg.set(key, list);
            }
        }
        const groupsMap = new Map<string, Contact[]>(); // dedupe by member overlap
        const seen = new Set<string>();
        const addGroup = (list: Contact[]) => {
            if (list.length < 2) return;
            const ids = list.map(c => c.id).sort().join("|");
            if (seen.has(ids)) return;
            seen.add(ids);
            groupsMap.set(ids, list);
        };
        byPhone.forEach(addGroup);
        byEmail.forEach(addGroup);
        byNameOrg.forEach(addGroup);
        return [...groupsMap.values()];
    }

    const [dupModalOpen, setDupModalOpen] = useState(false);
    function openDupModal() {
        const groups = findDuplicateGroups();
        if (groups.length === 0) {
            showToast("중복된 연락처가 없습니다.");
            return;
        }
        setDupModalOpen(true);
    }
    const autoMergeToDeleteRef = useRef<string[]>([]);
    function autoMergeAll() {
        const groups = findDuplicateGroups();
        // 각 그룹에서 가장 정보가 많은 항목을 유지하고 나머지 삭제
        const toDelete: string[] = [];
        for (const g of groups) {
            const ranked = [...g].sort((a, b) => {
                const score = (c: Contact) =>
                    (c.is_favorite ? 100 : 0) +
                    (c.phone ? 1 : 0) + (c.email ? 1 : 0) + (c.organization ? 1 : 0) +
                    (c.title ? 1 : 0) + (c.address ? 1 : 0) + (c.note ? 1 : 0) +
                    (c.birthday ? 1 : 0) + ((c.labels?.length || 0));
                return score(b) - score(a);
            });
            for (let i = 1; i < ranked.length; i++) toDelete.push(ranked[i].id);
        }
        if (toDelete.length === 0) return;
        autoMergeToDeleteRef.current = toDelete;
        setConfirmAutoMerge(true);
    }
    async function executeAutoMerge() {
        const toDelete = autoMergeToDeleteRef.current;
        if (toDelete.length === 0) return;
        // 1000개씩 나누어 bulk delete
        const CHUNK = 1000;
        let totalDeleted = 0;
        for (let i = 0; i < toDelete.length; i += CHUNK) {
            const slice = toDelete.slice(i, i + CHUNK);
            const r = await fetch("/api/planners/contacts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: slice }),
            });
            if (r.ok) {
                const d = await r.json().catch(() => ({}));
                totalDeleted += d.deleted ?? slice.length;
            }
        }
        // optimistic: 즉시 화면에서 제거 (load 응답 기다리지 않음)
        const deletedSet = new Set(toDelete);
        setContacts(prev => prev.filter(c => !deletedSet.has(c.id)));
        showToast(`${totalDeleted.toLocaleString("ko-KR")}건 정리되었습니다.`);
        setDupModalOpen(false);
        load(); // 서버 상태와 sync
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium pointer-events-none transition-opacity ${
                        toast.ok ? "bg-[#0F766E] text-white" : "bg-rose-500 text-white"
                    }`}
                >
                    {toast.text}
                </div>
            )}
            {/* Header — 타이틀 + 카운트 only. 모든 액션은 사이드바(lg+) 또는 모바일 폴백.
                선택 시 액션은 테이블 위 컨텍스트 액션바로 이동. */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-[#0F766E]" />
                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">연락처</h1>
                    {!loading && (
                        <span className="text-xs text-neutral-500 ml-1">
                            전체 {contacts.length.toLocaleString("ko-KR")}명
                            {favoritesCount > 0 && <span className="ml-2 text-amber-600">⭐ {favoritesCount.toLocaleString("ko-KR")}</span>}
                        </span>
                    )}
                </div>
                {/* 모바일 전용 (사이드바 숨김 화면)에만 액션 폴백 */}
                <div className="lg:hidden flex items-center gap-2">
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".vcf,.vcard,.csv,.tsv,text/csv,text/vcard"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) importContactsFile(f); e.target.value = ""; }}
                    />
                    {contacts.length > 1 && (
                        <button
                            onClick={openDupModal}
                            className="flex items-center gap-1 px-2.5 py-2 text-xs text-amber-700 border border-amber-200 bg-amber-50 rounded-lg hover:bg-amber-100"
                            title="중복 정리"
                        ><Users className="h-3.5 w-3.5" /></button>
                    )}
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={importing}
                        className="flex items-center gap-1 px-2.5 py-2 text-xs text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-60"
                        title="vCard 가져오기"
                    >{importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}</button>
                    <button
                        onClick={() => exportContacts("vcard", "all")}
                        disabled={exporting || contacts.length === 0}
                        className="flex items-center gap-1 px-2.5 py-2 text-xs text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
                        title="vCard 내보내기"
                    ><Upload className="h-3.5 w-3.5" /></button>
                    <button
                        onClick={() => exportContacts("csv", "all")}
                        disabled={exporting || contacts.length === 0}
                        className="flex items-center gap-1 px-2.5 py-2 text-[10px] font-semibold text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
                        title="CSV 내보내기"
                    >CSV</button>
                    <button
                        onClick={openNew}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        추가
                    </button>
                </div>
            </div>

            {/* Search bar */}
            <div className="mb-5">
                <div className="relative max-w-3xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="이름·전화·이메일·회사 검색 (한글 초성 ㅇㅎㅂ도 가능)"
                        className="w-full pl-9 pr-9 py-2.5 text-sm bg-neutral-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E]/30 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* 좌: 사이드바 / 우: 테이블 */}
            <div className="flex gap-6">
                {/* ── 좌측 사이드바 (Google Contacts 패턴) ── */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-16 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pb-4">
                    {/* CTA */}
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white text-sm font-medium rounded-lg hover:bg-[#0d5e56] transition-colors mb-2 shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> 연락처 만들기
                    </button>

                    {/* 빠른 추가 — 한 줄 입력 자동 파싱 */}
                    <div className="mb-4 px-1">
                        <input
                            type="text"
                            value={quickInput}
                            onChange={(e) => setQuickInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") quickAdd(); }}
                            placeholder="빠른 추가: 홍길동 010-... hong@..."
                            className="w-full text-xs bg-neutral-100 rounded-md px-2.5 py-1.5 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E] transition-all placeholder:text-neutral-400"
                            disabled={quickAdding}
                            title="이름·전화·이메일·회사·직책을 한 줄로 입력 후 Enter"
                        />
                    </div>

                    {/* 필터 (의미없는 항목은 자동 숨김) */}
                    <SidebarItem
                        icon={<Users className="h-4 w-4" />}
                        label="모든 연락처"
                        count={contacts.length}
                        active={view === "all"}
                        onClick={() => setView("all")}
                    />
                    {favoritesCount > 0 && (
                        <SidebarItem
                            icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                            label="즐겨찾기"
                            count={favoritesCount}
                            active={view === "favorites"}
                            onClick={() => setView("favorites")}
                        />
                    )}
                    {recentCount > 0 && (
                        <SidebarItem
                            icon={<Clock className="h-4 w-4" />}
                            label="최근 연락"
                            count={recentCount}
                            active={view === "recent"}
                            onClick={() => setView("recent")}
                        />
                    )}
                    {/* 미분류는 "분류된 게 일부 있을 때"만 의미 있음. 전부 미분류면 숨김 */}
                    {unclassifiedCount > 0 && unclassifiedCount < contacts.length && (
                        <SidebarItem
                            icon={<Tag className="h-4 w-4" />}
                            label="미분류"
                            count={unclassifiedCount}
                            active={view === "unclassified"}
                            onClick={() => setView("unclassified")}
                        />
                    )}

                    {/* 라벨 (Google과 동일 — 그룹은 라벨로 통합) */}
                    {(allLabels.length > 0 || allGroups.length > 0) && (
                        <>
                            <div className="mt-5 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">라벨</div>
                            {allLabels.map(l => (
                                <SidebarItem
                                    key={`label:${l}`}
                                    icon={<span className="h-2 w-2 rounded-full bg-[#0F766E] inline-block" />}
                                    label={l}
                                    count={labelCounts[l]}
                                    active={view === `label:${l}`}
                                    onClick={() => setView(`label:${l}`)}
                                    onRename={() => {
                                        const next = prompt(`"${l}" 새 이름:`, l);
                                        if (next && next.trim() && next.trim() !== l) renameLabel(l, next.trim());
                                    }}
                                    onDelete={() => setConfirmDeleteLabel(l)}
                                />
                            ))}
                            {/* 그룹은 동일 섹션 안에서 dot 색상만 다르게 (사용자에겐 라벨처럼 보임) */}
                            {allGroups.map(g => (
                                <SidebarItem
                                    key={`group:${g}`}
                                    icon={<span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />}
                                    label={g}
                                    count={groupCounts[g]}
                                    active={view === `group:${g}`}
                                    onClick={() => setView(`group:${g}`)}
                                />
                            ))}
                        </>
                    )}

                    {/* 관리 — 가져오기/내보내기/유지보수 한 곳에 모음 */}
                    <div className="mt-5 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">관리</div>

                    {/* 가져오기 (vCard·CSV 자동 감지) */}
                    <button
                        onClick={() => {
                            (window as unknown as { __plannersImportMergeMode?: boolean }).__plannersImportMergeMode = false;
                            fileRef.current?.click();
                        }}
                        disabled={importing}
                        className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-r-full transition-colors text-left disabled:opacity-60"
                        title="vCard(.vcf) 또는 CSV(.csv) 파일에서 연락처 추가"
                    >
                        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        <span>{importing ? "가져오는 중…" : "가져오기 (vCard·CSV)"}</span>
                    </button>

                    {/* 내보내기 — 형식 토글 */}
                    <ExportMenu
                        disabled={exporting || contacts.length === 0}
                        onExport={(fmt) => exportContacts(fmt, "all")}
                    />

                    {/* 라벨 동기화 (필드 채우기) */}
                    {contacts.length > 0 && (
                        <button
                            onClick={() => setConfirmImportMerge(true)}
                            disabled={importing}
                            className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-r-full transition-colors text-left disabled:opacity-60"
                            title="이미 가져온 연락처에 라벨·회사·생일 등 빈 필드를 vCard·CSV에서 추가 채움"
                        >
                            <Tag className="h-4 w-4" />
                            <span>라벨 동기화</span>
                        </button>
                    )}

                    {/* 중복 정리 */}
                    {contacts.length > 1 && (
                        <button
                            onClick={openDupModal}
                            className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-r-full transition-colors text-left"
                        >
                            <Users className="h-4 w-4" />
                            <span>중복 정리</span>
                        </button>
                    )}

                    {/* 다가오는 생일 카드 */}
                    {upcomingBirthdays.length > 0 && (
                        <div className="mt-5 mx-1 p-3 bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Cake className="h-3.5 w-3.5 text-rose-500" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">다가오는 생일</span>
                            </div>
                            <div className="space-y-1.5">
                                {upcomingBirthdays.slice(0, 5).map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => {
                                            const c = contacts.find(x => x.id === b.id);
                                            if (c) openEdit(c);
                                        }}
                                        className="w-full text-left flex items-center gap-2 px-1.5 py-1 hover:bg-white/70 rounded transition-colors"
                                    >
                                        <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                                            b.isToday ? "bg-rose-500 text-white"
                                            : b.daysUntil <= 3 ? "bg-amber-200 text-amber-800"
                                            : "bg-neutral-100 text-neutral-600"
                                        }`}>
                                            {b.isToday ? "오늘" : `D-${b.daysUntil}`}
                                        </span>
                                        <span className="text-xs text-neutral-700 truncate flex-1">{b.name}</span>
                                        <span className="text-[10px] text-neutral-400 font-mono shrink-0">{b.mmdd.replace("-", "/")}</span>
                                    </button>
                                ))}
                                {upcomingBirthdays.length > 5 && (
                                    <p className="text-[10px] text-neutral-500 text-center pt-1">+ {upcomingBirthdays.length - 5}명 더</p>
                                )}
                            </div>
                        </div>
                    )}
                </aside>

                {/* ── 우측 테이블 ── */}
                <div className="flex-1 min-w-0">
                    {/* 모바일 가로 필터 (사이드바 대신) */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-3">
                        <FilterPill active={view === "all"} onClick={() => setView("all")}>전체 ({contacts.length.toLocaleString("ko-KR")})</FilterPill>
                        {favoritesCount > 0 && <FilterPill active={view === "favorites"} onClick={() => setView("favorites")}>⭐ {favoritesCount.toLocaleString("ko-KR")}</FilterPill>}
                        {allLabels.map(l => <FilterPill key={l} active={view === `label:${l}`} onClick={() => setView(`label:${l}`)}>{l} ({labelCounts[l].toLocaleString("ko-KR")})</FilterPill>)}
                        {allGroups.map(g => <FilterPill key={g} active={view === `group:${g}`} onClick={() => setView(`group:${g}`)}>{g} ({groupCounts[g].toLocaleString("ko-KR")})</FilterPill>)}
                    </div>

                    {/* 컨텍스트 액션바 — 선택된 항목이 있을 때만 등장. 헤더와 분리되어 명확. */}
                    {selectedIds.size > 0 && (
                        <div className="mb-3 px-4 py-2.5 bg-[#0F766E] rounded-lg flex items-center gap-2 text-sm text-white shadow-sm sticky top-12 z-20 flex-wrap">
                            <CheckSquare className="h-4 w-4 shrink-0" />
                            <span className="flex-1 font-medium min-w-0">{selectedIds.size.toLocaleString("ko-KR")}명 선택됨</span>
                            <div className="relative">
                                <button
                                    onClick={() => setLabelPopoverOpen(o => !o)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/15 hover:bg-white/25 rounded transition-colors"
                                    title="선택 항목에 라벨 적용/제거"
                                >
                                    <Tag className="h-3.5 w-3.5" />
                                    라벨
                                    <ChevronDown className="h-3 w-3" />
                                </button>
                                {labelPopoverOpen && (
                                    <LabelApplyPopover
                                        existingLabels={allLabels}
                                        selectedContactsLabels={(() => {
                                            // 선택된 연락처들의 라벨 union (한 명이라도 가진 라벨)
                                            const set = new Set<string>();
                                            contacts.forEach(c => {
                                                if (selectedIds.has(c.id)) (c.labels || []).forEach(l => set.add(l));
                                            });
                                            return set;
                                        })()}
                                        onApply={async (add, remove) => {
                                            await applyLabelsToSelected(add, remove);
                                            setLabelPopoverOpen(false);
                                        }}
                                        onClose={() => setLabelPopoverOpen(false)}
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => exportContacts("vcard", "selected")}
                                disabled={exporting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/15 hover:bg-white/25 rounded transition-colors disabled:opacity-50"
                                title="선택 항목을 vCard 파일로 저장"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                vCard
                            </button>
                            <button
                                onClick={() => exportContacts("csv", "selected")}
                                disabled={exporting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/15 hover:bg-white/25 rounded transition-colors disabled:opacity-50"
                                title="선택 항목을 CSV 파일로 저장"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                CSV
                            </button>
                            <button
                                onClick={() => setBulkEditOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/15 hover:bg-white/25 rounded transition-colors"
                                title="회사·그룹·메모 등 일괄 수정"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                수정
                            </button>
                            {selectedIds.size === 2 && (
                                <button
                                    onClick={() => setMergeOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 rounded transition-colors"
                                    title="선택한 두 명을 하나로 병합"
                                >
                                    🔀 병합
                                </button>
                            )}
                            <button
                                onClick={() => setConfirmBulkDelete(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 rounded transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                삭제
                            </button>
                            <button
                                onClick={clearSelection}
                                className="px-3 py-1.5 text-xs hover:bg-white/15 rounded transition-colors"
                            >취소</button>
                        </div>
                    )}

                    {/* 결과 카운트 + letter 필터 표시 */}
                    {!loading && (
                        <div className="text-xs text-neutral-500 mb-2 px-1 flex items-center gap-2 flex-wrap">
                            <span>
                                {view === "all" ? "모든 연락처" :
                                 view === "favorites" ? "즐겨찾기" :
                                 view === "unclassified" ? "미분류" :
                                 view.startsWith("label:") ? `라벨: ${view.slice(6)}` :
                                 view.startsWith("group:") ? `그룹: ${view.slice(6)}` : ""}
                                <span className="ml-2 text-neutral-400">총 {sortedRows.length.toLocaleString("ko-KR")}명</span>
                            </span>
                            {isCompactView && letterFilter !== "top" && letterFilter !== "all" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E] font-semibold">
                                    {letterFilter} ({visibleRows.length.toLocaleString("ko-KR")}명)
                                    <button onClick={() => setLetterFilter("top")} className="hover:bg-[#0F766E]/20 rounded p-0.5" title="기본 화면으로">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {isCompactView && letterFilter === "all" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E] font-semibold">
                                    All ({visibleRows.length.toLocaleString("ko-KR")}명)
                                    <button onClick={() => setLetterFilter("top")} className="hover:bg-[#0F766E]/20 rounded p-0.5" title="기본 화면으로">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
                    ) : sortedRows.length === 0 ? (
                        <div className="py-16 text-center text-neutral-400 text-sm">
                            {contacts.length === 0 ? "연락처를 추가하거나 vCard 파일로 가져오세요." : "검색 결과가 없습니다."}
                        </div>
                    ) : isCompactView && letterFilter === "top" && topHasContent ? (
                        // ── 기본(top) 화면: 즐겨찾기 + 최근 사용. 전체 렌더링 X (빠른 로딩) ──
                        <div ref={listRef} className="space-y-4">
                            {topFavoritesRows.length > 0 && (
                                <section className="bg-white border border-amber-200 rounded-lg overflow-hidden">
                                    <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-semibold text-amber-900">즐겨찾기</span>
                                        <span className="text-[10px] text-amber-700/70">{topFavoritesRows.length}명</span>
                                    </div>
                                    <div className="divide-y divide-neutral-100">
                                        {topFavoritesRows.map(c => (
                                            <ContactRow
                                                key={c.id}
                                                contact={c}
                                                isSelected={selectedIds.has(c.id)}
                                                anySelected={selectedIds.size > 0}
                                                onToggleSelect={() => toggleSelected(c.id)}
                                                onEdit={() => openEdit(c)}
                                                onDelete={() => setConfirmDeleteId(c.id)}
                                                onToggleFavorite={() => toggleFavorite(c)}
                                                onCopy={copyText}
                                                onRecordContact={() => recordContact(c.id)}
                                                copiedKey={copiedKey}
                                                deleting={deleting === c.id}
                                                favoriting={favoritingId === c.id}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {topRecentRows.length > 0 && (
                                <section className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                                    <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-neutral-500" />
                                        <span className="text-xs font-semibold text-neutral-700">최근 사용</span>
                                        <span className="text-[10px] text-neutral-500">{topRecentRows.length}명 · 마지막 통화·이메일 순</span>
                                    </div>
                                    <div className="divide-y divide-neutral-100">
                                        {topRecentRows.map(c => (
                                            <ContactRow
                                                key={c.id}
                                                contact={c}
                                                isSelected={selectedIds.has(c.id)}
                                                anySelected={selectedIds.size > 0}
                                                onToggleSelect={() => toggleSelected(c.id)}
                                                onEdit={() => openEdit(c)}
                                                onDelete={() => setConfirmDeleteId(c.id)}
                                                onToggleFavorite={() => toggleFavorite(c)}
                                                onCopy={copyText}
                                                onRecordContact={() => recordContact(c.id)}
                                                copiedKey={copiedKey}
                                                deleting={deleting === c.id}
                                                favoriting={favoritingId === c.id}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {/* 안내 */}
                            <div className="rounded-lg p-4 bg-neutral-50 border border-dashed border-neutral-300 text-xs text-neutral-500 text-center">
                                전체 {sortedRows.length.toLocaleString("ko-KR")}명 중 즐겨찾기·최근 사용한 사람만 표시 중.
                                <br/>우측 인덱스에서 <span className="font-semibold text-[#0F766E]">All</span> 또는 가나다·알파벳을 누르면 해당 그룹만 표시됩니다.
                            </div>
                        </div>
                    ) : (
                        <div ref={listRef} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                            {/* 테이블 헤더 — 전체 선택 체크박스 (Google Contacts 스타일) */}
                            <div className="hidden md:grid grid-cols-[40px_28px_1.5fr_1.2fr_1.5fr_1.2fr_80px] gap-3 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                <div className="flex justify-center">
                                    <button
                                        onClick={toggleSelectAllVisible}
                                        title="표시 중인 연락처 전체 선택"
                                        className="hover:text-[#0F766E] transition-colors"
                                    >
                                        {renderedRows.length > 0 && renderedRows.every(c => selectedIds.has(c.id))
                                            ? <CheckSquare className="h-4 w-4 text-[#0F766E]" />
                                            : <Square className="h-4 w-4 text-neutral-300 hover:text-[#0F766E]" />}
                                    </button>
                                </div>
                                <div></div>
                                <div>이름</div>
                                <div>전화번호</div>
                                <div>이메일</div>
                                <div>회사 · 직책</div>
                                <div></div>
                            </div>
                            {/* 행 — 무한 스크롤로 점진 렌더 */}
                            <div className="divide-y divide-neutral-100">
                                {renderedRows.map((c, idx) => {
                                    const init = getInitialChar(c.name);
                                    const prevInit = idx > 0 ? getInitialChar(renderedRows[idx - 1].name) : null;
                                    const showInitial = init !== prevInit;
                                    return (
                                        <ContactRow
                                            key={c.id}
                                            contact={c}
                                            dataInitial={showInitial ? init : undefined}
                                            isSelected={selectedIds.has(c.id)}
                                            anySelected={selectedIds.size > 0}
                                            onToggleSelect={() => toggleSelected(c.id)}
                                            onEdit={() => openEdit(c)}
                                            onDelete={() => setConfirmDeleteId(c.id)}
                                            onToggleFavorite={() => toggleFavorite(c)}
                                            onCopy={copyText}
                                            onRecordContact={() => recordContact(c.id)}
                                            copiedKey={copiedKey}
                                            deleting={deleting === c.id}
                                            favoriting={favoritingId === c.id}
                                        />
                                    );
                                })}
                            </div>
                            {/* Sentinel — viewport에 들어오면 다음 50명 로드 */}
                            {hasMore && (
                                <div ref={sentinelRef} className="py-6 text-center text-xs text-neutral-400 border-t border-neutral-100">
                                    <Loader2 className="h-4 w-4 inline-block animate-spin mr-1.5" />
                                    {renderedRows.length.toLocaleString("ko-KR")} / {visibleRows.length.toLocaleString("ko-KR")}명 표시 중 — 스크롤하면 더 보기
                                </div>
                            )}
                            {!hasMore && visibleRows.length > PAGE_SIZE && (
                                <div className="py-4 text-center text-[10px] text-neutral-400 border-t border-neutral-100">
                                    {visibleRows.length.toLocaleString("ko-KR")}명 모두 표시됨
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 가나다 사이드 인덱스 — viewport 우측에 fixed (md 이상에서 노출).
                    클릭 시 해당 letter만 필터링 — 전체 렌더 X (성능). All = 전체 렌더 모드. */}
                {contacts.length > 20 && isCompactView && (
                    <div className="hidden md:flex flex-col items-center fixed right-2 top-1/2 -translate-y-1/2 z-30 bg-white rounded-lg py-2 px-1 shadow-md border border-neutral-200 text-[10px] select-none max-h-[80vh] overflow-y-auto planners-dark:!bg-[#252525] planners-dark:!border-[#444]">
                        {/* All — 전체 보기 */}
                        <button
                            onClick={() => setLetterFilter(letterFilter === "all" ? "top" : "all")}
                            className={`leading-tight px-1.5 py-0.5 mb-0.5 rounded font-bold transition-colors ${
                                letterFilter === "all"
                                    ? "bg-[#0F766E] text-white"
                                    : "text-[#0F766E] hover:bg-[#0F766E]/10"
                            }`}
                            title="전체 연락처 보기"
                        >All</button>
                        <div className="w-4 border-t border-neutral-200 my-0.5" />
                        {ALPHABET_INDEX.map(ch => {
                            const active = presentInitials.has(ch);
                            const selected = letterFilter === ch;
                            return (
                                <button
                                    key={ch}
                                    disabled={!active}
                                    onClick={() => setLetterFilter(selected ? "top" : ch)}
                                    title={active ? `${ch} (${initialCounts[ch] || 0}명)` : undefined}
                                    className={`leading-tight px-1.5 py-0.5 transition-colors rounded ${
                                        selected
                                            ? "bg-[#0F766E] text-white font-bold"
                                            : active
                                                ? "text-neutral-900 hover:text-[#0F766E] hover:bg-[#0F766E]/10 cursor-pointer font-semibold planners-dark:!text-neutral-100"
                                                : "text-neutral-500 cursor-default planners-dark:!text-neutral-400"
                                    }`}
                                >{ch}</button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <ContactModal
                    form={form}
                    setForm={setForm}
                    editing={!!editing}
                    saving={saving}
                    onSave={save}
                    onClose={() => setModalOpen(false)}
                />
            )}

            {/* Bulk Edit 모달 */}
            {bulkEditOpen && (
                <BulkEditModal
                    count={selectedIds.size}
                    onApply={async (patch) => {
                        await bulkEditApply(patch);
                        setBulkEditOpen(false);
                    }}
                    onClose={() => setBulkEditOpen(false)}
                />
            )}

            {/* 수동 병합 모달 (정확히 2명 선택 시) */}
            {mergeOpen && selectedIds.size === 2 && (() => {
                const [aId, bId] = [...selectedIds];
                const a = contacts.find(c => c.id === aId);
                const b = contacts.find(c => c.id === bId);
                if (!a || !b) return null;
                return (
                    <MergeModal
                        a={a}
                        b={b}
                        onMerge={async (keepId, mergedData) => {
                            const otherId = keepId === a.id ? b.id : a.id;
                            await performMerge(keepId, [otherId], mergedData);
                            setMergeOpen(false);
                        }}
                        onClose={() => setMergeOpen(false)}
                    />
                );
            })()}

            {/* 중복 정리 모달 */}
            {dupModalOpen && (
                <DuplicateModal
                    groups={findDuplicateGroups()}
                    onAutoMerge={autoMergeAll}
                    onDeleteOne={async (id) => {
                        await fetch(`/api/planners/contacts?id=${id}`, { method: "DELETE" });
                        load();
                    }}
                    onClose={() => setDupModalOpen(false)}
                />
            )}

            {/* 삭제 확인 시트들 */}
            <ConfirmSheet
                open={!!confirmDeleteId}
                message="연락처를 삭제할까요?"
                onConfirm={() => { const id = confirmDeleteId!; setConfirmDeleteId(null); remove(id); }}
                onCancel={() => setConfirmDeleteId(null)}
            />
            <ConfirmSheet
                open={confirmBulkDelete}
                message={`${selectedIds.size.toLocaleString("ko-KR")}명을 삭제할까요?`}
                onConfirm={() => { setConfirmBulkDelete(false); bulkDelete(); }}
                onCancel={() => setConfirmBulkDelete(false)}
            />
            <ConfirmSheet
                open={!!confirmDeleteLabel}
                message={`라벨 "${confirmDeleteLabel}"을 모든 연락처에서 제거할까요?`}
                description="연락처 자체는 삭제되지 않습니다."
                onConfirm={() => { const name = confirmDeleteLabel!; setConfirmDeleteLabel(null); deleteLabel(name); }}
                onCancel={() => setConfirmDeleteLabel(null)}
            />
            <ConfirmSheet
                open={confirmAutoMerge}
                message={`${autoMergeToDeleteRef.current.length.toLocaleString("ko-KR")}건의 중복을 자동 병합할까요?`}
                description="정보가 많은 항목을 유지하고 나머지를 삭제합니다."
                confirmLabel="병합"
                onConfirm={() => { setConfirmAutoMerge(false); executeAutoMerge(); }}
                onCancel={() => setConfirmAutoMerge(false)}
            />
            <ConfirmSheet
                open={confirmImportMerge}
                message="라벨·빈 필드를 vCard·CSV에서 병합할까요?"
                description="기존 연락처를 덮어쓰지 않고 빈 필드만 채웁니다."
                confirmLabel="계속"
                danger={false}
                onConfirm={() => {
                    setConfirmImportMerge(false);
                    (window as unknown as { __plannersImportMergeMode?: boolean }).__plannersImportMergeMode = true;
                    fileRef.current?.click();
                }}
                onCancel={() => setConfirmImportMerge(false)}
            />
        </div>
    );
}

function BulkEditModal({
    count, onApply, onClose,
}: {
    count: number;
    onApply: (patch: Partial<Contact>) => Promise<void>;
    onClose: () => void;
}) {
    const [organization, setOrganization] = useState("");
    const [title, setTitle] = useState("");
    const [groupName, setGroupName] = useState("");
    const [relationship, setRelationship] = useState("");
    const [note, setNote] = useState("");
    const [favorite, setFavorite] = useState<"keep" | "on" | "off">("keep");
    const [enabled, setEnabled] = useState<Record<string, boolean>>({});

    function applyHandler() {
        const patch: Partial<Contact> = {};
        if (enabled.organization) patch.organization = organization || "";
        if (enabled.title) patch.title = title || "";
        if (enabled.group_name) patch.group_name = groupName || "";
        if (enabled.relationship) patch.relationship = relationship || "";
        if (enabled.note) patch.note = note || "";
        if (enabled.is_favorite) patch.is_favorite = favorite === "on";
        if (Object.keys(patch).length === 0) { onClose(); return; }
        onApply(patch);
    }

    function FieldRow({ k, label, children }: { k: string; label: string; children: React.ReactNode }) {
        return (
            <div className="flex items-start gap-3 py-2">
                <input
                    type="checkbox"
                    checked={!!enabled[k]}
                    onChange={(e) => setEnabled(prev => ({ ...prev, [k]: e.target.checked }))}
                    className="mt-2 accent-[#0F766E]"
                />
                <div className="flex-1">
                    <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                        <h2 className="font-semibold text-neutral-900">일괄 수정</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">{count.toLocaleString("ko-KR")}명에 적용 · 체크한 필드만 변경</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-5 w-5" /></button>
                </div>
                <div className="px-6 py-2 overflow-y-auto flex-1">
                    <FieldRow k="organization" label="회사">
                        <input value={organization} onChange={e => setOrganization(e.target.value)} placeholder="(빈 값으로 두면 회사 비움)" className={INPUT} />
                    </FieldRow>
                    <FieldRow k="title" label="직책">
                        <input value={title} onChange={e => setTitle(e.target.value)} className={INPUT} />
                    </FieldRow>
                    <FieldRow k="group_name" label="그룹">
                        <input value={groupName} onChange={e => setGroupName(e.target.value)} className={INPUT} />
                    </FieldRow>
                    <FieldRow k="relationship" label="관계">
                        <select value={relationship} onChange={e => setRelationship(e.target.value)} className={INPUT}>
                            <option value="">(없음)</option>
                            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </FieldRow>
                    <FieldRow k="is_favorite" label="즐겨찾기">
                        <select value={favorite} onChange={e => setFavorite(e.target.value as "keep" | "on" | "off")} className={INPUT}>
                            <option value="keep">유지</option>
                            <option value="on">⭐ 즐겨찾기로 설정</option>
                            <option value="off">즐겨찾기 해제</option>
                        </select>
                    </FieldRow>
                    <FieldRow k="note" label="메모 (덮어쓰기)">
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className={`${INPUT} resize-none`} />
                    </FieldRow>
                </div>
                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50">취소</button>
                    <button onClick={applyHandler} className="px-4 py-2 text-sm text-white bg-[#0F766E] rounded-lg hover:bg-[#0d5e56]">{count.toLocaleString("ko-KR")}명에 적용</button>
                </div>
            </div>
        </div>
    );
}

function MergeModal({
    a, b, onMerge, onClose,
}: {
    a: Contact;
    b: Contact;
    onMerge: (keepId: string, merged: Partial<Contact>) => Promise<void>;
    onClose: () => void;
}) {
    // 각 필드별로 a/b 중 어느 값을 유지할지 — default: 비어있지 않은 쪽
    type Side = "a" | "b";
    const fields: { key: keyof Contact; label: string }[] = [
        { key: "name", label: "이름" },
        { key: "phone", label: "전화번호" },
        { key: "email", label: "이메일" },
        { key: "organization", label: "회사" },
        { key: "title", label: "직책" },
        { key: "address", label: "주소" },
        { key: "birthday", label: "생일" },
        { key: "group_name", label: "그룹" },
        { key: "relationship", label: "관계" },
        { key: "note", label: "메모" },
    ];
    const [picks, setPicks] = useState<Record<string, Side>>(() => {
        const initial: Record<string, Side> = {};
        for (const f of fields) {
            const av = a[f.key];
            const bv = b[f.key];
            initial[f.key as string] = (!av && bv) ? "b" : "a";
        }
        return initial;
    });
    // 라벨/즐겨찾기는 union (둘 다 적용)
    const [keepId, setKeepId] = useState<string>(a.id);

    function applyMerge() {
        const merged: Partial<Contact> = {};
        for (const f of fields) {
            const side = picks[f.key as string];
            merged[f.key] = (side === "a" ? a[f.key] : b[f.key]) as never;
        }
        merged.labels = Array.from(new Set([...(a.labels || []), ...(b.labels || [])]));
        merged.is_favorite = !!a.is_favorite || !!b.is_favorite;
        onMerge(keepId, merged);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                        <h2 className="font-semibold text-neutral-900">두 연락처 병합</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">필드별로 선택해 하나의 연락처로 합칩니다 · 라벨은 자동 union</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-5 w-5" /></button>
                </div>

                {/* 어느 row를 keep할지 */}
                <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50 flex items-center gap-3 text-xs">
                    <span className="text-neutral-500">유지할 row ID:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={keepId === a.id} onChange={() => setKeepId(a.id)} className="accent-[#0F766E]" />
                        <span className="font-mono">A ({a.id.slice(0, 8)})</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={keepId === b.id} onChange={() => setKeepId(b.id)} className="accent-[#0F766E]" />
                        <span className="font-mono">B ({b.id.slice(0, 8)})</span>
                    </label>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="grid grid-cols-[110px_1fr_1fr] text-xs">
                        <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-500">필드</div>
                        <div className="px-4 py-2 bg-neutral-50 border-b border-l border-neutral-200 font-semibold text-neutral-500">A</div>
                        <div className="px-4 py-2 bg-neutral-50 border-b border-l border-neutral-200 font-semibold text-neutral-500">B</div>
                        {fields.map(f => {
                            const av = a[f.key]; const bv = b[f.key];
                            const aStr = Array.isArray(av) ? av.join(", ") : (av ?? "") + "";
                            const bStr = Array.isArray(bv) ? bv.join(", ") : (bv ?? "") + "";
                            return (
                                <div key={f.key as string} className="contents">
                                    <div className="px-4 py-2 border-b border-neutral-100 text-neutral-500 flex items-center">{f.label}</div>
                                    <button
                                        onClick={() => setPicks(p => ({ ...p, [f.key as string]: "a" }))}
                                        className={`px-4 py-2 border-b border-l border-neutral-100 text-left ${
                                            picks[f.key as string] === "a" ? "bg-[#0F766E]/10 text-[#0F766E] font-medium" : "hover:bg-neutral-50"
                                        }`}
                                    >{aStr || <span className="text-neutral-300">(비어있음)</span>}</button>
                                    <button
                                        onClick={() => setPicks(p => ({ ...p, [f.key as string]: "b" }))}
                                        className={`px-4 py-2 border-b border-l border-neutral-100 text-left ${
                                            picks[f.key as string] === "b" ? "bg-[#0F766E]/10 text-[#0F766E] font-medium" : "hover:bg-neutral-50"
                                        }`}
                                    >{bStr || <span className="text-neutral-300">(비어있음)</span>}</button>
                                </div>
                            );
                        })}
                        <div className="px-4 py-2 border-b border-neutral-100 text-neutral-500">라벨</div>
                        <div className="px-4 py-2 border-b border-l border-neutral-100 col-span-2 text-neutral-700">
                            {Array.from(new Set([...(a.labels || []), ...(b.labels || [])])).join(", ") || <span className="text-neutral-300">(없음)</span>}
                            <span className="text-[10px] text-neutral-400 ml-2">자동 union</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50">취소</button>
                    <button onClick={applyMerge} className="px-4 py-2 text-sm text-white bg-[#0F766E] rounded-lg hover:bg-[#0d5e56]">병합 실행 (1명 → 1명)</button>
                </div>
            </div>
        </div>
    );
}

function DuplicateModal({ groups, onAutoMerge, onDeleteOne, onClose }: {
    groups: Contact[][];
    onAutoMerge: () => void;
    onDeleteOne: (id: string) => Promise<void>;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                        <h2 className="font-semibold text-neutral-900">중복 연락처 정리</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">전화·이메일이 같은 연락처 {groups.length.toLocaleString("ko-KR")}그룹 발견</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-5 w-5" /></button>
                </div>
                <div className="px-6 py-4 border-b border-neutral-100 bg-amber-50/50">
                    <button
                        onClick={onAutoMerge}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        🪄 자동 병합 (정보 많은 항목 유지)
                    </button>
                    <p className="text-[11px] text-neutral-500 mt-2 text-center">
                        각 그룹에서 즐겨찾기·필드 수가 많은 항목을 남기고 나머지를 삭제합니다.
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {groups.map((g, i) => (
                        <div key={i} className="border border-neutral-200 rounded-lg overflow-hidden">
                            <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-100 text-[11px] text-neutral-500 font-medium">
                                그룹 {i + 1} · {g.length}건
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {g.map(c => (
                                    <div key={c.id} className="px-3 py-2 flex items-center gap-3 hover:bg-neutral-50">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 truncate">
                                                {c.is_favorite && <Star className="inline h-3 w-3 fill-amber-400 text-amber-400 mr-1" />}
                                                {c.name}
                                            </p>
                                            <p className="text-xs text-neutral-500 font-mono truncate">
                                                {c.phone && <span>{formatPhoneKR(c.phone)}</span>}
                                                {c.phone && c.email && <span className="mx-1">·</span>}
                                                {c.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onDeleteOne(c.id)}
                                            className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1"
                                        >삭제</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ContactRow({
    contact: c, dataInitial, isSelected, anySelected,
    onToggleSelect, onEdit, onDelete, onToggleFavorite, onCopy,
    onRecordContact,
    copiedKey, deleting, favoriting,
}: {
    contact: Contact;
    dataInitial?: string;
    isSelected: boolean;
    anySelected: boolean;
    onToggleSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleFavorite: () => void;
    onCopy: (text: string, key: string) => void;
    onRecordContact: () => void;
    copiedKey: string | null;
    deleting: boolean;
    favoriting: boolean;
}) {
    const phoneFmt = c.phone ? formatPhoneKR(c.phone) : "";
    const phoneCopyKey = `phone:${c.id}`;
    const emailCopyKey = `email:${c.id}`;
    // 선택 상태 진입 = 어떤 행이라도 selected. 그 때는 행 클릭=토글, 평소엔 클릭=수정.
    return (
        <div data-initial={dataInitial} className="relative group">
            {/* 선택된 행 좌측 teal bar */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0F766E]" />
            )}
            <div
                className={`md:grid md:grid-cols-[40px_28px_1.5fr_1.2fr_1.5fr_1.2fr_80px] gap-3 px-4 py-2 items-center transition-colors cursor-pointer flex ${
                    isSelected ? "bg-[#0F766E]/10" : "hover:bg-neutral-50"
                }`}
                onClick={() => anySelected ? onToggleSelect() : onEdit()}
            >
                {/* 컬럼 1: 체크박스 — Google Contacts 스타일로 항상 표시 */}
                <div className="shrink-0 flex justify-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
                        title={isSelected ? "선택 해제" : "선택"}
                    >
                        {isSelected
                            ? <CheckSquare className="h-5 w-5 text-[#0F766E]" />
                            : <Square className="h-5 w-5 text-neutral-300 hover:text-[#0F766E] transition-colors" />}
                    </button>
                </div>

                {/* 컬럼 2: 즐겨찾기 별 */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    disabled={favoriting}
                    className="shrink-0 flex justify-center"
                    title={c.is_favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                >
                    <Star className={`h-4 w-4 transition-colors ${
                        c.is_favorite
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-200 hover:text-amber-400 group-hover:text-neutral-400"
                    }`} />
                </button>

                {/* 컬럼 3: 이름 + 아바타 */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 md:flex-none">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                        c.is_favorite ? "bg-amber-100 text-amber-700" : "bg-[#0F766E]/10 text-[#0F766E]"
                    }`}>
                        {c.name?.[0] || <User className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm text-neutral-900 truncate font-medium">{c.name}</div>
                        {/* 모바일 시 한 줄에 정보 합침 */}
                        <div className="md:hidden text-xs text-neutral-500 truncate font-mono">{phoneFmt}</div>
                    </div>
                </div>

                {/* 컬럼 4: 전화 (md+) */}
                <div className="hidden md:flex items-center gap-1.5 min-w-0 group/cell">
                    {phoneFmt && (
                        <>
                            <a
                                href={`tel:${c.phone}`}
                                onClick={(e) => { e.stopPropagation(); onRecordContact(); }}
                                className="text-sm text-neutral-700 truncate font-mono hover:text-[#0F766E]"
                            >
                                {phoneFmt}
                            </a>
                            <button
                                onClick={(e) => { e.stopPropagation(); onCopy(phoneFmt, phoneCopyKey); }}
                                className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 text-neutral-400 hover:text-[#0F766E] shrink-0"
                                title="복사"
                            >
                                {copiedKey === phoneCopyKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                        </>
                    )}
                </div>

                {/* 컬럼 5: 이메일 (md+) */}
                <div className="hidden md:flex items-center gap-1.5 min-w-0 group/cell">
                    {c.email && (
                        <>
                            <a
                                href={`mailto:${c.email}`}
                                onClick={(e) => { e.stopPropagation(); onRecordContact(); }}
                                className="text-sm text-neutral-700 truncate hover:text-[#0F766E]"
                            >
                                {c.email}
                            </a>
                            <button
                                onClick={(e) => { e.stopPropagation(); onCopy(c.email!, emailCopyKey); }}
                                className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 text-neutral-400 hover:text-[#0F766E] shrink-0"
                                title="복사"
                            >
                                {copiedKey === emailCopyKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                        </>
                    )}
                </div>

                {/* 컬럼 6: 회사·직책 + 라벨 (md+) */}
                <div className="hidden md:flex items-center gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                        {c.organization && (
                            <div className="text-sm text-neutral-700 truncate">
                                {c.organization}
                                {c.title && <span className="text-neutral-400">, {c.title}</span>}
                            </div>
                        )}
                        {c.labels && c.labels.length > 0 && (
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                                {c.labels.slice(0, 2).map(l => (
                                    <span key={l} className="text-[9px] px-1.5 py-0 bg-[#0F766E]/10 text-[#0F766E] rounded-full">{l}</span>
                                ))}
                                {c.labels.length > 2 && <span className="text-[9px] text-neutral-400">+{c.labels.length - 2}</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* 컬럼 7: 액션 (호버 시 등장) */}
                <div className="hidden md:flex items-center gap-1 justify-end shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-neutral-400 hover:text-[#0F766E] hover:bg-[#0F766E]/10 rounded"
                        title="수정"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        disabled={deleting}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded disabled:opacity-50"
                        title="삭제"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// 좌측 사이드바 항목 (Google Contacts 스타일).
// onRename/onDelete가 있으면 호버 시 ⋯ 메뉴 노출
function SidebarItem({
    icon, label, count, active, onClick, onRename, onDelete,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    onRename?: () => void;
    onDelete?: () => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const hasMenu = !!(onRename || onDelete);
    return (
        <div className="relative group/item">
            <button
                onClick={onClick}
                className={`flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-r-full transition-colors text-left w-full ${
                    active
                        ? "bg-[#0F766E]/15 text-[#0F766E] font-medium"
                        : "text-neutral-700 hover:bg-neutral-100"
                }`}
            >
                <span className="shrink-0 flex items-center justify-center w-4">{icon}</span>
                <span className="flex-1 truncate">{label}</span>
                {hasMenu && (
                    <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMenuOpen(o => !o); }}
                        className={`shrink-0 transition-opacity p-0.5 rounded hover:bg-neutral-200 ${
                            menuOpen ? "opacity-100" : "opacity-0 group-hover/item:opacity-100"
                        }`}
                        title="라벨 관리"
                    >
                        <span className="text-neutral-400 text-base leading-none">⋯</span>
                    </span>
                )}
                <span className={`text-xs ${active ? "text-[#0F766E]" : "text-neutral-400"} ${hasMenu ? "ml-1" : ""}`}>{count.toLocaleString("ko-KR")}</span>
            </button>
            {menuOpen && hasMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-2 top-full mt-1 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                        {onRename && (
                            <button
                                onClick={() => { setMenuOpen(false); onRename(); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                            >
                                <Pencil className="h-3 w-3" /> 이름 변경
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => { setMenuOpen(false); onDelete(); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-neutral-100"
                            >
                                <Trash2 className="h-3 w-3" /> 라벨 삭제
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// 선택 항목에 라벨을 적용/제거하는 popover
function LabelApplyPopover({
    existingLabels, selectedContactsLabels, onApply, onClose,
}: {
    existingLabels: string[];
    selectedContactsLabels: Set<string>;
    onApply: (add: string[], remove: string[]) => Promise<void>;
    onClose: () => void;
}) {
    // 각 라벨의 상태를 토글: undefined (변화 없음) / true (적용) / false (제거)
    const [pendingState, setPendingState] = useState<Record<string, boolean | undefined>>({});
    const [newLabel, setNewLabel] = useState("");

    function toggleLabel(l: string) {
        setPendingState(prev => {
            const cur = prev[l];
            const wasOn = selectedContactsLabels.has(l);
            // 사이클: (현 상태 유지) → 적용 → 제거 → 현 상태 유지
            let next: boolean | undefined;
            if (cur === undefined) next = wasOn ? false : true; // 현재 토글 반대
            else if (cur === true) next = false;
            else if (cur === false) next = undefined;
            return { ...prev, [l]: next };
        });
    }

    function applyChanges() {
        const add: string[] = [];
        const remove: string[] = [];
        Object.entries(pendingState).forEach(([l, st]) => {
            if (st === true) add.push(l);
            else if (st === false) remove.push(l);
        });
        if (newLabel.trim()) add.push(newLabel.trim());
        if (add.length === 0 && remove.length === 0) { onClose(); return; }
        onApply(add, remove);
    }

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="absolute top-full mt-1 right-0 z-50 bg-white text-neutral-900 rounded-lg shadow-xl border border-neutral-200 w-64 overflow-hidden">
                <div className="px-3 py-2 border-b border-neutral-100">
                    <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="새 라벨 만들기 + Enter"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                applyChanges();
                            }
                        }}
                        autoFocus
                        className="w-full text-sm border border-neutral-300 rounded px-2 py-1 focus:outline-none focus:border-[#0F766E]"
                    />
                </div>
                <div className="max-h-60 overflow-y-auto">
                    {existingLabels.length === 0 && (
                        <p className="px-3 py-3 text-xs text-neutral-400 text-center">기존 라벨이 없습니다. 위에 새로 만들어보세요.</p>
                    )}
                    {existingLabels.map(l => {
                        const initial = selectedContactsLabels.has(l);
                        const pending = pendingState[l];
                        const willHave = pending === undefined ? initial : pending;
                        return (
                            <button
                                key={l}
                                onClick={() => toggleLabel(l)}
                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50 flex items-center gap-2"
                            >
                                <span className="shrink-0 w-4 flex items-center justify-center">
                                    {willHave
                                        ? <CheckSquare className="h-4 w-4 text-[#0F766E]" />
                                        : <Square className="h-4 w-4 text-neutral-300" />}
                                </span>
                                <span className="flex-1 truncate">{l}</span>
                                {pending !== undefined && pending !== initial && (
                                    <span className={`text-[9px] px-1 py-0.5 rounded ${pending ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                        {pending ? "추가" : "제거"}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="px-3 py-2 border-t border-neutral-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-900"
                    >취소</button>
                    <button
                        onClick={applyChanges}
                        className="px-3 py-1 text-xs bg-[#0F766E] text-white rounded hover:bg-[#0d5e56]"
                    >적용</button>
                </div>
            </div>
        </>
    );
}

// 내보내기 메뉴 — vCard / CSV 선택
function ExportMenu({
    disabled, onExport,
}: {
    disabled: boolean;
    onExport: (fmt: "vcard" | "csv") => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                disabled={disabled}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded-r-full transition-colors text-left disabled:opacity-60"
                title="vCard 또는 CSV 형식으로 저장"
            >
                <Upload className="h-4 w-4" />
                <span className="flex-1">내보내기</span>
                <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && !disabled && (
                <div className="ml-7 mt-1 mb-1 flex flex-col bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
                    <button
                        onClick={() => { onExport("vcard"); setOpen(false); }}
                        className="px-3 py-2 text-xs text-left text-neutral-700 hover:bg-[#0F766E]/10 hover:text-[#0F766E] flex items-center gap-2"
                    >
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 rounded">vcf</span>
                        vCard <span className="text-neutral-400">(iOS·Google)</span>
                    </button>
                    <button
                        onClick={() => { onExport("csv"); setOpen(false); }}
                        className="px-3 py-2 text-xs text-left text-neutral-700 hover:bg-[#0F766E]/10 hover:text-[#0F766E] flex items-center gap-2 border-t border-neutral-100"
                    >
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 rounded">csv</span>
                        CSV <span className="text-neutral-400">(Excel·Sheets)</span>
                    </button>
                </div>
            )}
        </div>
    );
}

// 모바일용 가로 필터 pill
function FilterPill({
    active, onClick, children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                active
                    ? "bg-[#0F766E] text-white border-[#0F766E]"
                    : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            }`}
        >
            {children}
        </button>
    );
}

function ContactModal({ form, setForm, editing, saving, onSave, onClose }: {
    form: Omit<Contact, "id">;
    setForm: React.Dispatch<React.SetStateAction<Omit<Contact, "id">>>;
    editing: boolean;
    saving: boolean;
    onSave: () => void;
    onClose: () => void;
}) {
    function field(key: keyof typeof form) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [key]: e.target.value }));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <h2 className="font-semibold text-neutral-900">{editing ? "연락처 수정" : "연락처 추가"}</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-5 w-5" /></button>
                </div>
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <Field label="이름 *">
                        <div className="relative">
                            <input type="text" value={form.name} onChange={field("name")} placeholder="홍길동" className={INPUT} />
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, is_favorite: !f.is_favorite }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5"
                                title={form.is_favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                            >
                                <Star className={`h-4 w-4 ${form.is_favorite ? "fill-amber-400 text-amber-400" : "text-neutral-300 hover:text-amber-400"}`} />
                            </button>
                        </div>
                    </Field>
                    <Field label="전화번호">
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={field("phone")}
                            onBlur={(e) => setForm(f => ({ ...f, phone: formatPhoneKR(e.target.value) }))}
                            placeholder="01012345678"
                            className={`${INPUT} font-mono`}
                        />
                    </Field>
                    <Field label="이메일">
                        <input type="email" value={form.email} onChange={field("email")} placeholder="example@email.com" className={INPUT} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="회사">
                            <input type="text" value={form.organization || ""} onChange={field("organization")} placeholder="Ten:One" className={INPUT} />
                        </Field>
                        <Field label="직책">
                            <input type="text" value={form.title || ""} onChange={field("title")} placeholder="대표" className={INPUT} />
                        </Field>
                    </div>
                    <Field label="주소">
                        <div className="flex items-stretch gap-2">
                            <input
                                type="text"
                                value={form.address || ""}
                                onChange={field("address")}
                                placeholder="우편번호 검색을 누르거나 직접 입력"
                                className={`${INPUT} flex-1 min-w-0`}
                            />
                            <AddressPickerButton
                                onSelect={(addr) => setForm(f => ({ ...f, address: addr }))}
                                label="우편번호 검색"
                                className="shrink-0"
                            />
                        </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="그룹">
                            <input type="text" value={form.group_name} onChange={field("group_name")} placeholder="가족, 학교, 회사…" className={INPUT} />
                        </Field>
                        <Field label="관계">
                            <select value={form.relationship} onChange={field("relationship")} className={INPUT}>
                                <option value="">선택</option>
                                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="생일 (MM-DD)">
                        <input type="text" value={form.birthday} onChange={field("birthday")} placeholder="01-15" maxLength={5} className={INPUT} />
                    </Field>
                    <Field label="라벨 (Google Contacts 호환)">
                        <LabelInput
                            value={form.labels || []}
                            onChange={(labels) => setForm(f => ({ ...f, labels }))}
                        />
                    </Field>
                    <Field label="메모">
                        <textarea value={form.note} onChange={field("note")} placeholder="메모" rows={2} className={`${INPUT} resize-none`} />
                    </Field>
                </div>
                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50">취소</button>
                    <button
                        onClick={onSave}
                        disabled={saving || !form.name.trim()}
                        className="px-4 py-2 text-sm text-white bg-[#0F766E] rounded-lg hover:bg-[#0d5e56] disabled:opacity-50 transition-colors"
                    >
                        {saving ? "저장 중…" : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const INPUT = "w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
            {children}
        </div>
    );
}

// 라벨 다중 입력 (Google Contacts 스타일 chip)
function LabelInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const [input, setInput] = useState("");
    function add(label: string) {
        const t = label.trim();
        if (!t) return;
        if (value.includes(t)) { setInput(""); return; }
        onChange([...value, t]);
        setInput("");
    }
    function remove(label: string) {
        onChange(value.filter(l => l !== label));
    }
    return (
        <div className="flex flex-wrap gap-1.5 px-2 py-1.5 border border-neutral-300 rounded-lg focus-within:border-[#0F766E]">
            {value.map(l => (
                <span key={l} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0F766E]/10 text-[#0F766E] text-xs rounded-full">
                    {l}
                    <button type="button" onClick={() => remove(l)} className="text-[#0F766E]/70 hover:text-[#0F766E]">
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        add(input);
                    } else if (e.key === "Backspace" && !input && value.length > 0) {
                        remove(value[value.length - 1]);
                    }
                }}
                onBlur={() => input && add(input)}
                placeholder={value.length === 0 ? "라벨 입력 후 Enter (예: 거래처, 동창, VIP)" : ""}
                className="flex-1 min-w-[120px] text-sm bg-transparent focus:outline-none py-0.5"
            />
        </div>
    );
}
