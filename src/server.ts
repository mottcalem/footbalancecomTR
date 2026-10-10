import "./lib/error-capture";
import { handleRequestSubmission } from "./lib/requests/handler";
import legacyRedirects from "./data/legacy-redirects.json";
import posts from "./data/blog-index.json";
import pages from "./data/legacy-pages.json";
import { internalPath, PUBLIC_PATHS, languagePath } from "./lib/i18n/urls";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/requests") return handleRequestSubmission(request, env);
      if (
        (request.method === "GET" || request.method === "HEAD") &&
        url.searchParams.get("lang") === "en"
      ) {
        url.pathname = languagePath(url.pathname, "en");
        url.searchParams.delete("lang");
        return Response.redirect(url.href, 308);
      }
      if (request.method === "GET" || request.method === "HEAD") {
        if (url.pathname === "/feed/" || url.pathname === "/feed") {
          url.pathname = "/feed.xml";
          return Response.redirect(url.href, 308);
        }
        const path = decodeURI(url.pathname);
        const alias = (legacyRedirects as Record<string, string>)[path.replace(/\/$/, "") + "/"];
        if (alias) {
          url.pathname = alias;
          return Response.redirect(url.href, 301);
        }
        const resolved = internalPath(path);
        const known = PUBLIC_PATHS[resolved.path];
        const legacy = [...pages, ...posts].find(
          (p) => p.path.replace(/\/$/, "") === path.replace(/\/$/, ""),
        );
        const canonical = known ? known[resolved.language] : legacy?.path;
        if (canonical && path !== canonical) {
          url.pathname = canonical;
          return Response.redirect(url.href, 301);
        }
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
