/**
 * Audita layout mobile (375 / 390): overflow horizontal e sobreposição FAB x CTA.
 * Requer servidor em BASE_URL (default http://127.0.0.1:3000).
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
];

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/products", name: "products" },
  { path: "/products/banner", name: "product" },
  { path: "/cart", name: "cart" },
  { path: "/order?product=banner", name: "checkout" },
];

function intersects(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

async function main() {
  const browser = await chromium.launch();
  const results = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: vp });

    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
        await page.waitForTimeout(800);

        const sizes = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          return {
            innerWidth: window.innerWidth,
            scrollWidthDoc: doc.scrollWidth,
            scrollWidthBody: body ? body.scrollWidth : doc.scrollWidth,
            clientWidthDoc: doc.clientWidth,
          };
        });

        const horizOverflow =
          sizes.scrollWidthDoc > sizes.innerWidth + 2 || sizes.scrollWidthBody > sizes.innerWidth + 2;

        let waCtaOverlap = null;
        if (route.name === "product") {
          waCtaOverlap = await page.evaluate(() => {
            const wa = document.querySelector('a[aria-label="Falar com a Prismarq no WhatsApp"]');
            const buttons = [...document.querySelectorAll("button")].filter((b) =>
              /comprar agora|adicionar ao carrinho|finalizar/i.test(b.textContent ?? ""),
            );
            if (!wa || buttons.length === 0) {
              return { ok: true, note: "missing-elements" };
            }
            const waR = wa.getBoundingClientRect();
            for (const btn of buttons) {
              const br = btn.getBoundingClientRect();
              if (br.width < 10 || br.height < 10) continue;
              const overlap =
                !(waR.right <= br.left || waR.left >= br.right || waR.bottom <= br.top || waR.top >= br.bottom);
              if (overlap) {
                return { ok: false, overlap: true };
              }
            }
            return { ok: true, overlap: false };
          });
        }

        if (route.name === "checkout") {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(400);
        }

        results.push({
          viewport: vp.width,
          route: route.name,
          horizOverflow,
          sizes,
          waCtaOverlap,
        });
      } catch (e) {
        results.push({
          viewport: vp.width,
          route: route.name,
          error: String(e.message ?? e),
        });
      }
    }

    await page.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));

  const bad = results.filter((r) => r.horizOverflow || (r.waCtaOverlap && r.waCtaOverlap.overlap));
  if (bad.length > 0) {
    console.error("Falhas:", bad.length);
    process.exitCode = 1;
  }
}

main();
