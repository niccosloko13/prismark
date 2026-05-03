"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/common/badge";
import {
  friendlyFinishingLabel,
  inferOptionBadge,
  materialChoiceHint,
} from "@/lib/product-display-labels";
import type { CustomSizePolicy } from "@/lib/custom-product-size";
import { PRISMARQ_CUSTOM_FORMAT_ID } from "@/lib/custom-product-size";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

import { ProductAddonStrip } from "./product-addon-strip";

type StepDef = {
  id: "size" | "material" | "finish" | "production" | "extras";
  title: string;
  subtitle: string;
  optional?: boolean;
};

function OptionCard({
  selected,
  onClick,
  title,
  description,
  badge,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  badge?: string | null;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring flex min-h-[3.25rem] w-full flex-col items-start gap-1 rounded-[18px] border px-3.5 py-3 text-left transition duration-200 sm:min-h-0 sm:px-4 sm:py-3.5",
        selected
          ? "border-transparent bg-gradient-to-r from-pink-500/90 via-purple-500/90 to-cyan-400/90 text-white shadow-[0_10px_32px_rgba(168,85,247,0.35),0_0_24px_rgba(56,189,248,0.18)] ring-1 ring-white/20"
          : "border-white/10 bg-white/[0.04] text-white/88 hover:border-white/18 hover:bg-white/[0.07]",
        className,
      )}
    >
      <span className="flex w-full flex-wrap items-center gap-2">
        <span className="text-sm font-semibold leading-snug">{title}</span>
        {badge ? (
          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/90">
            {badge}
          </span>
        ) : null}
      </span>
      {description ? <span className="text-[0.78rem] leading-relaxed text-white/70">{description}</span> : null}
    </button>
  );
}

function buildSteps(product: Product, experience: ProductExperience, customSizePolicy: CustomSizePolicy | null): StepDef[] {
  const steps: StepDef[] = [];
  const showSize =
    experience.formats.length > 1 || experience.models.length > 1 || Boolean(customSizePolicy);
  if (showSize) {
    steps.push({
      id: "size",
      title: "Escolha o tamanho",
      subtitle: "Formato e medidas ideais para o seu uso.",
    });
  }
  if (product.materials.length > 1) {
    steps.push({
      id: "material",
      title: "Escolha o material",
      subtitle: "Selecione a mídia que melhor combina com sua aplicação.",
    });
  }
  const showFinish =
    experience.colors.length > 1 || experience.enhancements.length > 1 || product.finishings.length > 1;
  if (showFinish) {
    steps.push({
      id: "finish",
      title: "Acabamento e impressão",
      subtitle: "Cor, enobrecimento e acabamento final.",
    });
  }
  steps.push({
    id: "production",
    title: "Prazo e quantidade",
    subtitle: "Defina tiragem e urgência de produção.",
  });
  if (experience.addons.length > 0) {
    steps.push({
      id: "extras",
      title: "Extras opcionais",
      subtitle: "Serviços adicionais para facilitar sua entrega.",
      optional: true,
    });
  }
  return steps;
}

export function ProductStepConfigurator({
  product,
  experience,
  selection,
  onModelChange,
  onFormatChange,
  onMaterialChange,
  onColorChange,
  onEnhancementChange,
  onFinishingChange,
  onDeadlineChange,
  onQuantityChange,
  onToggleAddon,
  onCheckoutUnlocked,
  customSizePolicy,
  onCustomDimensionsChange,
}: {
  product: Product;
  experience: ProductExperience;
  selection: ProductSelectionState;
  /** Só preenchido para produtos `store_products` com `meta.allowCustomSize`. */
  customSizePolicy?: CustomSizePolicy | null;
  onCustomDimensionsChange?: (widthCm: number, heightCm: number) => void;
  onModelChange: (modelId: string) => void;
  onFormatChange: (formatId: string) => void;
  onMaterialChange: (material: string) => void;
  onColorChange: (colorId: string) => void;
  onEnhancementChange: (enhancementId: string) => void;
  onFinishingChange: (finishing: string) => void;
  onDeadlineChange: (deadline: string) => void;
  onQuantityChange: (quantity: number) => void;
  onToggleAddon: (addonId: string) => void;
  onCheckoutUnlocked: (unlocked: boolean) => void;
}) {
  const steps = useMemo(
    () => buildSteps(product, experience, customSizePolicy ?? null),
    [product, experience, customSizePolicy],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [unlockedStepIndex, setUnlockedStepIndex] = useState(0);

  const lastRequiredIndex = useMemo(() => {
    let idx = steps.length - 1;
    while (idx >= 0 && steps[idx]?.optional) idx--;
    return Math.max(0, idx);
  }, [steps]);

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(i, Math.max(steps.length - 1, 0))),
    [steps.length],
  );

  useEffect(() => {
    setActiveIndex(0);
    setUnlockedStepIndex(0);
    onCheckoutUnlocked(false);
  }, [product.slug, onCheckoutUnlocked]);

  const goPrev = () => setActiveIndex((i) => clampIndex(i - 1));

  const skipExtras = () => {
    onCheckoutUnlocked(true);
    document.getElementById("order-summary-bar")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const isLast = steps.length > 0 && activeIndex >= steps.length - 1;

  const handlePrimary = () => {
    if (steps.length === 0) {
      onCheckoutUnlocked(true);
      return;
    }
    if (isLast) {
      onCheckoutUnlocked(true);
      document.getElementById("order-summary-bar")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (activeIndex === lastRequiredIndex) {
      onCheckoutUnlocked(true);
    }
    setUnlockedStepIndex((u) => Math.max(u, activeIndex + 1));
    setActiveIndex((i) => clampIndex(i + 1));
  };

  const stepMeta = steps[activeIndex];
  const quantityMin = product.minQuantity;
  const clampQty = (n: number) => Math.max(quantityMin, Math.round(n) || quantityMin);

  const stepper = (
    <div className="max-w-full overflow-x-auto overflow-y-visible pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ol className="flex w-max min-w-0 gap-2 sm:gap-3">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          const reachable = i <= unlockedStepIndex;
          return (
            <li key={s.id} className="min-w-0 max-w-[min(100vw-2.5rem,10.5rem)] shrink-0 sm:max-w-[12rem]">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => {
                  if (reachable) setActiveIndex(i);
                }}
                className={cn(
                  "focus-ring flex w-full max-w-full flex-col rounded-2xl border px-3 py-2 text-left transition sm:px-3.5",
                  current
                    ? "border-cyan-400/45 bg-cyan-500/15 shadow-[0_0_24px_rgba(56,189,248,0.2)]"
                    : done
                      ? "border-white/12 bg-white/[0.05] text-white/75 hover:border-white/20"
                      : "border-white/8 bg-white/[0.02] text-white/45 hover:border-white/14",
                  !reachable && "cursor-not-allowed opacity-45",
                )}
              >
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-0.5 line-clamp-2 text-[0.72rem] font-semibold leading-tight text-white sm:text-[0.78rem]">
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );

  let body: ReactNode = null;
  if (stepMeta) {
    switch (stepMeta.id) {
      case "size":
        body = (
          <div className="grid gap-3">
            {experience.models.length > 1 ? (
              <div className="space-y-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">Modelo</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {experience.models.map((m) => (
                    <OptionCard
                      key={m.id}
                      selected={selection.modelId === m.id}
                      onClick={() => onModelChange(m.id)}
                      title={m.label}
                      description={m.description}
                      badge={m.recommended ? "Mais vendido" : inferOptionBadge(m.label)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">Formato</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {experience.formats.map((f) => (
                  <OptionCard
                    key={f.id}
                    selected={selection.formatId === f.id}
                    onClick={() => onFormatChange(f.id)}
                    title={`${f.label} · ${f.width}×${f.height} cm`}
                    description={f.description}
                    badge={f.recommended ? "Melhor custo-benefício" : inferOptionBadge(f.label)}
                  />
                ))}
                {customSizePolicy && onCustomDimensionsChange ? (
                  <>
                    <OptionCard
                      selected={selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID}
                      onClick={() => onFormatChange(PRISMARQ_CUSTOM_FORMAT_ID)}
                      title="Tamanho personalizado"
                      description="Informe largura e altura em centímetros."
                      badge="Sob medida"
                    />
                    {selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID ? (
                      <div className="sm:col-span-2">
                        <div className="grid gap-3 rounded-[18px] border border-cyan-400/25 bg-black/25 p-3 sm:grid-cols-2">
                          <label className="block text-sm text-white/75">
                            <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                              Largura (cm) · mín. {customSizePolicy.minWidthCm}
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min={customSizePolicy.minWidthCm}
                              step={1}
                              value={Number.isFinite(selection.width) ? selection.width : ""}
                              onChange={(e) => {
                                const raw = Number(e.target.value.replace(",", "."));
                                onCustomDimensionsChange(
                                  Number.isFinite(raw) ? raw : selection.width,
                                  selection.height,
                                );
                              }}
                              className="field mt-1 h-11 w-full rounded-xl border-white/12 bg-white/[0.06] px-3 text-sm font-semibold text-white"
                            />
                          </label>
                          <label className="block text-sm text-white/75">
                            <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                              Altura (cm) · mín. {customSizePolicy.minHeightCm}
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min={customSizePolicy.minHeightCm}
                              step={1}
                              value={Number.isFinite(selection.height) ? selection.height : ""}
                              onChange={(e) => {
                                const raw = Number(e.target.value.replace(",", "."));
                                onCustomDimensionsChange(
                                  selection.width,
                                  Number.isFinite(raw) ? raw : selection.height,
                                );
                              }}
                              className="field mt-1 h-11 w-full rounded-xl border-white/12 bg-white/[0.06] px-3 text-sm font-semibold text-white"
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        );
        break;
      case "material":
        body = (
          <div className="grid gap-2 sm:grid-cols-2">
            {product.materials.map((mat) => (
              <OptionCard
                key={mat.label}
                selected={selection.material === mat.label}
                onClick={() => onMaterialChange(mat.label)}
                title={mat.label}
                description={materialChoiceHint(mat.label) ?? mat.description}
                badge={inferOptionBadge(mat.label)}
              />
            ))}
          </div>
        );
        break;
      case "finish":
        body = (
          <div className="space-y-5">
            {experience.colors.length > 1 ? (
              <div className="space-y-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">Cor</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {experience.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onColorChange(c.id)}
                      className={cn(
                        "focus-ring flex items-start gap-2 rounded-[18px] border px-3.5 py-3 text-left transition sm:items-center",
                        selection.colorId === c.id
                          ? "border-transparent bg-gradient-to-r from-pink-500/90 via-purple-500/90 to-cyan-400/90 text-white ring-1 ring-white/20"
                          : "border-white/10 bg-white/[0.04] hover:border-white/18",
                      )}
                    >
                      <span
                        className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-white/25 sm:mt-0"
                        style={{ background: c.swatch }}
                      />
                      <span>
                        <span className="block text-sm font-semibold">{c.label}</span>
                        <span className="mt-0.5 block text-[0.78rem] text-white/65">{c.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {experience.enhancements.length > 1 ? (
              <div className="space-y-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">Enobrecimento</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {experience.enhancements.map((e) => (
                    <OptionCard
                      key={e.id}
                      selected={selection.enhancementId === e.id}
                      onClick={() => onEnhancementChange(e.id)}
                      title={e.label}
                      description={`${e.description} · ${e.priceLabel}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {product.finishings.length > 1 ? (
              <div className="space-y-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">Acabamento</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.finishings.map((f) => (
                    <OptionCard
                      key={f.label}
                      selected={selection.finishing === f.label}
                      onClick={() => onFinishingChange(f.label)}
                      title={friendlyFinishingLabel(f.label)}
                      description={f.description}
                      badge={inferOptionBadge(f.label)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
        break;
      case "production":
        body = (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">Prazo</p>
              <div className="grid gap-2">
                {product.deadlines.map((d) => (
                  <OptionCard
                    key={d.label}
                    selected={selection.deadline === d.label}
                    onClick={() => onDeadlineChange(d.label)}
                    title={d.label}
                    badge={inferOptionBadge(d.label)}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">Quantidade</p>
              <p className="mt-1 text-[0.78rem] text-white/60">Mínimo: {quantityMin} un.</p>
              <div className="mt-3 flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onQuantityChange(clampQty(selection.quantity - 1))}
                  disabled={selection.quantity <= quantityMin}
                  className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-lg disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="number"
                  min={quantityMin}
                  step={1}
                  value={selection.quantity}
                  onChange={(e) => onQuantityChange(clampQty(Number(e.target.value)))}
                  className="field h-11 min-h-[44px] min-w-0 flex-1 rounded-2xl border-white/10 bg-white/[0.06] text-center text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => onQuantityChange(clampQty(selection.quantity + 1))}
                  className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
        break;
      case "extras":
        body = (
          <div className="space-y-3">
            <ProductAddonStrip
              addons={experience.addons}
              selectedAddonIds={selection.selectedAddonIds}
              onToggle={onToggleAddon}
            />
            <button
              type="button"
              onClick={skipExtras}
              className="focus-ring w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
            >
              Pular extras
            </button>
          </div>
        );
        break;
      default:
        body = null;
    }
  }

  const showBack = activeIndex > 0;

  return (
    <section
      id="configurador"
      className="min-w-0 rounded-[22px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-4 md:p-5"
    >
      <div className="border-b border-white/10 pb-3">
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-fuchsia-300/90">Configurador</p>
        <h1 className="font-display mt-2 text-[clamp(1.35rem,2.4vw,2rem)] font-semibold tracking-tight text-white">
          Monte seu pedido em etapas
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          Preço e prazo atualizam conforme suas escolhas — mesmo catálogo e regras de sempre.
        </p>
      </div>

      <div className="mt-4">{stepper}</div>

      {stepMeta ? (
        <div className="mt-5">
          <h2 className="text-base font-semibold text-white sm:text-lg">
            {activeIndex + 1}. {stepMeta.title}
          </h2>
          <p className="mt-1 text-sm text-white/60">{stepMeta.subtitle}</p>
          <div className="mt-4">{body}</div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={goPrev}
            className="focus-ring order-2 w-full rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/[0.09] sm:order-1 sm:w-auto"
          >
            Voltar
          </button>
        ) : null}
        <button
          type="button"
          onClick={handlePrimary}
          className={cn(
            "home-btn-gradient focus-ring order-1 min-h-[52px] w-full rounded-full px-6 text-sm font-semibold sm:order-2 sm:ml-auto sm:w-auto sm:px-8",
            !showBack && "sm:ml-0",
          )}
        >
          {isLast ? "Ver total e fechar" : "Próximo passo"}
        </button>
      </div>
    </section>
  );
}
