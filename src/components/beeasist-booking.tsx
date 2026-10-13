import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";

export function BeeasistBooking() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { tx } = useTranslation();

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const script = document.createElement("script");
    script.src = "https://app.beeasist.com/embed.js";
    script.type = "text/javascript";
    script.async = true;
    script.onerror = () => setFailed(true);
    const observer = new MutationObserver(() => {
      const frame = element.querySelector("iframe");
      if (frame) frame.title = "Beeasist — FootBalance";
    });
    observer.observe(element, { childList: true });
    element.appendChild(script);
    return () => {
      observer.disconnect();
      script.remove();
      element.replaceChildren();
    };
  }, []);

  return (
    <>
      <style>{".sticky-buttons { display: none !important; }"}</style>
      <div
        ref={container}
        className="beeasist-embed min-h-[725px] w-full"
        data-url="https://app.beeasist.com/c/ncXdSJGv"
        data-width="100%"
        data-height="725px"
      />
      {failed && (
        <a
          className="inline-flex min-h-11 items-center underline"
          href="https://app.beeasist.com/c/ncXdSJGv"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx("Randevu Al")}
        </a>
      )}
    </>
  );
}
