import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function ScrollToTop() {
  const { tx } = useTranslation();
  const [visible, setVisible] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 480);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={tx("Yukarı dön")}
      title={tx("Yukarı dön")}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        })
      }
      className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] right-4 z-30 grid size-11 cursor-pointer place-items-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:right-6"
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </button>
  );
}
