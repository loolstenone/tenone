"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, ExternalLink, Loader2, SearchCheck, Sparkles } from "lucide-react";

/**
 * 인트라 › 사이트 설정 › 검색 노출 · 인공지능 최적화 (2026-10-16)
 * 원천 = ums_sites.robots_extra · sitemap_exclude · llms_txt · json_ld → lib/site-seo.ts가 그 도메인의 robots.txt·sitemap.xml·llms.txt를 만든다
 * 공통 규칙(인트라·API·로그인 차단, Sitemap 줄)과 공개 페이지 목록(사이트 메뉴 레지스트리)은 코드가 자동으로 넣는다
 */

interface Settings { robots_extra: string | null; sitemap_exclude: string[]; llms_txt: string | null; json_ld: string | null }
interface Overview {
    host: string; ownDomain: boolean; isHub: boolean; indexable: boolean; reason?: string;
    robotsUrl: string; sitemapUrl: string; urlCount: number; urlCountIfOpen: number | null;
}

const areaCls = "w-full border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-400 focus:outline-none bg-white resize-y";
const labelCls = "text-[10px] font-medium text-neutral-500 block mb-1.5";

export function SiteSeoPanel({ siteId }: { siteId: string }) {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [robotsExtra, setRobotsExtra] = useState("");
    const [exclude, setExclude] = useState("");
    const [llms, setLlms] = useState("");
    const [jsonLd, setJsonLd] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apply = (d: { settings: Settings; overview: Overview }) => {
        setOverview(d.overview);
        setRobotsExtra(d.settings.robots_extra ?? "");
        setExclude((d.settings.sitemap_exclude ?? []).join("\n"));
        setLlms(d.settings.llms_txt ?? "");
        setJsonLd(d.settings.json_ld ?? "");
    };

    useEffect(() => {
        let alive = true;
        setLoading(true); setError(null); setSaved(false); setOverview(null);
        fetch(`/api/intra/sites/seo?site=${encodeURIComponent(siteId)}`)
            .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "불러오지 못했습니다."); return d; })
            .then(d => { if (alive) apply(d); })
            .catch(e => { if (alive) setError(e.message); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [siteId]);

    const save = async () => {
        setSaving(true); setError(null); setSaved(false);
        try {
            const r = await fetch("/api/intra/sites/seo", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    site: siteId,
                    robots_extra: robotsExtra,
                    sitemap_exclude: exclude.split("\n").map(s => s.trim()).filter(Boolean),
                    llms_txt: llms,
                    json_ld: jsonLd,
                }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error ?? "저장하지 못했습니다.");
            apply(d);
            setSaved(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-neutral-100 p-5 flex items-center gap-2 text-xs text-neutral-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> 검색 노출 설정을 불러오는 중…
            </div>
        );
    }

    return (
        <>
            {/* 검색 노출 */}
            <div className="bg-white border border-neutral-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                        <SearchCheck className="h-3.5 w-3.5 text-neutral-400" /> 검색 노출
                    </h3>
                    <span className="text-[10px] text-neutral-400">robots.txt · sitemap.xml</span>
                </div>

                {overview && (
                    <div className="border border-neutral-100 bg-neutral-50 px-4 py-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${overview.indexable ? "bg-green-500" : "bg-amber-500"}`} />
                            <span className="font-medium text-neutral-800">
                                {overview.indexable ? "검색엔진에 열려 있음" : "검색 수집 막힘"}
                            </span>
                            <span className="text-neutral-400">{overview.host}</span>
                        </div>
                        {overview.reason && <p className="text-neutral-500">{overview.reason}</p>}
                        {overview.ownDomain ? (
                            <p className="text-neutral-600">
                                사이트맵 주소 <b>{overview.urlCount}</b>개
                                {overview.urlCountIfOpen != null && <> · 열리면 <b>{overview.urlCountIfOpen}</b>개</>}
                                <span className="text-neutral-400"> — 사이트 메뉴(공개 페이지) + 공개 게시판 글에서 자동</span>
                            </p>
                        ) : overview.isHub ? (
                            <p className="text-neutral-500">
                                유니버스 대표 사이트맵 — TenOne 페이지 + 공식 도메인이 없는 브랜드 경로(/0gamja 등). 공식 도메인이 있는 브랜드는 각자 사이트맵이 담당합니다.
                            </p>
                        ) : (
                            <p className="text-neutral-500">
                                자기 공식 도메인이 없어 tenone.biz 사이트맵에 포함됩니다. 아래 robots·제외 설정은 공식 도메인이 생기면 적용됩니다.
                            </p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                            <a href={overview.robotsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 underline underline-offset-2">
                                robots.txt <ExternalLink className="h-3 w-3" />
                            </a>
                            <a href={overview.sitemapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 underline underline-offset-2">
                                sitemap.xml <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                )}

                <div>
                    <label className={labelCls}>사이트맵에서 뺄 경로 (한 줄에 하나)</label>
                    <textarea value={exclude} onChange={e => { setExclude(e.target.value); setSaved(false); }}
                        rows={3} placeholder={"/madleague/certificate/verify\n/madleague/forms"} className={areaCls} />
                    <p className="text-[10px] text-neutral-400 mt-1">그 경로와 하위 주소가 빠집니다. 로그인·마이페이지·회원 전용 화면은 이미 자동으로 빠집니다</p>
                </div>
                <div>
                    <label className={labelCls}>robots.txt 추가 규칙</label>
                    <textarea value={robotsExtra} onChange={e => { setRobotsExtra(e.target.value); setSaved(false); }}
                        rows={3} placeholder={"User-agent: GPTBot\nDisallow: /"} className={areaCls} />
                    <p className="text-[10px] text-neutral-400 mt-1">공통 규칙(인트라·API·로그인 차단)과 Sitemap 줄 사이에 들어갑니다. 인공지능 크롤러 허용·차단도 여기에</p>
                </div>
            </div>

            {/* 인공지능 최적화 */}
            <div className="bg-white border border-neutral-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-neutral-400" /> 인공지능 최적화
                    </h3>
                    <span className="text-[10px] text-neutral-400">llms.txt · 구조화 데이터</span>
                </div>
                <div>
                    <label className={labelCls}>llms.txt</label>
                    <textarea value={llms} onChange={e => { setLlms(e.target.value); setSaved(false); }}
                        rows={5} placeholder={"# 사이트명\n> 사이트 설명\n\n## 주요 페이지\n- [페이지명](URL): 설명"} className={areaCls} />
                    <p className="text-[10px] text-neutral-400 mt-1">
                        {overview ? `https://${overview.host}/llms.txt` : "/llms.txt"} 로 나갑니다. 비우면 그 주소는 없음(404)
                    </p>
                </div>
                <div>
                    <label className={labelCls}>구조화 데이터 (JSON-LD)</label>
                    <textarea value={jsonLd} onChange={e => { setJsonLd(e.target.value); setSaved(false); }}
                        rows={5} placeholder={'{"@context":"https://schema.org","@type":"Organization","name":"…","url":"https://…"}'} className={areaCls} />
                    <p className="text-[10px] text-neutral-400 mt-1">브랜드 사이트 모든 화면에 들어갑니다 (현재 레이아웃 연결: MADLeague). 저장 전 JSON 형식을 확인합니다</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}
            <div className="flex items-center gap-3">
                <button onClick={save} disabled={saving}
                    className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center gap-1.5">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SearchCheck className="h-3.5 w-3.5" />}
                    검색 노출 저장
                </button>
                {saved && <span className="text-xs text-green-600 inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> 저장됨 — 1시간 안에 반영</span>}
            </div>
        </>
    );
}
