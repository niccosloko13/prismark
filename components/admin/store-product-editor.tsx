"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createDefaultStoreProductPayload } from "@/lib/store-product-defaults";
import type { StoreProductPayload, StoreProductRow } from "@/lib/store-product-payload";
import { formatCurrencyBRL } from "@/lib/utils";
import type { ProductAddonService, ProductFormatOption, ProductGalleryItem } from "@/lib/product-experience";
import type { ProductDeadline, ProductFinishing, ProductMaterial } from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const accents = ["cyan", "magenta", "yellow"] as const;

// ─── editor model ───────────────────────────────────────────────────────────

type EditorModel = {
  id: string | null;
  slug: string;
  slugManual: boolean;
  isActive: boolean;
  featured: boolean;
  payload: StoreProductPayload;
};

function clonePayload(row: StoreProductRow): EditorModel {
  return {
    id: row.id,
    slug: row.slug,
    slugManual: true,
    isActive: row.isActive,
    featured: row.featured,
    payload: JSON.parse(JSON.stringify(row.payload)) as StoreProductPayload,
  };
}

function defaultModel(): EditorModel {
  const slug = "produto-novo";
  return {
    id: null,
    slug,
    slugManual: false,
    isActive: true,
    featured: false,
    payload: createDefaultStoreProductPayload(slug, "Novo produto", "Grande Formato"),
  };
}

// ─── shared input classes ────────────────────────────────────────────────────

const inputCls =
  "focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30";
const labelKicker =
  "mb-1 block text-[0.67rem] font-semibold uppercase tracking-wider text-white/45";
const sectionCls =
  "rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl";
const miniInputCls =
  "focus-ring rounded-lg border border-white/10 bg-black/35 px-2 py-1.5 text-sm text-white placeholder:text-white/30";

// ─── main export ────────────────────────────────────────────────────────────

export function StoreProductEditor({
  mode,
  initialRow,
}: {
  mode: "create" | "edit";
  initialRow: StoreProductRow | null;
}) {
  const router = useRouter();
  const [model, setModel] = useState<EditorModel>(() =>
    initialRow ? clonePayload(initialRow) : defaultModel(),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const previewHref = useMemo(
    () => `/products/${model.slug.trim().toLowerCase()}`,
    [model.slug],
  );

  const syncSlugToPayload = useCallback((next: EditorModel): EditorModel => {
    const slug = next.slug.trim().toLowerCase();
    return {
      ...next,
      slug,
      payload: { ...next.payload, product: { ...next.payload.product, slug } },
    };
  }, []);

  // convenience setters
  function setProduct(patch: Partial<StoreProductPayload["product"]>) {
    setModel((m) =>
      syncSlugToPayload({
        ...m,
        payload: { ...m.payload, product: { ...m.payload.product, ...patch } },
      }),
    );
  }
  function setMeta(patch: Partial<StoreProductPayload["meta"]>) {
    setModel((m) =>
      syncSlugToPayload({
        ...m,
        payload: { ...m.payload, meta: { ...m.payload.meta, ...patch } },
      }),
    );
  }
  function setExperience(patch: Partial<StoreProductPayload["experience"]>) {
    setModel((m) =>
      syncSlugToPayload({
        ...m,
        payload: { ...m.payload, experience: { ...m.payload.experience, ...patch } },
      }),
    );
  }

  function setName(name: string) {
    setModel((m) => {
      const nextSlug = m.slugManual ? m.slug : slugify(name) || m.slug;
      return syncSlugToPayload({
        ...m,
        slug: nextSlug,
        payload: { ...m.payload, product: { ...m.payload.product, name } },
      });
    });
  }

  function setSlug(slug: string) {
    setModel((m) =>
      syncSlugToPayload({
        ...m,
        slug,
        slugManual: true,
        payload: { ...m.payload, product: { ...m.payload.product, slug } },
      }),
    );
  }

  function save() {
    setError("");
    setMessage("");
    const body = syncSlugToPayload(model);
    const payload = {
      slug: body.slug,
      isActive: body.isActive,
      featured: body.featured,
      payload: body.payload,
    };

    startTransition(async () => {
      try {
        const url =
          mode === "create" ? "/api/admin/products" : `/api/admin/products/${model.id}`;
        const res = await fetch(url, {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as {
          product?: StoreProductRow;
          message?: string;
          issues?: unknown;
        };
        if (!res.ok) {
          const msg = data.message ?? "Não foi possível salvar.";
          throw new Error(
            typeof data.issues === "object"
              ? `${msg} Verifique os campos obrigatórios.`
              : msg,
          );
        }
        setMessage("Produto salvo com sucesso.");
        if (mode === "create" && data.product?.id) {
          router.replace(`/admin/products/${data.product.id}`);
          router.refresh();
        } else {
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar.");
      }
    });
  }

  const p = model.payload.product;
  const meta = model.payload.meta;
  const exp = model.payload.experience;

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link href="/admin/products" className="text-sm font-semibold text-cyan-300 hover:underline">
          ← Voltar à lista
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => window.open(previewHref, "_blank", "noopener,noreferrer")}
            className="focus-ring rounded-full border border-white/18 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            Visualizar produto
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={save}
            className="focus-ring rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(56,189,248,0.22)] transition hover:brightness-110 disabled:opacity-60"
          >
            {isPending ? "Salvando…" : "Salvar produto"}
          </button>
        </div>
      </div>

      <div className="min-h-5 text-sm">
        {error ? <p className="text-red-300">{error}</p> : null}
        {message ? <p className="text-emerald-300">{message}</p> : null}
      </div>

      {/* ── 1. Informações principais ── */}
      <section className={sectionCls}>
        <h2 className="text-base font-semibold text-white">Informações principais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelKicker}>Nome do produto *</span>
            <input
              value={p.name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </label>
          <div>
            <label className="block">
              <span className={labelKicker}>Slug *</span>
              <input
                value={model.slug}
                onChange={(e) => setSlug(e.target.value)}
                className={`${inputCls} font-mono text-cyan-100`}
              />
            </label>
            <p className="mt-1 text-xs text-white/38">
              URL: /products/<span className="text-white/55">{model.slug}</span>
            </p>
          </div>

          <label className="block">
            <span className={labelKicker}>Badge / selo</span>
            <input
              value={p.badge}
              onChange={(e) => setProduct({ badge: e.target.value })}
              className={inputCls}
              placeholder="ex: Mais vendido"
            />
          </label>
          <label className="block">
            <span className={labelKicker}>Categoria *</span>
            <input
              value={p.category}
              onChange={(e) => setProduct({ category: e.target.value })}
              className={inputCls}
              placeholder="ex: Grande Formato"
            />
          </label>

          <div className="flex flex-wrap gap-5 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
              <input
                type="checkbox"
                checked={model.isActive}
                onChange={(e) => setModel((m) => ({ ...m, isActive: e.target.checked }))}
                className="h-4 w-4 accent-cyan-400"
              />
              Ativo na vitrine
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
              <input
                type="checkbox"
                checked={model.featured}
                onChange={(e) =>
                  setModel((m) =>
                    syncSlugToPayload({
                      ...m,
                      featured: e.target.checked,
                      payload: {
                        ...m.payload,
                        product: { ...m.payload.product, featured: e.target.checked },
                      },
                    }),
                  )
                }
                className="h-4 w-4 accent-cyan-400"
              />
              Destaque na home
            </label>
          </div>

          <label className="block sm:col-span-2">
            <span className={labelKicker}>Descrição curta (card e cabeçalho)</span>
            <textarea
              rows={3}
              value={p.description}
              onChange={(e) => setProduct({ description: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelKicker}>Lead comercial (destaque na página do produto)</span>
            <textarea
              rows={2}
              value={p.lead}
              onChange={(e) => setProduct({ lead: e.target.value })}
              className={inputCls}
              placeholder="Frase de impacto para o topo da página."
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelKicker}>Descrição completa</span>
            <textarea
              rows={5}
              value={meta.descriptionFull}
              onChange={(e) => setMeta({ descriptionFull: e.target.value })}
              className={inputCls}
              placeholder="Texto longo para a aba de especificações / página do produto."
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelKicker}>Nota de entrega / prazo informativo</span>
            <input
              value={p.deliveryNote ?? ""}
              onChange={(e) => setProduct({ deliveryNote: e.target.value })}
              className={inputCls}
              placeholder="ex: Produção em 3–5 dias úteis após aprovação de arte."
            />
          </label>

          {/* Applications */}
          <div className="sm:col-span-2">
            <span className={labelKicker}>Aplicações (usos do produto)</span>
            <ApplicationsEditor
              values={p.applications ?? []}
              onChange={(applications) => setProduct({ applications })}
            />
          </div>
        </div>
      </section>

      {/* ── 2. Mídia ── */}
      <section className={sectionCls}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-white">Mídia — Galeria de imagens</h2>
          <p className="text-xs text-white/45">A 1ª imagem é a principal exibida no card e topo do produto.</p>
        </div>
        <GalleryEditor
          gallery={exp.gallery}
          slug={model.slug}
          onChange={(gallery) => setExperience({ gallery })}
        />
      </section>

      {/* ── 3. Preço ── */}
      <section className={sectionCls}>
        <h2 className="text-base font-semibold text-white">Preço</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className={labelKicker}>Preço base (R$/m²) *</span>
            <input
              type="number"
              step="0.01"
              min={0.01}
              value={p.basePriceM2}
              onChange={(e) => setProduct({ basePriceM2: Number(e.target.value) || 0 })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelKicker}>Unidade de cálculo</span>
            <select
              value={meta.pricingUnit}
              onChange={(e) =>
                setMeta({ pricingUnit: e.target.value as typeof meta.pricingUnit })
              }
              className={inputCls}
            >
              <option value="m2">m²</option>
              <option value="unit">Unidade</option>
              <option value="package">Pacote</option>
            </select>
          </label>
          <label className="block">
            <span className={labelKicker}>Quantidade mínima *</span>
            <input
              type="number"
              min={1}
              step={1}
              value={p.minQuantity}
              onChange={(e) =>
                setProduct({
                  minQuantity: Math.max(1, Math.round(Number(e.target.value) || 1)),
                })
              }
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelKicker}>Área mínima cobrada (m²)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={p.minimumArea}
              onChange={(e) =>
                setProduct({ minimumArea: Number(e.target.value) || 0 })
              }
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelKicker}>Valor mínimo do pedido (R$)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={meta.minimumOrderValue ?? ""}
              onChange={(e) =>
                setMeta({ minimumOrderValue: e.target.value === "" ? null : Number(e.target.value) })
              }
              className={inputCls}
              placeholder="Opcional"
            />
          </label>
        </div>
      </section>

      {/* ── 4. Tamanhos ── */}
      <section className={sectionCls}>
        <h2 className="text-base font-semibold text-white">Tamanhos / Formatos</h2>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
          <input
            type="checkbox"
            checked={meta.allowCustomSize}
            onChange={(e) => setMeta({ allowCustomSize: e.target.checked })}
            className="h-4 w-4 accent-cyan-400"
          />
          Permitir tamanho personalizado no configurador
        </label>
        {meta.allowCustomSize ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className={labelKicker}>Largura mínima (cm)</span>
              <input
                type="number"
                min={1}
                value={meta.customMinWidthCm ?? ""}
                onChange={(e) =>
                  setMeta({ customMinWidthCm: Number(e.target.value) || null })
                }
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelKicker}>Altura mínima (cm)</span>
              <input
                type="number"
                min={1}
                value={meta.customMinHeightCm ?? ""}
                onChange={(e) =>
                  setMeta({ customMinHeightCm: Number(e.target.value) || null })
                }
                className={inputCls}
              />
            </label>
          </div>
        ) : null}
        <div className="mt-4 space-y-2">
          <div className="hidden grid-cols-[1fr_90px_90px_90px_auto] gap-2 px-1 sm:grid">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/38">Label</span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/38">Larg. (cm)</span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/38">Alt. (cm)</span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/38">Recomendado</span>
            <span />
          </div>
          {exp.formats.map((f, idx) => (
            <FormatRow
              key={f.id}
              format={f}
              onChange={(next) =>
                setExperience({
                  formats: exp.formats.map((x, i) => (i === idx ? next : x)),
                })
              }
              onRemove={() =>
                setExperience({ formats: exp.formats.filter((_, i) => i !== idx) })
              }
            />
          ))}
          <button
            type="button"
            className="mt-1 rounded-full border border-dashed border-white/20 px-4 py-2 text-sm text-white/65 transition hover:border-white/35 hover:text-white/80"
            onClick={() => {
              const f: ProductFormatOption = {
                id: `fmt-${Date.now()}`,
                label: `Formato ${exp.formats.length + 1}`,
                description: "",
                width: 100,
                height: 100,
              };
              setExperience({ formats: [...exp.formats, f] });
            }}
          >
            + Adicionar tamanho
          </button>
        </div>
      </section>

      {/* ── 5. Opções ── */}
      <section className={sectionCls}>
        <h2 className="text-base font-semibold text-white">Opções do produto</h2>
        <p className="mt-1 text-xs text-white/45">
          Materiais, acabamentos e prazos alimentam o configurador. Extras são serviços opcionais no checkout.
        </p>
        <MaterialBlock
          materials={p.materials}
          onChange={(materials) => setProduct({ materials })}
        />
        <FinishingBlock
          finishings={p.finishings}
          onChange={(finishings) => setProduct({ finishings })}
        />
        <DeadlineBlock
          deadlines={p.deadlines}
          onChange={(deadlines) => setProduct({ deadlines })}
        />
        <AddonBlock
          addons={exp.addons}
          onChange={(addons) => setExperience({ addons })}
        />
      </section>

      {/* ── 6. Especificações técnicas ── */}
      <section className={sectionCls}>
        <h2 className="text-base font-semibold text-white">Especificações técnicas</h2>
        <p className="mt-1 text-xs text-white/45">
          Exibidas na tabela de specs da página do produto. Ex.: resolução, gramatura, tipo de impressão.
        </p>
        <SpecsBlock
          specs={exp.specs}
          onChange={(specs) => setExperience({ specs })}
        />
      </section>

      {/* ── 7. SEO ── */}
      <section className={sectionCls}>
        <h2 className="text-base font-semibold text-white">SEO e textos comerciais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelKicker}>Título SEO</span>
            <input
              value={meta.seoTitle}
              onChange={(e) => setMeta({ seoTitle: e.target.value })}
              className={inputCls}
              placeholder="Produto — Gráfica online | Prismarq"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelKicker}>Descrição SEO</span>
            <textarea
              rows={3}
              value={meta.seoDescription}
              onChange={(e) => setMeta({ seoDescription: e.target.value })}
              className={inputCls}
              placeholder="Até 160 caracteres para o snippet do Google."
            />
          </label>
          <label className="block">
            <span className={labelKicker}>Headline comercial</span>
            <input
              value={meta.headline}
              onChange={(e) => setMeta({ headline: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelKicker}>Subheadline</span>
            <input
              value={meta.subheadline}
              onChange={(e) => setMeta({ subheadline: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelKicker}>Tags de uso (separadas por vírgula)</span>
            <input
              value={meta.usageTags.join(", ")}
              onChange={(e) => {
                const usageTags = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                setMeta({ usageTags });
              }}
              className={inputCls}
              placeholder="loja, evento, fachada, outdoor…"
            />
          </label>
        </div>
      </section>

      {/* summary bar */}
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-xs text-white/45">
        Preço base:{" "}
        <span className="font-semibold text-white/65">{formatCurrencyBRL(p.basePriceM2)}/m²</span>
        {" · "}Área mín.: {p.minimumArea} m²
        {" · "}Qtd. mín.: {p.minQuantity}
        {" · "}Tamanhos: {exp.formats.length}
        {" · "}Fotos: {exp.gallery.filter((g) => g.src).length}
      </div>
    </div>
  );
}

// ─── GalleryEditor ────────────────────────────────────────────────────────────

function GalleryEditor({
  gallery,
  slug,
  onChange,
}: {
  gallery: ProductGalleryItem[];
  slug: string;
  onChange: (g: ProductGalleryItem[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    const added: ProductGalleryItem[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/product-images", { method: "POST", body: fd });
        const data = (await res.json()) as { url?: string; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Falha no upload.");
        added.push({
          id: `${slug}-img-${Date.now()}-${added.length}`,
          title: "",
          subtitle: "",
          accent: accents[(gallery.length + added.length) % 3],
          src: data.url!,
        });
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Erro no upload.");
      }
    }
    if (added.length) onChange([...gallery, ...added]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function move(from: number, to: number) {
    const next = [...gallery];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function makePrimary(idx: number) {
    if (idx === 0) return;
    const next = [...gallery];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    onChange(next);
  }

  function remove(idx: number) {
    onChange(gallery.filter((_, i) => i !== idx));
  }

  function updateSrc(idx: number, src: string) {
    onChange(gallery.map((item, i) => (i === idx ? { ...item, src } : item)));
  }

  function addBlank() {
    const g: ProductGalleryItem = {
      id: `${slug}-img-${Date.now()}`,
      title: "",
      subtitle: "",
      accent: accents[gallery.length % 3],
      src: "",
    };
    onChange([...gallery, g]);
  }

  return (
    <div className="mt-4">
      {gallery.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-white/40">
          Nenhuma imagem adicionada
        </div>
      ) : (
        <div className="space-y-2">
          {gallery.map((img, idx) => (
            <div
              key={img.id}
              className={[
                "flex min-h-[5rem] items-start gap-3 rounded-xl border p-3 transition",
                idx === 0
                  ? "border-cyan-400/40 bg-cyan-500/[0.06]"
                  : "border-white/10 bg-black/20",
              ].join(" ")}
            >
              {/* thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                {img.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.src}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl text-white/20">
                    ?
                  </span>
                )}
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-cyan-500/80 py-0.5 text-center text-[0.55rem] font-bold uppercase tracking-wide text-white">
                    Principal
                  </span>
                )}
              </div>

              {/* controls */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[0.65rem] font-semibold text-white/38">#{idx + 1}</span>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(idx)}
                      className="rounded-full border border-cyan-400/40 px-2 py-0.5 text-[0.65rem] font-semibold text-cyan-300 transition hover:bg-cyan-500/15"
                    >
                      Tornar principal
                    </button>
                  )}
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      title="Mover para cima"
                      disabled={idx === 0}
                      onClick={() => move(idx, idx - 1)}
                      className="rounded border border-white/12 px-2 py-0.5 text-xs text-white/65 transition hover:bg-white/[0.08] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Mover para baixo"
                      disabled={idx >= gallery.length - 1}
                      onClick={() => move(idx, idx + 1)}
                      className="rounded border border-white/12 px-2 py-0.5 text-xs text-white/65 transition hover:bg-white/[0.08] disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="rounded border border-red-400/30 px-2 py-0.5 text-xs text-red-300 transition hover:bg-red-500/10"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <input
                  value={img.src}
                  onChange={(e) => updateSrc(idx, e.target.value)}
                  className="focus-ring w-full rounded-lg border border-white/10 bg-black/35 px-2 py-1.5 font-mono text-xs text-white/80 placeholder:text-white/28"
                  placeholder="URL da imagem ou caminho /uploads/products/..."
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadError ? (
        <p className="mt-2 text-xs text-red-300">{uploadError}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
            <path d="M10 3v10M6 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 15h14" strokeLinecap="round" />
          </svg>
          {uploading ? "Enviando…" : "Upload de imagem"}
        </button>
        <button
          type="button"
          onClick={addBlank}
          className="rounded-full border border-dashed border-white/22 px-4 py-2 text-sm text-white/60 transition hover:border-white/38 hover:text-white/80"
        >
          + Adicionar por URL
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <p className="mt-2 text-xs text-white/35">JPG, PNG ou WebP · máx 10 MB por arquivo · múltiplos arquivos suportados</p>
    </div>
  );
}

// ─── ApplicationsEditor ───────────────────────────────────────────────────────

function ApplicationsEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div className="mt-1 space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== idx))}
              className="text-white/40 transition hover:text-red-300"
              aria-label={`Remover ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs text-white/35">Nenhuma aplicação adicionada.</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="ex: Eventos, Fachada…"
          className="focus-ring flex-1 rounded-lg border border-white/12 bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/[0.08]"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

// ─── SpecsBlock ───────────────────────────────────────────────────────────────

function SpecsBlock({
  specs,
  onChange,
}: {
  specs: Array<{ label: string; value: string }>;
  onChange: (s: Array<{ label: string; value: string }>) => void;
}) {
  return (
    <div className="mt-4 space-y-2">
      {specs.length === 0 && (
        <p className="text-xs text-white/38">Nenhuma especificação ainda.</p>
      )}
      {specs.map((s, idx) => (
        <div
          key={idx}
          className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={s.label}
            onChange={(e) => {
              const next = [...specs];
              next[idx] = { ...next[idx], label: e.target.value };
              onChange(next);
            }}
            placeholder="Ex: Resolução de impressão"
            className={miniInputCls}
          />
          <input
            value={s.value}
            onChange={(e) => {
              const next = [...specs];
              next[idx] = { ...next[idx], value: e.target.value };
              onChange(next);
            }}
            placeholder="Ex: 1440 dpi"
            className={miniInputCls}
          />
          <button
            type="button"
            className="text-xs text-red-300 transition hover:underline sm:text-right"
            onClick={() => onChange(specs.filter((_, i) => i !== idx))}
          >
            Remover
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-xs font-semibold text-cyan-300 transition hover:underline"
        onClick={() => onChange([...specs, { label: "", value: "" }])}
      >
        + Adicionar especificação
      </button>
    </div>
  );
}

// ─── FormatRow ────────────────────────────────────────────────────────────────

function FormatRow({
  format,
  onChange,
  onRemove,
}: {
  format: ProductFormatOption;
  onChange: (f: ProductFormatOption) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-white/10 bg-black/25 p-3 sm:grid-cols-[1fr_90px_90px_90px_auto] sm:items-center">
      <input
        value={format.label}
        onChange={(e) => onChange({ ...format, label: e.target.value })}
        className={miniInputCls}
        placeholder="Label (ex: 60×90cm)"
      />
      <input
        type="number"
        value={format.width}
        onChange={(e) => onChange({ ...format, width: Math.max(1, Number(e.target.value) || 1) })}
        className={miniInputCls}
        placeholder="Largura"
      />
      <input
        type="number"
        value={format.height}
        onChange={(e) =>
          onChange({ ...format, height: Math.max(1, Number(e.target.value) || 1) })
        }
        className={miniInputCls}
        placeholder="Altura"
      />
      <label className="flex items-center gap-1.5 text-xs text-white/60">
        <input
          type="checkbox"
          checked={Boolean(format.recommended)}
          onChange={(e) => onChange({ ...format, recommended: e.target.checked })}
          className="h-3.5 w-3.5 accent-cyan-400"
        />
        Indicado
      </label>
      <button
        type="button"
        onClick={onRemove}
        className="text-xs font-semibold text-red-300 transition hover:underline sm:text-right"
      >
        Remover
      </button>
    </div>
  );
}

// ─── MaterialBlock ────────────────────────────────────────────────────────────

function MaterialBlock({
  materials,
  onChange,
}: {
  materials: ProductMaterial[];
  onChange: (m: ProductMaterial[]) => void;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/88">Materiais</h3>
      <div className="mt-2 space-y-2">
        {materials.map((row, idx) => (
          <div
            key={idx}
            className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-[1fr_110px_1fr_auto]"
          >
            <input
              value={row.label}
              onChange={(e) => {
                const next = [...materials];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Label (ex: Lona frontlit)"
            />
            <input
              type="number"
              step="0.01"
              value={row.multiplier}
              onChange={(e) => {
                const next = [...materials];
                next[idx] = { ...next[idx], multiplier: Number(e.target.value) || 1 };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Multiplicador"
            />
            <input
              value={row.description}
              onChange={(e) => {
                const next = [...materials];
                next[idx] = { ...next[idx], description: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Descrição"
            />
            <button
              type="button"
              className="text-xs text-red-300 transition hover:underline"
              onClick={() => onChange(materials.filter((_, i) => i !== idx))}
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 transition hover:underline"
          onClick={() => onChange([...materials, { label: "Novo material", multiplier: 1, description: "" }])}
        >
          + Adicionar material
        </button>
      </div>
    </div>
  );
}

// ─── FinishingBlock ───────────────────────────────────────────────────────────

function FinishingBlock({
  finishings,
  onChange,
}: {
  finishings: ProductFinishing[];
  onChange: (f: ProductFinishing[]) => void;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/88">Acabamentos</h3>
      <div className="mt-2 space-y-2">
        {finishings.map((row, idx) => (
          <div
            key={idx}
            className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-[1fr_100px_130px_1fr_auto]"
          >
            <input
              value={row.label}
              onChange={(e) => {
                const next = [...finishings];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Label (ex: Ilhós)"
            />
            <input
              type="number"
              value={row.fee}
              onChange={(e) => {
                const next = [...finishings];
                next[idx] = { ...next[idx], fee: Number(e.target.value) || 0 };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="R$ acréscimo"
            />
            <select
              value={row.type}
              onChange={(e) => {
                const next = [...finishings];
                next[idx] = { ...next[idx], type: e.target.value as ProductFinishing["type"] };
                onChange(next);
              }}
              className={miniInputCls}
            >
              <option value="perOrder">Por pedido</option>
              <option value="perUnit">Por unidade</option>
            </select>
            <input
              value={row.description}
              onChange={(e) => {
                const next = [...finishings];
                next[idx] = { ...next[idx], description: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Descrição"
            />
            <button
              type="button"
              className="text-xs text-red-300 transition hover:underline"
              onClick={() => onChange(finishings.filter((_, i) => i !== idx))}
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 transition hover:underline"
          onClick={() =>
            onChange([...finishings, { label: "Novo acabamento", fee: 0, description: "", type: "perOrder" }])
          }
        >
          + Adicionar acabamento
        </button>
      </div>
    </div>
  );
}

// ─── DeadlineBlock ────────────────────────────────────────────────────────────

function DeadlineBlock({
  deadlines,
  onChange,
}: {
  deadlines: ProductDeadline[];
  onChange: (d: ProductDeadline[]) => void;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/88">Prazos de produção</h3>
      <div className="mt-2 space-y-2">
        {deadlines.map((row, idx) => (
          <div
            key={idx}
            className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-[1fr_80px_110px_auto]"
          >
            <input
              value={row.label}
              onChange={(e) => {
                const next = [...deadlines];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Label (ex: Normal — 4 dias)"
            />
            <input
              type="number"
              value={row.days}
              onChange={(e) => {
                const next = [...deadlines];
                next[idx] = { ...next[idx], days: Math.max(1, Math.round(Number(e.target.value) || 1)) };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Dias"
            />
            <input
              type="number"
              step="0.01"
              value={row.multiplier}
              onChange={(e) => {
                const next = [...deadlines];
                next[idx] = { ...next[idx], multiplier: Number(e.target.value) || 1 };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Multiplicador preço"
            />
            <button
              type="button"
              className="text-xs text-red-300 transition hover:underline"
              onClick={() => onChange(deadlines.filter((_, i) => i !== idx))}
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 transition hover:underline"
          onClick={() => onChange([...deadlines, { label: "Novo prazo", days: 4, multiplier: 1 }])}
        >
          + Adicionar prazo
        </button>
      </div>
    </div>
  );
}

// ─── AddonBlock ───────────────────────────────────────────────────────────────

function AddonBlock({
  addons,
  onChange,
}: {
  addons: ProductAddonService[];
  onChange: (a: ProductAddonService[]) => void;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/88">Extras / serviços adicionais</h3>
      <div className="mt-2 space-y-2">
        {addons.map((a, idx) => (
          <div
            key={a.id}
            className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-[1fr_1fr_110px_90px_auto]"
          >
            <input
              value={a.label}
              onChange={(e) => {
                const next = [...addons];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Label"
            />
            <input
              value={a.description}
              onChange={(e) => {
                const next = [...addons];
                next[idx] = { ...next[idx], description: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Descrição"
            />
            <input
              value={a.priceLabel}
              onChange={(e) => {
                const next = [...addons];
                next[idx] = { ...next[idx], priceLabel: e.target.value };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="Texto preço"
            />
            <input
              type="number"
              value={a.feeBrl}
              onChange={(e) => {
                const next = [...addons];
                next[idx] = { ...next[idx], feeBrl: Number(e.target.value) || 0 };
                onChange(next);
              }}
              className={miniInputCls}
              placeholder="R$"
            />
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-1 text-xs text-white/55">
                <input
                  type="checkbox"
                  checked={Boolean(a.highlighted)}
                  onChange={(e) => {
                    const next = [...addons];
                    next[idx] = { ...next[idx], highlighted: e.target.checked };
                    onChange(next);
                  }}
                  className="h-3.5 w-3.5 accent-cyan-400"
                />
                Destaque
              </label>
              <button
                type="button"
                className="text-xs text-red-300 transition hover:underline"
                onClick={() => onChange(addons.filter((_, i) => i !== idx))}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 transition hover:underline"
          onClick={() =>
            onChange([
              ...addons,
              {
                id: `addon-${Date.now()}`,
                label: "Novo extra",
                description: "",
                priceLabel: "Sob consulta",
                feeBrl: 0,
              },
            ])
          }
        >
          + Adicionar extra
        </button>
      </div>
    </div>
  );
}
