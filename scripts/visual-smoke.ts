/**
 * Smoke visual + console check. Run: npm start (port 3000) then npx tsx scripts/visual-smoke.ts
 */
import fs from "fs";
import path from "path";
import { chromium, type ConsoleMessage, type Page } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const routes = [
  "/",
  "/products",
  "/products/banner",
  "/products/wind-banner",
  "/products/cartao",
  "/cart",
];

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const outDir = path.join(process.cwd(), ".visual-smoke");

async function collectPageIssues(page: Page, route: string, consoleLines: string[]) {
  page.on("console", (msg: ConsoleMessage) => {
    const t = msg.type();
    if (t === "error" || t === "warning") {
      consoleLines.push(`[${route}] console.${t}: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    consoleLines.push(`[${route}] pageerror: ${err.message}`);
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const allConsole: string[] = [];
  const failedResponses: string[] = [];

  for (const route of routes) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await collectPageIssues(page, `${route} (${vp.name})`, allConsole);

      page.on("response", (res) => {
        const u = res.url();
        if (!u.startsWith(base) && !u.includes("127.0.0.1")) return;
        if (res.status() >= 400) {
          failedResponses.push(`${res.status()} ${u}`);
        }
      });

      const url = `${base}${route}`;
      const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      if (!res?.ok()) {
        failedResponses.push(`nav ${res?.status() ?? "?"} ${url}`);
      }
      await page.waitForTimeout(800);
      const safe = route.replace(/\//g, "_") || "home";
      const shot = path.join(outDir, `${safe}-${vp.name}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      await context.close();
    }
  }

  await browser.close();

  const uniqueFailed = [...new Set(failedResponses)];
  const uniqueConsole = [...new Set(allConsole)];

  const reportPath = path.join(outDir, "report.txt");
  const report = [
    `Screenshots: ${outDir}`,
    "",
    uniqueFailed.length ? "HTTP issues:" : "HTTP: no 4xx/5xx on same-origin responses logged",
    ...uniqueFailed.map((l) => `  - ${l}`),
    "",
    uniqueConsole.length ? "Console:" : "Console: no errors/warnings captured",
    ...uniqueConsole.map((l) => `  - ${l}`),
    "",
  ].join("\n");

  fs.writeFileSync(reportPath, report, "utf8");
  console.log(report);

  if (uniqueFailed.some((l) => l.startsWith("nav"))) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
