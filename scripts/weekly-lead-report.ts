import { weeklyReport } from "../src/lib/leads/report.ts";
import { refreshWorkbooks } from "../src/lib/leads/workbooks.ts";
import { openStore } from "../src/lib/leads/store.ts";

process.umask(0o077);
try {
  if (process.argv.includes("--export-only")) {
    openStore(process.env).close();
    await refreshWorkbooks(process.env);
    console.log("Lead workbooks exported");
  } else {
    console.log(JSON.stringify(await weeklyReport(process.env)));
  }
} catch (error) {
  console.error("Lead report failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
}
