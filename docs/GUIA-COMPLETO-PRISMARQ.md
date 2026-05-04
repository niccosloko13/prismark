# Guia completo — Prismarq (frontend / UX / contexto do sistema)

Este documento é para **qualquer pessoa ou modelo** que vá mexer no front (especialmente **PDP**, **checkout**, **Eleição 2026**) e precisar entender **rápido** o que existe, como encaixa e o que não pode quebrar.

**Leia também:** `AGENTS.md` na raiz (prioridades e regras oficiais do time).

---

## 1. O que é o Prismarq

- E-commerce de **comunicação visual e impressão online** (Next.js, TypeScript, Tailwind, PostgreSQL).
- Objetivo de produto: loja **premium**, alta conversão, **mobile first**.
- Duas “faces” de UI:
  - **Storefront** (`/`, `/produtos`, `/products/...`, `/order`, `/cart`, etc.): fundo **escuro**, texto claro.
  - **Admin** (`/admin/*`): tema **claro** operacional.

---

## 2. Estrutura de pastas (mapa mental)

| Pasta | Função |
|--------|--------|
| `app/` | Rotas App Router: `page.tsx`, `layout.tsx`, `api/`. |
| `app/globals.css` | Tokens CSS (`:root`), utilitários (`.panel`, `.focus-ring`, tema escuro no `html`). |
| `components/` | UI por domínio: `layout/`, `product/`, `order/`, `cart/`, `home/`, `election/`, etc. |
| `lib/` | Lógica compartilhada: catálogo, carrinho, pricing, copy, auth helpers, eventos storefront. |
| `server/` | Backend app: controllers, services, repos, `schema.sql`, validações. |
| `types/` | Tipos TypeScript globais (`Product`, `SessionUser`, etc.). |
| `public/` | Assets estáticos (logo `prismarq-header-logo.png`, imagens de marketing). |

---

## 3. Layout global e tema

- **`app/layout.tsx`**: `SiteHeader`, `main`, `SiteFooter`, `CartProvider`, `CookieConsent`, `WhatsAppFloat`.
- **`components/layout/body-route-class.tsx`**: alterna classes no `<html>`:
  - Storefront: `prismarq-site-dark` (fundo `#05070d`).
  - Admin: `prismarq-admin` (fundo claro).
- **Não** assumir que `body` é branco: na loja quase tudo é escuro.

---

## 4. Rotas públicas importantes

| Rota | Arquivo | Notas |
|------|---------|--------|
| `/` | `app/page.tsx` → `components/home/home-page.tsx` | Hero, destaques, CTA mobile Eleição 2026. |
| `/produtos` | `app/produtos/page.tsx` | Listagem loja. |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | **PDP**; `dynamic = "force-dynamic"`. |
| `/cart` | `app/cart/page.tsx` | Carrinho. |
| `/order` | `app/order/page.tsx` | **Checkout**; recebe query params de produto. |
| `/eleicao-2026` | `app/eleicao-2026/page.tsx` | Landing campanha + orçamento interativo. |
| `/contact` | `app/contact/page.tsx` | Contato. |
| `/login`, `/cadastro` | `app/login`, `app/cadastro` | Auth com `returnTo`. |
| `/dashboard/*` | `app/dashboard/*` | Área logada cliente. |

Admin fica em `app/admin/*` + `app/admin/layout.tsx` (não misturar tokens de admin no storefront).

---

## 5. Single product (PDP)

### Fluxo de dados

- **`getActiveProductBySlug` / `getActiveProducts`** (`lib/active-products.ts`): catálogo “vivo” (inclui produtos de loja/admin conforme implementação atual).
- **`buildProductExperience`**, **`getDefaultSelection`** (`lib/product-experience.ts`): passos, opções, preço derivado da seleção.
- **`calculateQuoteForProduct`** (`lib/pricing.ts`): cálculo de valores exibidos.
- Página **`app/products/[slug]/page.tsx`**: monta `experience`, `selection` inicial (incl. query string), chama **`ProductStudio`** com `initialSession` (`getSession()`).

### Componentes principais

| Arquivo | Papel |
|---------|--------|
| `components/product/product-studio.tsx` | Colunas hero, configurador, trust, barra resumo, modal auth, evento para WhatsApp. |
| `components/product/product-step-configurator.tsx` | Passos (tamanho, material, etc.), desbloqueio do checkout só no último passo conforme regra atual. |
| `components/product/order-summary-bar.tsx` | Barra fixa: resumo, Pix, “Finalizar aqui” / carrinho; chama login inline se não logado. |
| `components/product/product-media-column.tsx` | Galeria. |
| `components/product/product-trust-column.tsx` | Prova social. |
| `components/product/product-sections.tsx` | Specs, downloads, etc. |

### Comportamentos sensíveis

- **Barra inferior no mobile**: padding extra no `ProductStudio` para não cobrir conteúdo (`pb-*` + `max-lg`).
- **`PRISMARQ_PRODUCT_CTA_EVENT`** (`lib/storefront-events.ts`): avisa `WhatsAppFloat` se a barra está “compact” ou “full” para ajustar posição/ocultação.
- **Login no PDP**: `OrderAuthPanel` em modal; `embedded` esconde “Recolher” quando aplicável.

---

## 6. Carrinho

- **`lib/cart.ts`**: schema Zod dos itens, serialização, totais, merge com snapshot de produto.
- **`components/cart/cart-provider.tsx`**: estado global (React context).
- **`components/cart/cart-page.tsx`**: UI do `/cart`.

Alterações em preço exibido devem respeitar **`calculateQuoteForProduct`** e itens já salvos no carrinho.

---

## 7. Checkout (`/order`)

- **`app/order/page.tsx`**: lê `searchParams` (produto, medidas, cliente, endereço, etc.), monta `initialConfig`, busca `session` + catálogo, renderiza **`OrderBuilder`**.
- **`components/order/order-builder.tsx`**: formulário principal, validação, envio do pedido, PIX quando aplicável.
- **`components/order/checkout-header.tsx`**: cabeçalho do fluxo.
- **`components/order/order-auth-panel.tsx`**: login/cadastro reutilizável (checkout / modal PDP).

### Textos (microcopy)

- **`lib/copy.ts`**: objeto **`COPY`** — CTAs como `finalizeHere`, `finalizeOrderPix`, `fillDataToFinalize`, etc. **Prefira editar aqui** antes de espalhar string solta nos componentes.
- **Pix**: percentual em **`lib/pix-discount.ts`** (`PIX_DISCOUNT_PERCENT`); labels em `pixOffNoPixLabel` / `pixEconomizePagarNoPixLabel` em `copy.ts`.

### APIs relacionadas (referência)

- `app/api/orders/route.ts` — criação de pedido.
- `app/api/shipping/quote/route.ts` — frete.
- `app/api/payments/*` — PIX / pendências.

(Não é obrigatório alterar API para ajustes puramente visuais no checkout.)

---

## 8. Eleição 2026 (`/eleicao-2026`)

- **Página**: `app/eleicao-2026/page.tsx` — grid hero + materiais + benefícios + backdrop.
- **Hero / CTAs**: `components/election/election-hero.tsx`, `election-mobile-sticky-cta.tsx`.
- **Orçamento**: `components/election/election-products.tsx` — seleção múltipla, quantidades, **WhatsApp** com mensagem montada.
- **Dados dos materiais / mensagem**: `lib/election-budget-materials.ts`.
- **Regra de produto**: **sem preços** na landing; foco em **captação** e orçamento.
- **WhatsApp float**: `whatsapp-float.tsx` trata offset extra nesta rota no mobile.

---

## 9. Header, footer, cookies, WhatsApp

- **`components/layout/site-header.tsx`**: nav, busca, carrinho, pill **Eleição 2026** (storefront), drawer mobile.
- **`components/layout/site-footer.tsx`**: rodapé institucional.
- **`components/layout/whatsapp-float.tsx`**: FAB; offsets por rota (produto, carrinho, order, eleição).
- **`components/cookies/cookie-consent.tsx`**: banner LGPD; após aceitar, comportamento definido no código atual (sem “pill” permanente se já foi assim implementado).
- **Logo**: `lib/brand-assets.ts` — path `/prismarq-header-logo.png`; header pode usar `<img>` nativo para evitar problemas de otimização.

---

## 10. Autenticação

- **`lib/auth.ts`**: `getSession()` no servidor para páginas/layout.
- Rotas **`/api/auth/*`**: login, registro, Google, logout.
- **`components/layout/header-auth-menu.tsx`**: menu da conta.

---

## 11. Cores, contraste e Tailwind

### Tokens (`app/globals.css` `:root`)

- `--cyan: #00b5ff`, `--magenta: #ff2ebf`, `--yellow: #ffd300`, `--fg`, `--muted`, etc.

### Tailwind (`tailwind.config.ts`)

- Cores estendidas: `ink`, `cyan`, `magenta`, `yellow`, `mist`, `steel`.
- Animação `election-row-in` usada na landing Eleição.

### Checklist visual

- Texto longo: evitar `text-white/40` demais; preferir `/65`–`/80` para leitura.
- Bordas em painéis: `border-white/8`–`/15` é padrão; manter hierarquia (um nível de glow “herói” por tela).
- **Eleição 2026** é **mais agressiva** visualmente que o resto — ok por produto; PDP/checkout devem continuar **confiáveis e legíveis**.
- Validar **focus** (`focus-ring`) e **safe-area** em botões fixos no iOS.

---

## 12. Variáveis de ambiente (referência)

- Existe `.env` no projeto (não commitar segredos). Variáveis típicas: URL da app, DB, chaves de serviços. Para **só front**, o que mais importa é **`APP_URL`** / **`VERCEL_URL`** onde usado (ex.: `app/icon.tsx`).

---

## 13. Comandos após mudanças

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Migrações de banco (se tocar em schema): seguir scripts do projeto (`scripts/db-migrate.ts` etc., conforme README interno).

---

## 14. O que não quebrar (checklist)

- [ ] Barra fixa PDP + **padding** do conteúdo no mobile.
- [ ] **WhatsApp** não cobrindo CTA (evento `PRISMARQ_PRODUCT_CTA_EVENT` + offsets em `whatsapp-float.tsx`).
- [ ] **Modal de login** no “Finalizar aqui” (PDP) — UX acordada com time.
- [ ] **Checkout** — fluxo de `COPY` e validações; não remover campos obrigatórios sem alinhar backend (`server/validation/orders.ts`).
- [ ] **Eleição 2026** — envio WhatsApp e mínimos de quantidade conforme `election-budget-materials.ts`.
- [ ] **Admin** permanece tema claro (`prismarq-admin`).

---

## 15. Onde pedir confirmação de negócio

- Textos legais, prazos comerciais, percentual Pix exibido ao cliente, políticas de frete mínimo, **mínimos de orçamento** na Eleição 2026, etc.: alinhar com o **time** antes de alterar só por estética.

---

## 16. Índice de outros docs

- **`docs/CLAUDE-HANDOFF-FRONTEND.md`** — atalho que aponta para este guia.
- **`AGENTS.md`** — prioridades vivas do projeto.

Se algo neste guia divergir do código, **o código vence** — atualize este `.md` quando mudar arquitetura importante.
