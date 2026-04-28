"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/common/badge";
import { SectionShell } from "@/components/common/section-shell";
import { buildCartEditUrl, buildCartOrderNotes } from "@/lib/cart";
import { getProductBySlug } from "@/lib/catalog";
import { calculateQuote } from "@/lib/pricing";
import { buildProductExperience, getAddonsFeeTotalBrl } from "@/lib/product-experience";
import { cn, formatCurrencyBRL, roundTo } from "@/lib/utils";
import type { SessionUser } from "@/types";

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
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/48">{label}</p>
      <strong className="mt-2 block text-2xl font-semibold tracking-tight text-ink">{value}</strong>
      {note ? <p className="mt-1 text-xs leading-5 text-black/52">{note}</p> : null}
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
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-black/46">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-black/80">{value}</p>
    </div>
  );
}

export function CartPage({ session }: { session: SessionUser | null }) {
  const router = useRouter();
  const { items, itemCount, subtotal, upsertItem, removeItem, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdOrders, setCreatedOrders] = useState<string[]>([]);
  const pixSubtotal = subtotal * 0.85;

  function updateQuantity(itemId: string, quantity: number) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    const product = getProductBySlug(item.productSlug);
    if (!product) {
      return;
    }

    const nextQuantity = Math.max(Math.round(quantity || 0), product.minQuantity);
    const nextSelection = { ...item.selection, quantity: nextQuantity };

    const experience = buildProductExperience(product);
    const nextQuote = calculateQuote({
      productSlug: item.productSlug,
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
    if (!session) {
      router.push("/login?returnTo=/cart");
      return;
    }

    if (items.length === 0) {
      setError("Adicione pelo menos um item ao carrinho para finalizar.");
      return;
    }

    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        const createdIds: string[] = [];

        for (const item of items) {
          const product = getProductBySlug(item.productSlug);
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
              notes: buildCartOrderNotes(item),
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

        clearCart();
        setCreatedOrders(createdIds);
        setMessage(`Pedido enviado com ${createdIds.length} item(ns).`);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada ao finalizar o carrinho.");
      }
    });
  }

  const showEmpty = items.length === 0 && createdOrders.length === 0 && !message;
  const showSuccess = items.length === 0 && createdOrders.length > 0;

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
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-black/10 bg-white shadow-[0_14px_32px_rgba(15,15,15,0.08)]">
              <CartGlyph />
            </div>
            <p className="mt-5 text-lg font-semibold text-ink">Nenhum item adicionado ainda.</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-black/64">
              Volte ao catalogo ou abra um produto para montar a primeira configuracao.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/products" className="btn btn-primary focus-ring">
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

  if (showSuccess) {
    return (
      <SectionShell
        eyebrow="Carrinho"
        title="Pedido enviado com sucesso."
        description={message || "Os itens foram gerados e encaminhados para a producao."}
      >
        <div className="panel relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,181,255,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,46,191,0.12),_transparent_35%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-[0_14px_32px_rgba(15,15,15,0.18)]">
                  <CartGlyph />
                </span>
                <div>
                  <p className="label-kicker">Resumo final</p>
                  <p className="mt-1 text-lg font-semibold text-ink">
                    {createdOrders.length} pedido(s) criado(s) com sucesso.
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-black/64">
                Os itens foram enviados com a configuracao atual preservada. Voce pode acompanhar tudo no painel
                do cliente.
              </p>
            </div>
            <div className="surface-card p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/48">Status</p>
              <strong className="mt-3 block text-2xl font-semibold text-ink">Pronto para acompanhamento</strong>
              <p className="mt-2 text-sm leading-6 text-black/60">
                A producao ja recebeu a sequencia de pedidos gerados.
              </p>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn btn-primary focus-ring">
              Ver painel
            </Link>
            <Link href="/products" className="btn btn-secondary focus-ring">
              Continuar comprando
            </Link>
            <button
              type="button"
              onClick={() => {
                setMessage("");
                setCreatedOrders([]);
              }}
              className="btn btn-ghost focus-ring border border-black/10 bg-white px-4 py-2"
            >
              Fechar mensagem
            </button>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
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
            <p className="max-w-2xl text-base leading-7 text-black/66 sm:text-lg">
              Cada item mantem sua configuracao, imagem e preco estimado. O fluxo segue pronto para producao,
              com leitura rapida e acabamento comercial.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/products" className="btn btn-secondary focus-ring">
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
              value={session ? "Pronto" : "Login necessario"}
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
              const minQuantity = getProductBySlug(item.productSlug)?.minQuantity ?? 1;
              const addonCount = item.addons.length;

              return (
                <article
                  key={item.id}
                  className={cn(
                    "overflow-hidden rounded-[34px] border border-black/10 bg-white shadow-[0_20px_56px_rgba(15,15,15,0.07)] transition duration-300",
                    "hover:-translate-y-0.5 hover:shadow-[0_26px_72px_rgba(15,15,15,0.1)]",
                  )}
                >
                  <div className="h-1 bg-gradient-to-r from-cyan via-magenta to-yellow" />
                  <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="relative min-h-[240px] bg-black/[0.03] lg:min-h-full">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 240px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent" />
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full border border-white/18 bg-white/92 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink shadow-[0_10px_24px_rgba(15,15,15,0.12)]">
                          Item {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-ink px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_22px_rgba(15,15,15,0.16)]">
                          {item.selection.quantity} un.
                        </span>
                        <span className="rounded-full bg-white/92 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink shadow-[0_10px_22px_rgba(15,15,15,0.12)]">
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
                          <p className="max-w-2xl text-sm leading-6 text-black/62">{item.summary}</p>
                        </div>

                        <div className="metric-card px-4 py-3 text-right">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/46">
                            Total do item
                          </p>
                          <strong className="mt-2 block text-2xl font-semibold tracking-tight text-ink">
                            {formatCurrencyBRL(item.totalPrice)}
                          </strong>
                          <p className="mt-1 text-xs font-medium text-black/52">{formatCurrencyBRL(item.unitPrice)}/un.</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <CartSpecCard label="Quantidade" value={`${item.selection.quantity} unidades`} />
                        <CartSpecCard label="Medidas" value={`${item.selection.width} x ${item.selection.height} cm`} />
                        <CartSpecCard label="Material" value={item.selection.material} />
                        <CartSpecCard label="Acabamento" value={item.selection.finishing} />
                      </div>

                      {addonCount > 0 ? (
                        <div className="mt-4 rounded-[26px] border border-cyan/12 bg-cyan/6 p-4">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-black/46">
                            Servicos adicionais
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.addons.map((addon) => (
                              <span
                                key={addon.id}
                                className="rounded-full border border-cyan/18 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/68"
                              >
                                {addon.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-end">
                        <label className="space-y-2">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/48">
                            Quantidade
                          </span>
                          <input
                            type="number"
                            min={minQuantity}
                            value={item.quantity}
                            onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                            className="focus-ring w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none shadow-[0_10px_22px_rgba(15,15,15,0.04)]"
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
                            className="focus-ring inline-flex w-full items-center justify-center rounded-full border border-red-500/15 bg-red-500/6 px-4 py-3 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-500/10 sm:w-auto"
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
          <h3 className="display-title mt-3 text-[2rem] font-semibold tracking-tight text-ink">
            Fechamento claro e pronto para pedido.
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/62">
            O resumo concentra total, Pix, status e o proximo passo para transformar os itens em pedidos reais.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(246,247,249,0.94))] p-5 shadow-[0_22px_48px_rgba(15,15,15,0.06)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/44">Total estimado</p>
              <strong className="mt-2 block text-[2.55rem] font-semibold tracking-tight text-ink">
                {formatCurrencyBRL(subtotal)}
              </strong>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,15,15,0.14)]">
                  {formatCurrencyBRL(pixSubtotal)} no Pix
                </span>
                <span className="text-sm font-medium text-black/54">15% OFF no Pix</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-black/52">
                Frete e ajustes extras seguem por item gerado no fechamento final.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="surface-card p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/45">Itens</p>
                <strong className="mt-2 block text-2xl font-semibold text-ink">{itemCount}</strong>
              </div>
              <div className="surface-card p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/45">Status</p>
                <strong className="mt-2 block text-lg font-semibold text-ink">
                  {session ? "Pronto para finalizar" : "Login necessario"}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {["Producao propria", "Suporte comercial", "Checagem antes da producao"].map((item) => (
              <div key={item} className="surface-muted px-4 py-3 text-sm font-medium text-black/70">
                {item}
              </div>
            ))}
          </div>

          {message ? (
            <div className="mt-6 rounded-[24px] border border-emerald-500/18 bg-emerald-500/8 p-4 text-sm leading-6 text-emerald-700">
              {message}
              {createdOrders.length > 0 ? (
                <div className="mt-3">
                  <Link href="/dashboard" className="btn btn-primary focus-ring inline-flex px-4 py-2">
                    Acompanhar no painel
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[24px] border border-red-500/18 bg-red-500/8 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
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
              <Link href="/login?returnTo=/cart" className="btn btn-primary focus-ring h-14 justify-center text-base">
                Entrar para finalizar itens
              </Link>
            )}

            <Link href="/products" className="btn btn-secondary focus-ring h-12 justify-center text-sm">
              Continuar comprando
            </Link>

            <button
              type="button"
              onClick={clearCart}
              className="focus-ring inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-black/[0.03]"
            >
              Limpar carrinho
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
