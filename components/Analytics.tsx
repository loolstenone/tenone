"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSite } from "@/lib/site-context";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    clarity: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  const { siteId } = useSite();
  const pathname = usePathname();

  // SPA 라우트 변경 시 GTM dataLayer에 page_view 이벤트 + brand_id 전송
  useEffect(() => {
    if (pathname.startsWith("/intra")) return; // Intra 관리자 페이지 제외
    if (!GTM_ID || !window.dataLayer) return;
    window.dataLayer.push({
      event: "page_view",
      page_path: pathname,
      brand_id: siteId ?? "tenone",
    });
  }, [pathname, siteId]);

  // Intra 페이지에서는 스크립트 자체를 삽입하지 않음
  if (pathname.startsWith("/intra")) return null;
  if (!GTM_ID && !CLARITY_ID) return null;

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm-init" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>

      {/* GTM noscript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>

      {/* Microsoft Clarity */}
      {CLARITY_ID && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
    </>
  );
}
