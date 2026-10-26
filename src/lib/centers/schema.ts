import { centerPhones } from "./phones.ts";
import { z } from "zod";
import type { Center } from "@/data/centers";
export type ManagedCenter = Center & {
  id: string;
  active: boolean;
  sortOrder: number;
  revision: number;
};
const webUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    try {
      return ["https:", "http:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Geçerli bir http/https adresi girin.");
export const centerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  person: z.string().trim().max(200),
  phone: z
    .string()
    .trim()
    .max(500)
    .refine((value) => {
      const numbers = centerPhones(value);
      return (
        numbers.length <= 5 &&
        numbers.every(
          (number) =>
            number.length <= 80 &&
            number.replace(/\D/g, "").length >= 6 &&
            number.replace(/\D/g, "").length <= 20,
        )
      );
    }, "En fazla 5 geçerli telefon numarası girin."),
  address: z.string().trim().min(1).max(1000),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  maps: webUrl,
  site: webUrl,
  city: z.string().trim().min(1).max(100),
  main: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(100000),
});
