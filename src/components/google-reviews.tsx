import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import staticReviews from "@/data/google-reviews.json";
import { Star, ArrowUpRight, ArrowDown, MessageSquareQuote } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const reviewsUrl = "https://www.google.com/search?q=footbalance+t%C3%BCrkiye";
const safeUrl = (value?: string) => (value?.startsWith("https://") ? value : undefined);
type Review = {
  name: string;
  rating: number;
  originalText?: { text: string };
  text?: { text: string };
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution: { displayName: string; uri?: string; photoUri?: string };
};
type Place = {
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Review[];
  attributions?: { provider: string; providerUri?: string }[];
};
const place: Place = staticReviews;
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-1 text-[#B77908]" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className="size-4"
          fill={value <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
export function GoogleReviews({ compact = false }: { compact?: boolean }) {
  const { language, tx } = useTranslation();
  const en = language === "en";
  if (compact) {
    return (
      <section aria-label={en ? "Customer reviews" : "Kullanıcı yorumları"} className="bg-muted">
        <div className="mx-auto max-w-[1360px] px-5 pt-4 pb-10 md:pb-12 lg:px-8">
          <a
            href="#deneyimler"
            className="group flex flex-col gap-5 rounded-2xl border border-primary/15 bg-background px-6 py-5 shadow-sm transition hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-primary">
                <MessageSquareQuote className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-semibold sm:text-lg">
                  {en
                    ? "Real experiences. Confident steps."
                    : "Gerçek deneyimler. Güvenli adımlar."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {en
                    ? "Discover what our customers say on Google."
                    : "Kullanıcılarımızın Google yorumlarını keşfet."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:justify-end">
              {place?.rating !== undefined && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Google</span>
                  <strong className="text-xl">
                    {place.rating.toLocaleString(en ? "en" : "tr")}
                  </strong>
                  <Stars rating={place.rating} />
                  {place.userRatingCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({place.userRatingCount.toLocaleString(en ? "en" : "tr")}{" "}
                      {en ? "reviews" : "yorum"})
                    </span>
                  )}
                </div>
              )}
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                {en ? "Read reviews" : "Yorumları incele"}
                <ArrowDown
                  className="size-4 transition-transform group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </a>
        </div>
      </section>
    );
  }
  return (
    <section
      id="deneyimler"
      aria-labelledby="google-reviews-title"
      className="scroll-mt-24 bg-background"
    >
      <div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 id="google-reviews-title" className="text-3xl font-semibold sm:text-5xl">
              {tx("Hareket etmeye devam edenlerin deneyimleri.")}
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {tx(
                "Günlük yaşamdan spora, FootBalance’ın farklı hareket ihtiyaçlarına eşlik ettiği alanları keşfet.",
              )}
            </p>
            {place?.rating !== undefined && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <strong className="text-2xl">
                  {place.rating.toLocaleString(en ? "en" : "tr")}
                </strong>
                <Stars rating={place.rating} />
                <span className="text-sm text-muted-foreground">
                  ({place.userRatingCount?.toLocaleString(en ? "en" : "tr")}{" "}
                  {en ? "reviews" : "yorum"})
                </span>
              </div>
            )}
          </div>
          <a
            href={safeUrl(place?.googleMapsUri) ?? reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted"
          >
            {en ? "View all reviews on Google" : "Tüm yorumları Google’da gör"}
            <ArrowUpRight className="size-4" />
          </a>
        </div>
        {place.reviews?.length ? (
          <>
            <p className="mt-8 text-xs text-muted-foreground">
              <span className="mr-2 font-medium">Google Maps</span>
              {en
                ? "Selected reviews, shown in their original language."
                : "Seçilmiş yorumlar orijinal dilinde gösterilir."}
            </p>
            <Carousel
              opts={{ align: "start" }}
              className="mt-4"
              aria-label={en ? "Customer reviews" : "Kullanıcı yorumları"}
            >
              <div className="mb-4 flex justify-end gap-2">
                <CarouselPrevious
                  aria-label={en ? "Previous review" : "Önceki yorum"}
                  className="static size-11 translate-y-0"
                />
                <CarouselNext
                  aria-label={en ? "Next review" : "Sonraki yorum"}
                  className="static size-11 translate-y-0"
                />
              </div>
              <CarouselContent className="items-stretch">
                {place.reviews.map((review) => (
                  <CarouselItem key={review.name} className="basis-[90%] md:basis-1/2 lg:basis-1/3">
                    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-background p-6">
                      <div className="flex items-center gap-3">
                        {safeUrl(review.authorAttribution.photoUri) && (
                          <img
                            src={safeUrl(review.authorAttribution.photoUri)}
                            alt=""
                            width={40}
                            height={40}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="size-10 rounded-full"
                          />
                        )}
                        <div>
                          <a
                            href={safeUrl(review.authorAttribution.uri)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:underline"
                          >
                            {review.authorAttribution.displayName}
                          </a>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {review.relativePublishTimeDescription}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Stars rating={review.rating} />
                      </div>
                      {(review.originalText?.text ?? review.text?.text) && (
                        <p className="mt-4 whitespace-pre-line text-sm leading-6">
                          {review.originalText?.text ?? review.text?.text}
                        </p>
                      )}
                      <a
                        href={
                          safeUrl(review.googleMapsUri) ??
                          safeUrl(place.googleMapsUri) ??
                          reviewsUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-block pt-5 text-xs font-semibold underline"
                      >
                        {en ? "Read on Google Maps" : "Google Maps’te oku"}
                      </a>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {place.attributions?.map((item) => (
              <a
                key={item.provider}
                href={safeUrl(item.providerUri)}
                className="mr-3 text-xs"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.provider}
              </a>
            ))}
          </>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            {en
              ? "You can read our customer reviews on Google."
              : "Kullanıcılarımızın yorumlarını Google üzerinden inceleyebilirsiniz."}
          </p>
        )}
      </div>
    </section>
  );
}
