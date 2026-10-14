import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function InterviewBanner() {
  const [dismissed, setDismissed] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { tx } = useTranslation();
  if (dismissed || pathname.includes("prof-dr-gul-baltaci")) return null;
  return (
    <aside
      aria-label={tx("Prof. Dr. Gül Baltacı röportajı")}
      className="bg-primary text-primary-foreground"
    >
      <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-5 py-3 lg:px-8">
        <Link
          to="/prof-dr-gul-baltaci/"
          className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm font-medium"
        >
          <span>
            {tx(
              "Meslekte Fark Yaratan Fizyoterapistler: Prof. Dr. Gül Baltacı ile Kariyer ve Başarı",
            )}
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-background px-4 py-2 font-semibold text-foreground">
            {tx("Hemen İzle")} <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={tx("Duyuruyu kapat")}
          className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-primary-foreground/15"
        >
          <X className="size-4" />
        </button>
      </div>
    </aside>
  );
}
