"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { createDefaultStoreProductPayload } from "@/lib/store-product-defaults";
import type { StoreProductPayload, StoreProductRow } from "@/lib/store-product-payload";
import { formatCurrencyBRL } from "@/lib/utils";
import type { ProductAddonService, ProductFormatOption } from "@/lib/product-experience";
import type { ProductDeadline, ProductFinishing, ProductMaterial } from "@/types";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const accents = ["cyan", "magenta", "yellow"] as const;

type EditorModel = {
  id: string | null;
  slug: string;
  /** Se false, o slug acompanha o nome automaticamente. */
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

export function StoreProductEditor({
  mode,
  initialRow,
}: {
  mode: "create" | "edit";
  initialRow: StoreProductRow | null;
}) {
  const router = useRouter();
  const [model, setModel] = useState<EditorModel>(() => (initialRow ? clonePayload(initialRow) : defaultModel()));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const previewHref = useMemo(() => `/products/${model.slug.trim().toLowerCase()}`, [model.slug]);

  const syncSlugToPayload = useCallback((next: EditorModel): EditorModel => {
    const slug = next.slug.trim().toLowerCase();
    return {
      ...next,
      slug,
      payload: {
        ...next.payload,
        product: { ...next.payload.product, slug },
      },
    };
  }, []);

  function setName(name: string) {
    setModel((m) => {
      const nextSlug = m.slugManual ? m.slug : slugify(name) || m.slug;
      const next: EditorModel = {
        ...m,
        slug: nextSlug,
        payload: { ...m.payload, product: { ...m.payload.product, name } },
      };
      return syncSlugToPayload(next);
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
        const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${model.id}`;
        const method = mode === "create" ? "POST" : "PUT";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { product?: StoreProductRow; message?: string; issues?: unknown };
        if (!res.ok) {
          const msg = data.message ?? "Não foi possível salvar.";
          throw new Error(typeof data.issues === "object" ? `${msg} Verifique os campos obrigatórios.` : msg);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link href="/admin/products" className="text-sm font-semibold text-cyan-300 hover:underline">
          ← Voltar à lista
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => window.open(previewHref, "_blank", "noopener,noreferrer")}
            className="focus-ring rounded-full border border-white/18 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Visualizar produto
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={save}
            className="focus-ring rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(56,189,248,0.22)]"
          >
            Salvar produto
          </button>
        </div>
      </div>

      <div className="min-h-6 text-sm">
        {error ? <p className="text-red-300">{error}</p> : null}
        {message ? <p className="text-emerald-300">{message}</p> : null}
      </div>

      {/* 1. Informações principais */}
      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Informações principais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Nome do produto *</span>
            <input
              value={p.name}
              onChange={(e) => setName(e.target.value)}
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Slug *</span>
            <input
              value={model.slug}
              onChange={(e) => setSlug(e.target.value)}
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 font-mono text-sm text-cyan-100"
            />
            <span className="mt-1 block text-xs text-white/40">Gerado a partir do nome; edite se precisar de URL estável.</span>
          </label>
          <label className="block text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Badge / selo</span>
            <input
              value={p.badge}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: { ...m.payload, product: { ...m.payload.product, badge: e.target.value } },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Categoria *</span>
            <input
              value={p.category}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: { ...m.payload, product: { ...m.payload.product, category: e.target.value } },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="flex items-center gap-3 pt-6 text-sm text-white/80">
            <input
              type="checkbox"
              checked={model.isActive}
              onChange={(e) => setModel((m) => ({ ...m, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-white/30 bg-black/40"
            />
            Ativo na vitrine
          </label>
          <label className="flex items-center gap-3 text-sm text-white/80 sm:col-span-2">
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
              className="h-4 w-4 rounded border-white/30 bg-black/40"
            />
            Destaque na home (ordenação / vitrine)
          </label>
          <label className="block text-sm text-white/70 sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Descrição curta</span>
            <textarea
              rows={3}
              value={p.description}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: { ...m.payload, product: { ...m.payload.product, description: e.target.value } },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70 sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Descrição completa</span>
            <textarea
              rows={5}
              value={meta.descriptionFull}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: { ...m.payload, meta: { ...m.payload.meta, descriptionFull: e.target.value } },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70 sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Lead (comercial)</span>
            <textarea
              rows={2}
              value={p.lead}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: { ...m.payload, product: { ...m.payload.product, lead: e.target.value } },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        </div>
      </section>

      {/* 2. Mídia */}
      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Mídia</h2>
        <p className="mt-1 text-sm text-white/50">
          A primeira imagem é a principal. Use caminhos públicos, ex.:{" "}
          <code className="text-cyan-200">/images/products/nome/arquivo.webp</code> até haver upload no servidor.
        </p>
        <div className="mt-4 space-y-3">
          {exp.gallery.map((g, idx) => (
            <div key={g.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/25 p-3 sm:flex-row sm:items-center">
              <span className="w-8 shrink-0 text-xs text-white/40">{idx + 1}</span>
              <input
                value={g.src}
                onChange={(e) => {
                  const src = e.target.value;
                  setModel((m) => {
                    const gallery = m.payload.experience.gallery.map((item, i) => (i === idx ? { ...item, src } : item));
                    return syncSlugToPayload({ ...m, payload: { ...m.payload, experience: { ...m.payload.experience, gallery } } });
                  });
                }}
                className="focus-ring min-w-0 flex-1 rounded-lg border border-white/12 bg-black/40 px-2 py-1.5 font-mono text-xs text-white"
                placeholder="/images/products/..."
              />
              <div className="flex shrink-0 flex-wrap gap-1">
                <button
                  type="button"
                  className="rounded-lg border border-white/12 px-2 py-1 text-xs text-white/75"
                  disabled={idx === 0}
                  onClick={() =>
                    setModel((m) => {
                      const gallery = [...m.payload.experience.gallery];
                      if (idx <= 0) return m;
                      [gallery[idx - 1], gallery[idx]] = [gallery[idx], gallery[idx - 1]];
                      return syncSlugToPayload({
                        ...m,
                        payload: { ...m.payload, experience: { ...m.payload.experience, gallery } },
                      });
                    })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/12 px-2 py-1 text-xs text-white/75"
                  disabled={idx >= exp.gallery.length - 1}
                  onClick={() =>
                    setModel((m) => {
                      const gallery = [...m.payload.experience.gallery];
                      if (idx >= gallery.length - 1) return m;
                      [gallery[idx + 1], gallery[idx]] = [gallery[idx], gallery[idx + 1]];
                      return syncSlugToPayload({
                        ...m,
                        payload: { ...m.payload, experience: { ...m.payload.experience, gallery } },
                      });
                    })
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-400/30 px-2 py-1 text-xs text-red-200"
                  onClick={() =>
                    setModel((m) => {
                      const gallery = m.payload.experience.gallery.filter((_, i) => i !== idx);
                      return syncSlugToPayload({
                        ...m,
                        payload: { ...m.payload, experience: { ...m.payload.experience, gallery } },
                      });
                    })
                  }
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="rounded-full border border-dashed border-white/20 px-4 py-2 text-sm text-white/70"
            onClick={() =>
              setModel((m) => {
                const i = m.payload.experience.gallery.length;
                const g = {
                  id: `${m.slug}-img-${Date.now()}`,
                  title: m.payload.product.name,
                  subtitle: "",
                  accent: accents[i % 3],
                  src: "/images/products/exemplo.webp",
                };
                return syncSlugToPayload({
                  ...m,
                  payload: {
                    ...m.payload,
                    experience: { ...m.payload.experience, gallery: [...m.payload.experience.gallery, g] },
                  },
                });
              })
            }
          >
            + Adicionar imagem (caminho)
          </button>
        </div>
      </section>

      {/* 3. Preço */}
      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Preço</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Preço base (R$/m²) *</span>
            <input
              type="number"
              step="0.01"
              min={0.01}
              value={p.basePriceM2}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: {
                      ...m.payload,
                      product: { ...m.payload.product, basePriceM2: Number(e.target.value) || 0 },
                    },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
            <span className="mt-1 block text-xs text-white/40">Cotação atual usa m²; unidade/pacote ficam registrados para evolução futura.</span>
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Unidade de cálculo (registro)</span>
            <select
              value={meta.pricingUnit}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: {
                      ...m.payload,
                      meta: { ...m.payload.meta, pricingUnit: e.target.value as typeof meta.pricingUnit },
                    },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            >
              <option value="m2">m²</option>
              <option value="unit">Unidade</option>
              <option value="package">Pacote</option>
            </select>
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Área mínima cobrada (m²)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={p.minimumArea}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: {
                      ...m.payload,
                      product: { ...m.payload.product, minimumArea: Number(e.target.value) || 0 },
                    },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Valor mínimo do pedido (R$)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={meta.minimumOrderValue ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: {
                      ...m.payload,
                      meta: { ...m.payload.meta, minimumOrderValue: v === "" ? null : Number(v) },
                    },
                  }),
                );
              }}
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
              placeholder="Opcional"
            />
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Quantidade mínima *</span>
            <input
              type="number"
              min={1}
              step={1}
              value={p.minQuantity}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({
                    ...m,
                    payload: {
                      ...m.payload,
                      product: { ...m.payload.product, minQuantity: Math.max(1, Math.round(Number(e.target.value) || 1)) },
                    },
                  }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        </div>
      </section>

      {/* 4. Tamanhos */}
      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Tamanhos</h2>
        <label className="mt-3 flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={meta.allowCustomSize}
            onChange={(e) =>
              setModel((m) =>
                syncSlugToPayload({
                  ...m,
                  payload: { ...m.payload, meta: { ...m.payload.meta, allowCustomSize: e.target.checked } },
                }),
              )
            }
            className="h-4 w-4 rounded border-white/30 bg-black/40"
          />
          Permitir tamanho personalizado no configurador
        </label>
        {meta.allowCustomSize ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/70">
              <span className="mb-1 block text-xs text-white/45">Largura mínima (cm)</span>
              <input
                type="number"
                min={1}
                value={meta.customMinWidthCm ?? ""}
                onChange={(e) =>
                  setModel((m) =>
                    syncSlugToPayload({
                      ...m,
                      payload: {
                        ...m.payload,
                        meta: { ...m.payload.meta, customMinWidthCm: Number(e.target.value) || null },
                      },
                    }),
                  )
                }
                className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-white/70">
              <span className="mb-1 block text-xs text-white/45">Altura mínima (cm)</span>
              <input
                type="number"
                min={1}
                value={meta.customMinHeightCm ?? ""}
                onChange={(e) =>
                  setModel((m) =>
                    syncSlugToPayload({
                      ...m,
                      payload: {
                        ...m.payload,
                        meta: { ...m.payload.meta, customMinHeightCm: Number(e.target.value) || null },
                      },
                    }),
                  )
                }
                className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
              />
            </label>
          </div>
        ) : null}
        <div className="mt-4 space-y-3">
          {exp.formats.map((f, idx) => (
            <FormatRow
              key={f.id}
              format={f}
              onChange={(next) =>
                setModel((m) => {
                  const formats = m.payload.experience.formats.map((x, i) => (i === idx ? next : x));
                  return syncSlugToPayload({ ...m, payload: { ...m.payload, experience: { ...m.payload.experience, formats } } });
                })
              }
              onRemove={() =>
                setModel((m) => {
                  const formats = m.payload.experience.formats.filter((_, i) => i !== idx);
                  return syncSlugToPayload({ ...m, payload: { ...m.payload, experience: { ...m.payload.experience, formats } } });
                })
              }
            />
          ))}
          <button
            type="button"
            className="rounded-full border border-dashed border-white/20 px-4 py-2 text-sm text-white/70"
            onClick={() =>
              setModel((m) => {
                const n = m.payload.experience.formats.length + 1;
                const f: ProductFormatOption = {
                  id: `fmt-${Date.now()}`,
                  label: `Formato ${n}`,
                  description: "",
                  width: 100,
                  height: 100,
                };
                return syncSlugToPayload({
                  ...m,
                  payload: {
                    ...m.payload,
                    experience: { ...m.payload.experience, formats: [...m.payload.experience.formats, f] },
                  },
                });
              })
            }
          >
            + Adicionar tamanho
          </button>
        </div>
      </section>

      {/* 5. Opções */}
      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Opções do produto</h2>
        <p className="mt-1 text-sm text-white/50">Materiais, acabamentos e prazos alimentam o configurador. Extras usam a lista de serviços (addons).</p>
        <MaterialBlock
          materials={p.materials}
          onChange={(materials) =>
            setModel((m) => syncSlugToPayload({ ...m, payload: { ...m.payload, product: { ...m.payload.product, materials } } }))
          }
        />
        <FinishingBlock
          finishings={p.finishings}
          onChange={(finishings) =>
            setModel((m) => syncSlugToPayload({ ...m, payload: { ...m.payload, product: { ...m.payload.product, finishings } } }))
          }
        />
        <DeadlineBlock
          deadlines={p.deadlines}
          onChange={(deadlines) =>
            setModel((m) => syncSlugToPayload({ ...m, payload: { ...m.payload, product: { ...m.payload.product, deadlines } } }))
          }
        />
        <AddonBlock
          addons={exp.addons}
          onChange={(addons) =>
            setModel((m) => syncSlugToPayload({ ...m, payload: { ...m.payload, experience: { ...m.payload.experience, addons } } }))
          }
        />
      </section>

      {/* 6. SEO */}
      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">SEO e textos comerciais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-white/70 sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Título SEO</span>
            <input
              value={meta.seoTitle}
              onChange={(e) =>
                setModel((m) => syncSlugToPayload({ ...m, payload: { ...m.payload, meta: { ...m.payload.meta, seoTitle: e.target.value } } }))
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-white/70 sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Descrição SEO</span>
            <textarea
              rows={3}
              value={meta.seoDescription}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({ ...m, payload: { ...m.payload, meta: { ...m.payload.meta, seoDescription: e.target.value } } }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Headline comercial</span>
            <input
              value={meta.headline}
              onChange={(e) =>
                setModel((m) => syncSlugToPayload({ ...m, payload: { ...m.payload, meta: { ...m.payload.meta, headline: e.target.value } } }))
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Subheadline</span>
            <input
              value={meta.subheadline}
              onChange={(e) =>
                setModel((m) =>
                  syncSlugToPayload({ ...m, payload: { ...m.payload, meta: { ...m.payload.meta, subheadline: e.target.value } } }),
                )
              }
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-white/70 sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Tags de uso (vírgula)</span>
            <input
              value={meta.usageTags.join(", ")}
              onChange={(e) => {
                const usageTags = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                setModel((m) => syncSlugToPayload({ ...m, payload: { ...m.payload, meta: { ...m.payload.meta, usageTags } } }));
              }}
              className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
              placeholder="loja, evento, fachada…"
            />
          </label>
        </div>
      </section>

      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-xs text-white/50">
        Referência rápida: preço exibido no admin{" "}
        <span className="font-semibold text-white/70">{formatCurrencyBRL(p.basePriceM2)}/m²</span> · mín. área {p.minimumArea} m² · qtd. mín.{" "}
        {p.minQuantity}
      </div>
    </div>
  );
}

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
    <div className="grid gap-2 rounded-xl border border-white/10 bg-black/25 p-3 sm:grid-cols-[1fr_100px_100px_auto] sm:items-center">
      <input
        value={format.label}
        onChange={(e) => onChange({ ...format, label: e.target.value })}
        className="focus-ring rounded-lg border border-white/12 bg-black/40 px-2 py-1.5 text-sm text-white"
        placeholder="Label"
      />
      <input
        type="number"
        value={format.width}
        onChange={(e) => onChange({ ...format, width: Math.max(1, Number(e.target.value) || 1) })}
        className="focus-ring rounded-lg border border-white/12 bg-black/40 px-2 py-1.5 text-sm text-white"
        placeholder="Largura cm"
      />
      <input
        type="number"
        value={format.height}
        onChange={(e) => onChange({ ...format, height: Math.max(1, Number(e.target.value) || 1) })}
        className="focus-ring rounded-lg border border-white/12 bg-black/40 px-2 py-1.5 text-sm text-white"
        placeholder="Altura cm"
      />
      <button type="button" onClick={onRemove} className="text-xs font-semibold text-red-300 hover:underline sm:text-right">
        Remover
      </button>
    </div>
  );
}

function MaterialBlock({ materials, onChange }: { materials: ProductMaterial[]; onChange: (m: ProductMaterial[]) => void }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/90">Materiais</h3>
      <div className="mt-2 space-y-2">
        {materials.map((row, idx) => (
          <div key={idx} className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={row.label}
              onChange={(e) => {
                const next = [...materials];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Label"
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
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Multiplicador de preço"
            />
            <input
              value={row.description}
              onChange={(e) => {
                const next = [...materials];
                next[idx] = { ...next[idx], description: e.target.value };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white sm:col-span-2 lg:col-span-2"
              placeholder="Descrição / value"
            />
            <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => onChange(materials.filter((_, i) => i !== idx))}>
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 hover:underline"
          onClick={() => onChange([...materials, { label: "Novo material", multiplier: 1, description: "" }])}
        >
          + Adicionar material
        </button>
      </div>
    </div>
  );
}

function FinishingBlock({ finishings, onChange }: { finishings: ProductFinishing[]; onChange: (f: ProductFinishing[]) => void }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/90">Acabamentos</h3>
      <div className="mt-2 space-y-2">
        {finishings.map((row, idx) => (
          <div key={idx} className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-2 lg:grid-cols-5">
            <input
              value={row.label}
              onChange={(e) => {
                const next = [...finishings];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Label"
            />
            <input
              type="number"
              value={row.fee}
              onChange={(e) => {
                const next = [...finishings];
                next[idx] = { ...next[idx], fee: Number(e.target.value) || 0 };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Acréscimo fixo R$"
            />
            <select
              value={row.type}
              onChange={(e) => {
                const next = [...finishings];
                next[idx] = { ...next[idx], type: e.target.value as ProductFinishing["type"] };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
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
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Descrição"
            />
            <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => onChange(finishings.filter((_, i) => i !== idx))}>
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 hover:underline"
          onClick={() => onChange([...finishings, { label: "Novo acabamento", fee: 0, description: "", type: "perOrder" }])}
        >
          + Adicionar acabamento
        </button>
      </div>
    </div>
  );
}

function DeadlineBlock({ deadlines, onChange }: { deadlines: ProductDeadline[]; onChange: (d: ProductDeadline[]) => void }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/90">Prazos</h3>
      <div className="mt-2 space-y-2">
        {deadlines.map((row, idx) => (
          <div key={idx} className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={row.label}
              onChange={(e) => {
                const next = [...deadlines];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Label"
            />
            <input
              type="number"
              value={row.days}
              onChange={(e) => {
                const next = [...deadlines];
                next[idx] = { ...next[idx], days: Math.max(1, Math.round(Number(e.target.value) || 1)) };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
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
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Multiplicador"
            />
            <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => onChange(deadlines.filter((_, i) => i !== idx))}>
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 hover:underline"
          onClick={() => onChange([...deadlines, { label: "Novo prazo", days: 4, multiplier: 1 }])}
        >
          + Adicionar prazo
        </button>
      </div>
    </div>
  );
}

function AddonBlock({ addons, onChange }: { addons: ProductAddonService[]; onChange: (a: ProductAddonService[]) => void }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white/90">Extras / addons</h3>
      <div className="mt-2 space-y-2">
        {addons.map((a, idx) => (
          <div key={a.id} className="grid gap-2 rounded-lg border border-white/8 bg-black/20 p-2 sm:grid-cols-2 lg:grid-cols-5">
            <input
              value={a.label}
              onChange={(e) => {
                const next = [...addons];
                next[idx] = { ...next[idx], label: e.target.value };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Label"
            />
            <input
              value={a.description}
              onChange={(e) => {
                const next = [...addons];
                next[idx] = { ...next[idx], description: e.target.value };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="Value / descrição"
            />
            <input
              value={a.priceLabel}
              onChange={(e) => {
                const next = [...addons];
                next[idx] = { ...next[idx], priceLabel: e.target.value };
                onChange(next);
              }}
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
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
              className="focus-ring rounded border border-white/10 bg-black/35 px-2 py-1 text-sm text-white"
              placeholder="R$ fixo"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={Boolean(a.highlighted)}
                  onChange={(e) => {
                    const next = [...addons];
                    next[idx] = { ...next[idx], highlighted: e.target.checked };
                    onChange(next);
                  }}
                />
                Destaque
              </label>
              <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => onChange(addons.filter((_, i) => i !== idx))}>
                Remover
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-cyan-300 hover:underline"
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
