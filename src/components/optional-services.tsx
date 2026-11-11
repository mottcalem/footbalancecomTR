import { useEffect } from "react";
import { CONSENT_EVENT, CONSENT_KEY, readConsent } from "@/lib/cookie-consent";

function inlineScript(id: string, code: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.textContent = code;
  document.head.appendChild(script);
}

export function OptionalServices() {
  useEffect(() => {
    const load = () => {
      const consent = readConsent();
      if (!consent) return;
      if (consent.analytics && consent.marketing) {
        inlineScript(
          "google-tag-manager",
          `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T4T2LQLH');`,
        );
      }
      if (consent.marketing) {
        inlineScript(
          "meta-pixel",
          `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','258016955490147');
fbq('track','PageView');`,
        );
      }
      if (consent.analytics) {
        inlineScript(
          "microsoft-clarity",
          `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "z17gdw3hei");`,
        );
      }
      if (consent.support) {
        inlineScript(
          "supsis-init",
          `window.supsis = window.supsis || function () {
    (supsis.q = supsis.q || []).push(arguments);
};
supsis.l = +new Date();`,
        );
        if (!document.getElementById("supsis-loader")) {
          const script = document.createElement("script");
          script.id = "supsis-loader";
          script.src = "https://footbalance.visitor.supsis.live/static/js/loader.js";
          script.async = true;
          document.body.appendChild(script);
        }
      }
    };
    const syncTab = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY || event.key === null) window.location.reload();
    };
    load();
    window.addEventListener(CONSENT_EVENT, load);
    window.addEventListener("storage", syncTab);
    return () => {
      window.removeEventListener(CONSENT_EVENT, load);
      window.removeEventListener("storage", syncTab);
    };
  }, []);
  return null;
}
