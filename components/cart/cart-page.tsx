"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/common/badge";
import { SectionShell } from "@/components/common/section-shell";
import { buildCartEditUrl, buildCartOrderNotes, resolveProductFromCartItem } from "@/lib/cart";
import { PRISMARQ_CUSTOM_FORMAT_ID } from "@/lib/custom-product-size";
import { pixEconomizePagarNoPixLabel, pixOffNoPixLabel } from "@/lib/copy";
import { applyPixDiscount, PIX_DISCOUNT_PERCENT } from "@/lib/pix-discount";
import { calculateQuoteForProduct } from "@/lib/pricing";
import { buildProductExperience, getAddonsFeeTotalBrl } from "@/lib/product-experience";
import { cn, formatCurrencyBRL, roundTo } from "@/lib/utils";
import type { CartItem, SessionUser } from "@/types";

function CartGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M4.5 5.5h1.4l1.3 8.5a2 2 0 0 0 2 1.7h7.6a2 2 0 0 0 1.9-1.4l1.4-5.8H8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.4" cy="19" r="1.4" fill="currentColor" />
      <circle cx="16.6" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}

function CartStatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="metric-card p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/65">{label}</p>
      <strong className="mt-2 block text-2xl font-semibold tracking-tight text-white">{value}</strong>
      {note ? <p className="mt-1 text-xs leading-5 text-white/70">{note}</p> : null}
    </div>
  );
}

function CartSpecCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="surface-muted p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/65">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-white/88">{value}</p>
    </div>
  );
}

function buildCartCheckoutUrl(item: CartItem) {
  const params = new URLSearchParams();
  params.set("product", item.productSlug);
  params.set("width", String(item.selection.width));
  params.set("height", String(item.selection.height));
  params.set("quantity", String(item.selection.quantity));
  params.set("material", item.selection.material);
  params.set("finishing", item.selection.finishing);
  params.set("deadline", item.selection.deadline);
  params.set("notes", buildCartOrderNotes(item));
  if (item.selection.customSizeUnit) {
    params.set("customSizeUnit", item.selection.customSizeUnit);
  }
  return `/order?${params.toString()}`;
}

export function CartPage({ session }: { session: SessionUser | null }) {
  const router = useRouter();
  const { items, itemCount, subtotal, upsertItem, removeItem, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const pixSubtotal = applyPixDiscount(subtotal);

  function updateQuantity(itemId: string, quantity: number) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    const product = resolveProductFromCartItem(item);
    if (!product) {
      return;
    }

    const nextQuantity = Math.max(Math.round(quantity || 0), product.minQuantity);
    const nextSelection = { ...item.selection, quantity: nextQuantity };

    const experience = buildProductExperience(product);
    const nextQuote = calculateQuoteForProduct(product, {
      width: nextSelection.width,
      height: nextSelection.height,
      quantity: nextSelection.quantity,
      material: nextSelection.material,
      finishing: nextSelection.finishing,
      deadline: nextSelection.deadline,
      addonsTotal: getAddonsFeeTotalBrl(experience, nextSelection),
    });

    upsertItem(
      {
        ...item,
        selection: nextSelection,
        quantity: nextQuantity,
        unitPrice: roundTo(nextQuote.total / nextQuantity),
        totalPrice: nextQuote.total,
        updatedAt: new Date().toISOString(),
      },
      item.id,
    );
  }

  function handleFinalize() {
    if (items.length === 0) {
      setError("Adicione pelo menos um item ao carrinho para finalizar.");
      return;
    }

    const firstItem = items[0];
    if (firstItem) {
      router.push(buildCartCheckoutUrl(firstItem));
      return;
    }

    if (!session) {
      router.push("/cadastro?returnTo=/cart");
      return;
    }

    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        const createdIds: string[] = [];

        const pixNote = `\n\nPagamento: Pix com ${PIX_DISCOUNT_PERCENT}% de desconto`;

        for (const item of items) {
          const product = resolveProductFromCartItem(item);
          if (!product) {
            throw new Error(`Produto nao encontrado: ${item.productName}.`);
          }

          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productSlug: item.productSlug,
              width: item.selection.width,
              height: item.selection.height,
              quantity: item.selection.quantity,
              material: item.selection.material,
              finishing: item.selection.finishing,
              deadline: item.selection.deadline,
              selectedAddonIds: item.selection.selectedAddonIds,
              paymentMethod: "pix",
              notes: `${buildCartOrderNotes(item)}${pixNote}`.trim(),
            }),
          });

          const data = (await response.json()) as {
            message?: string;
            order?: { id: string };
          };

          if (!response.ok || !data.order?.id) {
            throw new Error(data.message ?? "Nao foi possivel finalizar um dos itens do carrinho.");
          }

          createdIds.push(data.order.id);
        }

        let pixUnavailable = false;

        for (const orderId of createdIds) {
          const pixResponse = await fetch("/api/payments/pix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          const pixJson = (await pixResponse.json()) as { available?: boolean; message?: string };
          if (!pixResponse.ok) {
            throw new Error(
              pixJson.message ??
                `Pix nao disponivel para o pedido ${orderId}. Abra o painel ou fale com a Prismarq.`,
            );
          }

          if (!pixJson.available) {
            pixUnavailable = true;
          }
        }

        clearCart();
        const firstId = createdIds[0];
        const mais = createdIds.length - 1;
        const params = new URLSearchParams();
        if (mais > 0) params.set("outros", String(mais));
        if (pixUnavailable) params.set("pix", "unavailable");
        const query = params.toString();
        router.push(`/dashboard/pedidos/${firstId}/pagamento${query ? `?${query}` : ""}`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada ao finalizar o carrinho.");
      }
    });
  }

  const showEmpty = items.length === 0 && !message;

  if (showEmpty) {
    return (
      <SectionShell
        eyebrow="Carrinho"
        title="Seu carrinho esta vazio."
        description="Adicione produtos configurados para fechar varios itens em um unico fluxo."
      >
        <div className="panel relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,181,255,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,46,191,0.1),_transparent_40%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/12 bg-white/[0.06] text-white shadow-[0_14px_32px_rgba(0,0,0,0.35)]">
              <CartGlyph />
            </div>
            <p className="mt-5 text-lg font-semibold text-white">Nenhum item adicionado ainda.</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Volte ao catalogo ou abra um produto para montar a primeira configuracao.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/produtos" className="btn btn-primary focus-ring">
                Ver produtos
              </Link>
              <Link href="/" className="btn btn-secondary focus-ring">
                Voltar para a home
              </Link>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <div className="space-y-4 pb-[7.5rem] sm:space-y-6 lg:pb-0">
      <section className="panel relative overflow-hidden p-4 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,181,255,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(255,46,191,0.09),_transparent_34%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-[0_14px_34px_rgba(15,15,15,0.18)]">
                <CartGlyph />
              </span>
              <p className="label-kicker">Carrinho Prismarq</p>
            </div>
            <h1 className="display-title max-w-3xl text-[clamp(2.4rem,4vw,4.2rem)] font-semibold leading-[0.95] tracking-tight text-balance">
              Revise, ajuste e feche seus pedidos com mais clareza.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
              Cada item mantem sua configuracao, imagem e preco estimado. O fluxo segue pronto para producao,
              com leitura rapida e acabamento comercial.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/produtos" className="btn btn-secondary focus-ring">
                Continuar comprando
              </Link>
              <Link href="/order" className="btn btn-primary focus-ring">
                Pedido unitario
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <CartStatCard label="Itens" value={`${itemCount}`} note="Produtos configurados aguardando fechamento." />
            <CartStatCard label="Subtotal" value={formatCurrencyBRL(subtotal)} note="Soma dos itens ja selecionados." />
            <CartStatCard
              label="Status"
              value={session ? "Pronto" : "Conta necessária"}
              note={session ? "Finalize agora ou continue editando." : "Entre para concluir o pedido."}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <SectionShell
          eyebrow="Itens configurados"
          title="Produtos prontos para fechamento em um unico fluxo."
          description="Cada card organiza visual, medidas, material e extras em uma leitura de compra mais rapida."
          className="xl:col-span-1"
        >
          <div className="space-y-4">
            {items.map((item, index) => {
              const minQuantity = resolveProductFromCartItem(item)?.minQuantity ?? 1;
              const addonCount = item.addons.length;

              return (
                <article
                  key={item.id}
                  className={cn(
                    "overflow-hidden rounded-[34px] border border-white/8 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_56px_rgba(0,0,0,0.35)] transition duration-300",
                    "hover:-translate-y-0.5 hover:border-white/16 hover:shadow-[0_26px_72px_rgba(0,0,0,0.42)]",
                  )}
                >
                  <div className="h-1 bg-gradient-to-r from-cyan via-magenta to-yellow" />
                  <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="relative min-h-[240px] bg-black/[0.03] lg:min-h-full">
                      <Image
                        src={item.image?.trim() ? item.image : "/card.png"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 240px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent" />
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full border border-white/20 bg-white/[0.12] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_10px_24px_rgba(0,0,0,0.3)]">
                          Item {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-ink px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_22px_rgba(15,15,15,0.16)]">
                          {item.selection.quantity} un.
                        </span>
                        <span className="rounded-full bg-white/[0.12] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
                          {formatCurrencyBRL(item.unitPrice)}/un.
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge tone="cyan">{item.productBadge}</Badge>
                            <span className="label-kicker">{item.productCategory}</span>
                          </div>
                          <h2 className="display-title text-[1.65rem] font-semibold leading-[1.05] tracking-tight text-balance sm:text-[1.9rem]">
                            {item.productName}
                          </h2>
                          <p className="max-w-2xl text-sm leading-6 text-white/65">{item.summary}</p>
                        </div>

                        <div className="metric-card px-4 py-3 text-right">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/48">
                            Total do item
                          </p>
                          <strong className="mt-2 block text-2xl font-semibold tracking-tight text-white">
                            {formatCurrencyBRL(item.totalPrice)}
                          </strong>
                          <p className="mt-1 text-xs font-medium text-white/55">{formatCurrencyBRL(item.unitPrice)}/un.</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <CartSpecCard label="Quantidade" value={`${item.selection.quantity} unidades`} />
                        <CartSpecCard
                          label="Medidas"
                          value={
                            item.selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID
                              ? `Tamanho personalizado: ${item.selection.width}x${item.selection.height}cm`
                              : `${item.selection.width} x ${item.selection.height} cm`
                          }
                        />
                        <CartSpecCard label="Material" value={item.selection.material} />
                        <CartSpecCard label="Acabamento" value={item.selection.finishing} />
                      </div>

                      {addonCount > 0 ? (
                        <div className="mt-4 rounded-[26px] border border-cyan/20 bg-cyan/[0.08] p-4">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/50">
                            Servicos adicionais
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.addons.map((addon) => (
                              <span
                                key={addon.id}
                                className="rounded-full border border-cyan/25 bg-white/[0.08] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/75"
                              >
                                {addon.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-end">
                        <label className="space-y-2">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                            Quantidade
                          </span>
                          <input
                            type="number"
                            min={minQuantity}
                            value={item.quantity}
                            onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                            className="focus-ring w-full rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none backdrop-blur-xl shadow-[0_10px_22px_rgba(0,0,0,0.25)] placeholder:text-white/40"
                          />
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                          <Link
                            href={buildCartEditUrl(item)}
                            className="btn btn-secondary focus-ring inline-flex w-full justify-center px-4 py-3 sm:w-auto"
                          >
                            Editar item
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="focus-ring inline-flex w-full items-center justify-center rounded-full border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:-translate-y-0.5 hover:bg-red-500/15 sm:w-auto"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionShell>

        <aside className="panel h-fit p-6 sm:p-8 lg:sticky lg:top-8">
          <p className="label-kicker">Resumo do carrinho</p>
          <h3 className="display-title mt-3 text-[2rem] font-semibold tracking-tight text-white">
            Fechamento claro e pronto para pedido.
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/65">
            O resumo concentra total, Pix, status e o proximo passo para transformar os itens em pedidos reais.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-[30px] border border-white/8 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_22px_48px_rgba(0,0,0,0.3)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/65">Total estimado</p>
              <strong className="mt-2 block text-[2.55rem] font-semibold tracking-tight text-white">
                {formatCurrencyBRL(subtotal)}
              </strong>
              <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="inline-flex rounded-full bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-cyan-500/90 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)]">
                  {pixOffNoPixLabel()}
                </span>
                <p className="text-sm font-semibold tabular-nums text-emerald-200/95">
                  ou {formatCurrencyBRL(pixSubtotal)} no PIX
                </p>
                <p className="text-xs font-medium text-white/55">{pixEconomizePagarNoPixLabel()}</p>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/55">
                Frete e ajustes extras seguem por item gerado no fechamento final.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="surface-card p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/65">Itens</p>
                <strong className="mt-2 block text-2xl font-semibold text-white">{itemCount}</strong>
              </div>
              <div className="surface-card p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/65">Status</p>
                <strong className="mt-2 block text-lg font-semibold text-white">
                  {session ? "Pronto para finalizar" : "Conta para finalizar"}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {["Produção própria", "Suporte comercial", "Checagem antes da produção"].map((item) => (
              <div key={item} className="surface-muted flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-white/82">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden>
                  <path d="m3 8 3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          {message ? (
            <div className="mt-6 rounded-[24px] border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-200">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[24px] border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 hidden flex-col gap-3 lg:flex">
            {session ? (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={isPending}
                className="btn btn-primary focus-ring h-14 justify-center text-base shadow-[0_22px_42px_rgba(15,15,15,0.16)]"
              >
                {isPending ? "Finalizando..." : "Finalizar itens do carrinho"}
              </button>
            ) : (
              <Link href="/cadastro?returnTo=/cart" className="btn btn-primary focus-ring h-14 justify-center text-base">
                Criar conta e finalizar
              </Link>
            )}

            <Link href="/produtos" className="btn btn-secondary focus-ring h-12 justify-center text-sm">
              Continuar comprando
            </Link>

            <button
              type="button"
              onClick={clearCart}
              className="focus-ring inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Limpar carrinho
            </button>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[50] w-full max-w-[100vw] border-t border-white/10 bg-[#05070d]/78 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 shadow-[0_-20px_50px_rgba(0,0,0,0.52)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#05070d]/64 sm:px-4 lg:hidden">
        <div className="mx-auto flex w-full max-w-[1600px] items-end gap-3">
          <div className="min-w-0 shrink">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/45">Total</p>
            <strong className="block text-base font-semibold tabular-nums text-white">{formatCurrencyBRL(subtotal)}</strong>
            <p className="text-[0.72rem] font-medium text-cyan-300">ou {formatCurrencyBRL(pixSubtotal)} no PIX</p>
          </div>
          <div className="min-w-0 flex-1">
            {session ? (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={isPending}
                className="home-btn-gradient focus-ring flex min-h-[52px] w-full items-center justify-center px-4 text-[0.9375rem] font-semibold transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isPending ? "Finalizando..." : "Finalizar carrinho"}
              </button>
            ) : (
              <Link
                href="/cadastro?returnTo=/cart"
                className="home-btn-gradient focus-ring flex min-h-[52px] w-full items-center justify-center px-4 text-[0.9375rem] font-semibold"
              >
                Criar conta e finalizar
              </Link>
            )}
          </div>
        </div>
        <div className="mx-auto mt-2 flex max-w-[1600px] justify-center gap-3 text-[0.72rem] font-semibold">
          <Link href="/produtos" className="text-white/60 underline-offset-2 hover:text-white hover:underline">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
