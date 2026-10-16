import { useState } from "react";
import { ArrowRight } from "lucide-react";

type CatalogProduct = {
  title: string;
  path: string;
  image: string;
  alt: string;
  description: string;
};
export type ProductCatalogData = {
  title: string;
  sections: { title: string; description: string; products: CatalogProduct[] }[];
};

export function ProductCatalog({
  catalog,
  english,
}: {
  catalog: ProductCatalogData;
  english: boolean;
}) {
  return (
    <div>
      <h1 className="text-3xl font-semibold sm:text-4xl">{catalog.title}</h1>
      <nav
        aria-label={english ? "Product groups" : "Ürün grupları"}
        className="mt-7 flex flex-wrap gap-2"
      >
        {catalog.sections.map((section, index) => (
          <a
            key={section.title}
            href={`#product-group-${index}`}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:bg-muted"
          >
            {section.title}
          </a>
        ))}
      </nav>
      <div className="mt-12 space-y-16">
        {catalog.sections.map((section, index) => (
          <section key={section.title} id={`product-group-${index}`} className="scroll-mt-28">
            <div className="mb-7 border-b border-border pb-5">
              <h2 className="text-2xl font-semibold sm:text-3xl">{section.title}</h2>
              <p className="mt-3 text-muted-foreground">{section.description}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {section.products.map((product) => (
                <article
                  key={product.path}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-md"
                >
                  <a href={product.path} className="group flex h-full flex-col">
                    <div className="bg-white p-6">
                      <img
                        src={product.image}
                        alt={product.alt}
                        width={1000}
                        height={1000}
                        loading="lazy"
                        className="aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 pt-2">
                      <h3 className="text-xl font-semibold">{product.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {product.description}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold">
                        {english ? "View details" : "Detayları Gör"}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export type ProductPageData = {
  title: string;
  images: { src: string; alt: string }[];
  content: string;
};
export function ProductDetail({
  product,
  english,
}: {
  product: ProductPageData;
  english: boolean;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const activeImage = product.images[selectedImage] ?? product.images[0];
  return (
    <article>
      <a
        href={english ? "/en/products/" : "/urunler/"}
        className="text-sm font-semibold text-muted-foreground"
      >
        {english ? "← All products" : "← Tüm ürünler"}
      </a>
      <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">{product.title}</h1>
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
        <div>
          {activeImage && (
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              width={1000}
              height={1000}
              className="aspect-square w-full rounded-2xl border border-border bg-white object-contain p-5"
            />
          )}
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={`${product.title} ${english ? "image" : "görsel"} ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-xl border bg-white p-1 ${selectedImage === index ? "border-primary ring-1 ring-primary" : "border-border"}`}
                >
                  <img
                    src={image.src}
                    alt=""
                    width={120}
                    height={120}
                    loading="lazy"
                    className="aspect-square w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div
            className="article-content [&_h2:first-child]:mt-0"
            dangerouslySetInnerHTML={{ __html: product.content }}
          />
          <a
            href={english ? "/en/footbalance-service-points/" : "/footbalance-hizmet-noktalari/"}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {english ? "Find a service point" : "Hizmet noktalarını keşfet"}
          </a>
        </div>
      </div>
    </article>
  );
}
