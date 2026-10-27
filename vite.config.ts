// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const localFormsEnv = loadEnv("", process.cwd(), [
  "SMTP_",
  "PARTNER_FORM_",
  "INTERVIEW_FORM_",
  "FORM_WEBHOOK_",
  "LEADS_",
  "DATABASE_URL",
  "ADMIN_",
]);
for (const [key, value] of Object.entries(localFormsEnv)) {
  if (!process.env[key] && value) process.env[key] = value;
}

export default defineConfig({
  nitro: { preset: "node-server" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
