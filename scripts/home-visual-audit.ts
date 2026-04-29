/**
 * Auditoria visual da home. Servidor: BASE_URL (ex.: http://127.0.0.1:3010)
 * npx tsx scripts/home-visual-audit.ts
 */
import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3010";
const outDir = path.join(process.cwd(), ".visual-smoke", "audit-home");

async function httpStatus(pathname: string) {
  const res = await fetch(`${base}${pathname}`, { redirect: "follow" });
  return res.status;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const report: string[] = [`BASE_URL=${base}`, ""];

  const routes = ["/", "/products", "/cart", "/login", "/order"];
  report.push("HTTP:");
  for (const r of routes) {
    try {
      const s = await httpStatus(r);
      report.push(`  ${r} -> ${s}`);
    } catch (e) {
      report.push(`  ${r} -> ERROR ${e}`);
    }
  }
  report.push("");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 90_000 });

  const logoCount = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    return imgs.filter((img) => {
      const alt = (img.getAttribute("alt") ?? "").toLowerCase();
      const src = (img.getAttribute("src") ?? "").toLowerCase();
      return alt.includes("prismarq") || src.includes("logo");
    }).length;
  });

  const mainHasBrandLogo = await page.evaluate(() => {
    const main = document.querySelector("#main");
    if (!main) return { imgs: 0, hasLogoFile: false };
    const imgs = main.querySelectorAll("img");
    let hasLogoFile = false;
    imgs.forEach((img) => {
      const s = (img.getAttribute("src") ?? "").toLowerCase();
      if (s.includes("logo") && s.includes("header")) hasLogoFile = true;
    });
    return { imgs: imgs.length, hasLogoFile };
  });

  report.push(`Imagens com marca/logo no DOM (alt/src): ${logoCount}`);
  report.push(`#main: ${mainHasBrandLogo.imgs} img(s), logo header.png no main: ${mainHasBrandLogo.hasLogoFile ? "SIM (possivel duplicata visual)" : "NAO"}`);
  report.push("");

  const featuredText = await page.evaluate(() => {
    const h = document.getElementById("home-featured-heading");
    const section = h?.closest("section");
    return section?.innerText ?? "";
  });
  const featuredHasPrice = /R\$\s*\d|\/m²|m2|pix/i.test(featuredText);
  report.push("Secao 'Os mais pedidos' (texto agregado):");
  report.push(featuredText.slice(0, 500).replace(/\n/g, " | "));
  report.push(`Contem indicador de preço (R$, m2, etc.): ${featuredHasPrice ? "SIM — revisar" : "NAO"}`);
  report.push("");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(outDir, "home-desktop-hero.png"), fullPage: false });
  await page.screenshot({ path: path.join(outDir, "home-desktop-full.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(outDir, "home-mobile-top.png"), fullPage: false });

  await browser.close();

  const reportPath = path.join(outDir, "audit-report.txt");
  fs.writeFileSync(reportPath, report.join("\n"), "utf8");
  console.log(report.join("\n"));
  console.log(`\nScreenshots: ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
