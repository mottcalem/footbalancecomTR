import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export function BeeasistBooking() {
  const [failed, setFailed] = useState(false);
  const { tx } = useTranslation();

  return (
    <>
      <style>{".sticky-buttons { display: none !important; }"}</style>
      <iframe
        title="Beeasist — FootBalance"
        src="https://app.beeasist.com/c/ncXdSJGv?source=embed"
        className="h-[1150px] w-full border-0 md:h-[725px]"
        onError={() => setFailed(true)}
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
