import { useState } from "react";
import videos from "@/data/videos.json";

export function VideoLibrary() {
  const [selected, setSelected] = useState(videos[0]);
  if (!selected) return null;
  return (
    <div className="mt-8">
      <p className="text-lg text-muted-foreground">
        Footbalance hakkında merak ettiklerinizi videolarımızı izleyerek öğrenin
      </p>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="lg:sticky lg:top-24">
          <iframe
            key={selected.id}
            src={`https://www.youtube-nocookie.com/embed/${selected.id}`}
            title={selected.title}
            className="aspect-video w-full rounded-2xl border border-border"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <h2 className="mt-5 text-xl font-semibold">{selected.title}</h2>
          <a
            href={`https://www.youtube.com/watch?v=${selected.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm underline underline-offset-4"
          >
            YouTube’da izle ↗
          </a>
        </div>
        <section
          aria-label="FootBalance video listesi"
          className="rounded-2xl border border-border bg-card p-3"
        >
          <h2 className="px-3 py-2 text-lg font-semibold">FootBalance</h2>
          <ul className="space-y-2">
            {videos.map((video) => (
              <li key={video.id}>
                <button
                  type="button"
                  aria-pressed={selected.id === video.id}
                  onClick={() => setSelected(video)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted ${selected.id === video.id ? "bg-muted ring-1 ring-border" : ""}`}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    width={112}
                    height={63}
                    className="aspect-video w-24 shrink-0 rounded-lg object-cover"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{video.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {video.duration}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
