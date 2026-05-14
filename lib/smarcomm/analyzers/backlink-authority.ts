// Backlink authority fetcher — Moz API v2 (primary) + Ahrefs (fallback)
// Provides domainAuthority / domainRating → E-E-A-T Authoritativeness score

export interface BacklinkData {
    domainAuthority: number | null;   // Moz DA 0-100
    domainRating: number | null;      // Ahrefs DR 0-100
    backlinks: number | null;
    referringDomains: number | null;
    provider: 'moz' | 'ahrefs' | null;
}

async function fetchFromMoz(domain: string): Promise<BacklinkData | null> {
    const accessId = process.env.MOZ_ACCESS_ID;
    const secretKey = process.env.MOZ_SECRET_KEY;
    if (!accessId || !secretKey) return null;

    try {
        // Moz API v2: Basic auth with accessId:secretKey
        const credentials = Buffer.from(`${accessId}:${secretKey}`).toString('base64');
        const res = await fetch('https://api.moz.com/v2/url_metrics', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                targets: [`${domain}/`],
                // DA, backlinks, referring domains
            }),
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return null;

        const json = await res.json();
        const row = json?.results?.[0];
        if (!row) return null;

        return {
            domainAuthority: row.domain_authority ?? null,
            domainRating: null,
            backlinks: row.links_to_target ?? null,
            referringDomains: row.linking_root_domains ?? null,
            provider: 'moz',
        };
    } catch {
        return null;
    }
}

async function fetchFromAhrefs(domain: string): Promise<BacklinkData | null> {
    const apiKey = process.env.AHREFS_API_KEY;
    if (!apiKey) return null;

    try {
        const url = new URL('https://api.ahrefs.com/v3/site-explorer/domain-rating');
        url.searchParams.set('target', domain);
        url.searchParams.set('mode', 'domain');

        const res = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return null;

        const json = await res.json();
        const dr = json?.domain?.domain_rating ?? null;
        const backlinks = json?.domain?.backlinks ?? null;
        const refDomains = json?.domain?.refdomains ?? null;

        if (dr === null) return null;

        return {
            domainAuthority: null,
            domainRating: dr,
            backlinks,
            referringDomains: refDomains,
            provider: 'ahrefs',
        };
    } catch {
        return null;
    }
}

export async function fetchBacklinkData(rawDomain: string): Promise<BacklinkData> {
    const domain = rawDomain.replace(/^www\./, '');

    // Moz first, Ahrefs fallback
    const moz = await fetchFromMoz(domain);
    if (moz) return moz;

    const ahrefs = await fetchFromAhrefs(domain);
    if (ahrefs) return ahrefs;

    return {
        domainAuthority: null,
        domainRating: null,
        backlinks: null,
        referringDomains: null,
        provider: null,
    };
}
