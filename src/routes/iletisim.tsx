import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/footbalance-logo.svg";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim | FootBalance Türkiye" },
      { name: "description", content: "FootBalance Türkiye Merkez Ofis iletişim bilgileri, çalışma saatleri ve iletişim formu. Randevu talebi, geri bildirim ve çözüm ortaklığı için bize ulaşın." },
      { property: "og:title", content: "İletişim | FootBalance Türkiye" },
      { property: "og:description", content: "Merkez ofis telefon, e-posta ve adres bilgileri ile iletişim formu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/iletisim" }],
  }),
  component: ContactPage,
});


const PHONE = "+(90) 212 325 88 51";
const EMAIL = "info@onbrands.com.tr";
const ADDRESS = "Esentepe Mahallesi, Atom Sok. No:20, Kanyon Apt. Kat:3 Daire: 5 Şişli / İSTANBUL";

const SUBJECTS = ["Randevu Talebi", "Geri Bildirim", "Çözüm Ortağı Ol", "Diğer"] as const;



function ContactPage() {
  const [menu, setMenu] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center gap-6 px-5 lg:px-8">
          <Link to="/" aria-label="FootBalance Türkiye ana sayfa" className="shrink-0"><img src={logo} alt="FootBalance" className="h-8 w-auto" /></Link>
          <nav aria-label="Ana menü" className="ml-auto hidden items-center gap-5 text-[13px] font-semibold lg:flex">
            <Link to="/" hash="nedir">Kişiye Özel Tabanlık</Link>
            <Link to="/" hash="teknoloji">Nasıl Hazırlanır?</Link>
            <Link to="/merkezler">Merkezler</Link>
            <Link to="/hakkimizda">Hakkımızda</Link>
          </nav>
          <Link to="/cozum-ortagi-ol" className="ml-auto hidden min-h-11 items-center text-sm font-semibold text-muted-foreground xl:flex">Çözüm Ortağı Ol</Link>
          <Link to="/" hash="top" className="hidden sm:inline-flex"><Button type="button" variant="appointment" size="touch">Randevu Al</Button></Link>
          <Button aria-label="Menüyü aç" variant="ghost" size="icon" className="ml-auto h-11 w-11 lg:hidden" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button>
        </div>
        {menu && (
          <nav className="grid border-t border-border bg-background px-5 py-5 text-base font-semibold lg:hidden">
            <Link className="py-3" to="/" onClick={() => setMenu(false)}>Ana Sayfa</Link>
            <Link className="py-3" to="/merkezler" onClick={() => setMenu(false)}>Merkez Bul</Link>
            <Link className="py-3" to="/hakkimizda" onClick={() => setMenu(false)}>Hakkımızda</Link>
            <Link className="py-3" to="/cozum-ortagi-ol" onClick={() => setMenu(false)}>Çözüm Ortağı Ol</Link>
          </nav>
        )}
      </header>

      <main>
        <section className="bg-secondary">
          <div className="mx-auto max-w-[1360px] px-5 py-14 md:py-20 lg:px-8">
            <p className="mb-5 text-xs font-bold uppercase text-muted-foreground">Bize Ulaşın</p>
            <h1 className="max-w-[18ch] text-[40px] font-semibold leading-[1.04] sm:text-5xl lg:text-[64px]">FootBalance Türkiye Merkez Ofis</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted-foreground">Randevu talebi, geri bildirim veya çözüm ortaklığı için bize telefon, e-posta ya da aşağıdaki form üzerinden ulaşabilirsin.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <a href="tel:+902123258851" className="rounded-xl border border-border bg-background p-5 hover:border-primary"><p className="text-[11px] font-bold uppercase text-muted-foreground">Telefon</p><p className="mt-1 text-base font-semibold">{PHONE}</p></a>
              <a href={`mailto:${EMAIL}`} className="rounded-xl border border-border bg-background p-5 hover:border-primary"><p className="text-[11px] font-bold uppercase text-muted-foreground">E-posta</p><p className="mt-1 break-all text-base font-semibold">{EMAIL}</p></a>
              <div className="rounded-xl border border-border bg-background p-5 sm:col-span-2"><p className="text-[11px] font-bold uppercase text-muted-foreground">Adres</p><p className="mt-1 text-sm font-semibold leading-6">{ADDRESS}</p></div>
              <p className="text-sm text-muted-foreground sm:col-span-2">Hafta içi: 09:00 - 19:00 · Cumartesi: 10:00 - 17:00</p>
            </div>
          </div>
        </section>

        <section id="form" className="bg-background">
          <div className="mx-auto grid max-w-[1180px] items-start gap-8 px-5 py-12 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-14">
            <div className="max-w-xl lg:col-span-5 lg:pt-2">
              <p className="text-sm font-bold uppercase text-muted-foreground">İletişim Formu</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Mesajını bize ilet.</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-[17px]">Formu doldur, ekibimiz en kısa sürede seninle iletişime geçsin. Randevu için dilersen doğrudan sana en yakın merkeze de ulaşabilirsin.</p>
              <Link to="/merkezler" className="mt-7 inline-flex"><Button type="button" variant="quiet" size="touch">Merkez Bul <ArrowRight /></Button></Link>
            </div>
            <div className="min-w-0 lg:col-span-7">
              {sent ? (
                <div className="rounded-xl border border-border bg-secondary p-6 sm:p-8">
                  <h3 className="text-xl font-semibold">Mesajın bize ulaştı.</h3>
                  <p className="mt-3 text-muted-foreground">En kısa sürede seninle iletişime geçeceğiz. Acil konular için {PHONE} numarasından bize ulaşabilirsin.</p>
                  <Button type="button" variant="quiet" size="touch" className="mt-6" onClick={() => setSent(false)}>Yeni Mesaj Gönder</Button>
                </div>
              ) : (
                <form className="grid gap-x-3 gap-y-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-5" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                  <label className="block text-sm font-semibold sm:col-span-2">Konu
                    <select required defaultValue="" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal">
                      <option value="" disabled>Seçiniz</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">Ad Soyad<input required className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">Telefon<input required type="tel" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">E-posta<input required type="email" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal" /></label>
                  <label className="block text-sm font-semibold">Bulunduğunuz Şehir?
                    <input required className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-4 font-normal" placeholder="Şehrinizi yazın" />
                  </label>
                  <label className="block text-sm font-semibold sm:col-span-2">Mesajınız<textarea required rows={4} className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 font-normal" /></label>
                  <label className="flex gap-3 text-sm leading-6 sm:col-span-2"><input required type="checkbox" className="mt-1 size-5" /> KVKK aydınlatma metnini okudum ve iletişim kurulmasına onay veriyorum.</label>
                  <div className="sm:col-span-2"><Button type="submit" variant="appointment" size="wide">Mesajı Gönder</Button></div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-graphite text-primary-foreground">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-5 py-10 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between lg:px-8"><img src={logo} alt="FootBalance" className="h-8 w-auto brightness-0 invert" /><p>© 2026 FootBalance Türkiye</p></div>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-2 border-t border-border bg-background md:hidden"><Link to="/merkezler" className="flex h-full items-center justify-center gap-2 text-sm font-semibold"><MapPin className="size-4" /> Merkez Bul</Link><Link to="/" hash="top" className="h-full"><Button className="h-full w-full rounded-none">Randevu Al</Button></Link></div>
    </div>
  );
}
