import { z } from "zod";

export const PRACTICE_AREAS = [
  "Fizyoterapi Kliniği",
  "Ortopedi / Protez-Ortez Merkezi",
  "Spor Sağlığı Merkezi",
  "Podoloji / Ayak Sağlığı",
  "Perakende / Mağaza",
  "Diğer",
] as const;
export function todayInIstanbul() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)?.value)
    .join("-");
}
export const requestSchema = z
  .object({
    type: z.enum(["appointment", "partner"]),
    language: z.enum(["tr", "en"]),
    name: z.string().trim().min(2, "Adınızı ve soyadınızı yazın.").max(100),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (value) => /^[+\d\s().-]+$/.test(value) && /^\d{10,15}$/.test(value.replace(/\D/g, "")),
        "Geçerli bir telefon numarası yazın.",
      ),
    email: z
      .string()
      .trim()
      .max(254)
      .refine(
        (value) => !value || z.string().email().safeParse(value).success,
        "Geçerli bir e-posta adresi yazın.",
      ),
    city: z.string().trim().min(2, "Şehir seçin veya yazın.").max(80),
    center: z.string().trim().max(200).default(""),
    company: z.string().trim().max(150).default(""),
    field: z.string().max(100).default(""),
    preferredDate: z
      .string()
      .default("")
      .refine(
        (value) =>
          !value ||
          (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !Number.isNaN(Date.parse(value)) &&
            new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value &&
            value >= todayInIstanbul()),
        "Bugün veya ileri bir tarih seçin.",
      ),
    preferredTime: z
      .enum([
        "",
        "morning",
        "afternoon",
        "any",
        "10:00",
        "11:30",
        "13:00",
        "14:30",
        "16:00",
        "17:30",
      ])
      .default(""),
    message: z.string().trim().max(2000, "Mesajınız en fazla 2000 karakter olabilir.").default(""),
    consent: z.boolean().refine(Boolean, "İletişim onayını işaretleyin."),
    website: z.string().max(0).default(""),
  })
  .superRefine((value, context) => {
    if (value.type === "appointment" && !value.center)
      context.addIssue({ code: "custom", path: ["center"], message: "Bir merkez seçin." });
    if (value.type === "partner") {
      if (!value.email)
        context.addIssue({
          code: "custom",
          path: ["email"],
          message: "Geçerli bir e-posta adresi yazın.",
        });
      if (value.company.length < 2)
        context.addIssue({
          code: "custom",
          path: ["company"],
          message: "Merkez veya firma adını yazın.",
        });
      if (!PRACTICE_AREAS.includes(value.field as (typeof PRACTICE_AREAS)[number]))
        context.addIssue({ code: "custom", path: ["field"], message: "Faaliyet alanınızı seçin." });
    }
  });
export type RequestValues = z.input<typeof requestSchema>;
