"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  friendlyFinishingLabel,
  inferOptionBadge,
  materialChoiceHint,
} from "@/lib/product-display-labels";
import {
  cmToCustomUnit,
  customUnitToCm,
  normalizeCustomSizeUnit,
  PRISMARQ_CUSTOM_FORMAT_ID,
  type CustomSizePolicy,
  type CustomSizeUnit,
} from "@/lib/custom-product-size";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

import { ProductAddonStrip } from "./product-addon-strip";

type StepDef = {
  id: "size" | "material" | "finish" | "production" | "extras";
  title: string;
  /** Nome curto no stepper (mobile). */
  shortTitle: string;
  subtitle: string;
  optional?: boolean;
};

function stepShortTitle(id: StepDef["id"]): string {
  switch (id) {
    case "size":
      return "Tamanho";
    case "material":
      return "Material";
    case "finish":
      return "ImpressÃ£o";
    case "production":
      return "ProduÃ§Ã£o";
    case "extras":
      return "Extras";
    default:
      return "";
  }
}

function CheckMini({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={cn("h-3.5 w-3.5", className)} aria-hidden>
      <path d="m5.5 12.5 4 4 9-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
        "focus-ring relative flex min-h-[4.25rem] w-full flex-col items-start gap-1.5 rounded-[20px] border px-4 py-3.5 text-left transition duration-200 sm:min-h-0 sm:gap-1 sm:px-4 sm:py-3.5",
        selected
          ? "border-transparent bg-gradient-to-r from-pink-500/92 via-purple-500/88 to-cyan-400/85 text-white shadow-[0_12px_36px_rgba(168,85,247,0.42),0_0_32px_rgba(56,189,248,0.22)] ring-2 ring-fuchsia-400/35"
          : "border-white/12 bg-white/[0.05] text-white/90 hover:border-white/22 hover:bg-white/[0.08]",
        className,
      )}
    >
      {selected ? (
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white ring-1 ring-white/35 backdrop-blur-sm">
          <CheckMini />
        </span>
      ) : null}
      <span className="flex w-full flex-wrap items-center gap-2 pr-9">
        <span className="text-[0.95rem] font-semibold leading-snug sm:text-sm">{title}</span>
        {badge && !selected ? (
          <span className="rounded-full border border-white/18 bg-white/[0.08] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/85">
            {badge}
          </span>
        ) : null}
      </span>
      {description ? (
        <span className={cn("text-[0.84rem] leading-relaxed sm:text-[0.78rem]", selected ? "text-white/85" : "text-white/65")}>
          {description}
        </span>
      ) : null}
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
      shortTitle: stepShortTitle("size"),
      subtitle: "Formato e medidas ideais para o seu uso.",
    });
  }
  if (product.materials.length > 1) {
    steps.push({
      id: "material",
      title: "Escolha o material",
      shortTitle: stepShortTitle("material"),
      subtitle: "Selecione a mÃ­dia que melhor combina com sua aplicaÃ§Ã£o.",
    });
  }
  const showFinish =
    experience.colors.length > 1 || experience.enhancements.length > 1 || product.finishings.length > 1;
  if (showFinish) {
    steps.push({
      id: "finish",
      title: "Acabamento e impressÃ£o",
      shortTitle: stepShortTitle("finish"),
      subtitle: "Cor, enobrecimento e acabamento final.",
    });
  }
  steps.push({
    id: "production",
    title: "Prazo e quantidade",
    shortTitle: stepShortTitle("production"),
    subtitle: "Defina tiragem e urgÃªncia de produÃ§Ã£o.",
  });
  if (experience.addons.length > 0) {
    steps.push({
      id: "extras",
      title: "Extras opcionais",
      shortTitle: stepShortTitle("extras"),
      subtitle: "ServiÃ§os adicionais para facilitar sua entrega.",
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
  /** SÃ³ preenchido para produtos `store_products` com `meta.allowCustomSize`. */
  customSizePolicy?: CustomSizePolicy | null;
  onCustomDimensionsChange?: (widthCm: number, heightCm: number, unit?: CustomSizeUnit) => void;
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

  const lastStepIndex = Math.max(0, steps.length - 1);
  const isLast = steps.length > 0 && activeIndex >= lastStepIndex;

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
    setUnlockedStepIndex((u) => Math.max(u, activeIndex + 1));
    setActiveIndex((i) => clampIndex(i + 1));
  };

  const stepMeta = steps[activeIndex];
  const quantityMin = product.minQuantity;
  const clampQty = (n: number) => Math.max(quantityMin, Math.round(n) || quantityMin);

  const stepper = (
    <div className="max-w-full overflow-x-auto overflow-y-visible pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ol className="flex w-max min-w-0 snap-x snap-mandatory gap-2.5 px-0.5 sm:gap-3">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          const future = i > activeIndex;
          const reachable = i <= unlockedStepIndex;
          return (
            <li key={s.id} className="min-w-0 shrink-0 snap-start">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => {
                  if (reachable) setActiveIndex(i);
                }}
                className={cn(
                  "focus-ring flex min-w-[5.75rem] max-w-[8.25rem] flex-col rounded-2xl border px-3 py-2.5 text-left transition sm:min-w-[6.5rem] sm:max-w-none sm:px-3.5 sm:py-3",
                  current &&
                    "border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-500/25 via-violet-500/15 to-cyan-500/10 shadow-[0_0_28px_rgba(236,72,153,0.28)] ring-1 ring-fuchsia-400/30",
                  done &&
                    !current &&
                    "border-emerald-400/35 bg-emerald-500/[0.12] text-emerald-50 hover:border-emerald-400/50",
                  future && "border-white/[0.07] bg-white/[0.03] text-white/40",
                  !reachable && "cursor-not-allowed opacity-40",
                )}
              >
                <span className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold tabular-nums",
                      current && "bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-md",
                      done && !current && "bg-emerald-500/30 text-emerald-100",
                      future && "bg-white/10 text-white/45",
                    )}
                  >
                    {done && !current ? <CheckMini className="h-3 w-3" /> : i + 1}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-1.5 block text-[0.8rem] font-semibold leading-tight sm:text-[0.78rem]",
                    current && "text-white",
                    done && !current && "text-emerald-100/95",
                    future && "text-white/45",
                  )}
                >
                  {s.shortTitle}
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
              <div className="space-y-2.5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/55">Modelo</p>
                <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="space-y-2.5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/55">Formato</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {experience.formats.map((f) => (
                  <OptionCard
                    key={f.id}
                    selected={selection.formatId === f.id}
                    onClick={() => onFormatChange(f.id)}
                    title={`${f.label} Â· ${f.width}Ã—${f.height} cm`}
                    description={f.description}
                    badge={f.recommended ? "Melhor custo-benefÃ­cio" : inferOptionBadge(f.label)}
                  />
                ))}
                {customSizePolicy && onCustomDimensionsChange ? (
                  <>
                    <OptionCard
                      selected={selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID}
                      onClick={() => onFormatChange(PRISMARQ_CUSTOM_FORMAT_ID)}
                      title="Tamanho personalizado"
                      description="Informe largura, altura e unidade em cm ou m."
                      badge="Sob medida"
                    />
                    {selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID ? (
                      <div className="sm:col-span-2">
                        <div className="grid gap-3 rounded-[18px] border border-cyan-400/25 bg-black/25 p-3 sm:grid-cols-[1fr_1fr_120px]">
                          {(() => {
                            const unit = normalizeCustomSizeUnit(selection.customSizeUnit);
                            return (
                              <>
                                <label className="block text-sm text-white/75">
                                  <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                                    Largura · mín. {cmToCustomUnit(customSizePolicy.minWidthCm, unit)} {unit}
                                  </span>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    min={cmToCustomUnit(customSizePolicy.minWidthCm, unit)}
                                    step={unit === "m" ? 0.01 : 0.1}
                                    value={Number.isFinite(selection.width) ? cmToCustomUnit(selection.width, unit) : ""}
                                    onChange={(e) => {
                                      const raw = Number(e.target.value.replace(",", "."));
                                      onCustomDimensionsChange(
                                        Number.isFinite(raw) ? customUnitToCm(raw, unit) : selection.width,
                                        selection.height,
                                        unit,
                                      );
                                    }}
                                    className="field mt-1 h-11 w-full rounded-xl border-white/12 bg-white/[0.06] px-3 text-sm font-semibold text-white"
                                  />
                                </label>
                                <label className="block text-sm text-white/75">
                                  <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                                    Altura · mín. {cmToCustomUnit(customSizePolicy.minHeightCm, unit)} {unit}
                                  </span>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    min={cmToCustomUnit(customSizePolicy.minHeightCm, unit)}
                                    step={unit === "m" ? 0.01 : 0.1}
                                    value={Number.isFinite(selection.height) ? cmToCustomUnit(selection.height, unit) : ""}
                                    onChange={(e) => {
                                      const raw = Number(e.target.value.replace(",", "."));
                                      onCustomDimensionsChange(
                                        selection.width,
                                        Number.isFinite(raw) ? customUnitToCm(raw, unit) : selection.height,
                                        unit,
                                      );
                                    }}
                                    className="field mt-1 h-11 w-full rounded-xl border-white/12 bg-white/[0.06] px-3 text-sm font-semibold text-white"
                                  />
                                </label>
                                <label className="block text-sm text-white/75">
                                  <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/45">
                                    Unidade
                                  </span>
                                  <select
                                    value={unit}
                                    onChange={(e) => {
                                      const nextUnit = normalizeCustomSizeUnit(e.target.value);
                                      onCustomDimensionsChange(selection.width, selection.height, nextUnit);
                                    }}
                                    className="field mt-1 h-11 w-full rounded-xl border-white/12 bg-white/[0.06] px-3 text-sm font-semibold text-white"
                                  >
                                    <option value="cm">cm</option>
                                    <option value="m">m</option>
                                  </select>
                                </label>
                              </>
                            );
                          })()}
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
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="space-y-6">
            {experience.colors.length > 1 ? (
              <div className="space-y-2.5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/55">Cor</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {experience.colors.map((c) => {
                    const selected = selection.colorId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onColorChange(c.id)}
                        className={cn(
                          "focus-ring relative flex min-h-[4.25rem] items-start gap-3 rounded-[20px] border px-4 py-3.5 text-left transition sm:min-h-0 sm:items-center",
                          selected
                            ? "border-transparent bg-gradient-to-r from-pink-500/92 via-purple-500/88 to-cyan-400/85 text-white shadow-[0_12px_36px_rgba(168,85,247,0.42),0_0_28px_rgba(56,189,248,0.2)] ring-2 ring-fuchsia-400/35"
                            : "border-white/12 bg-white/[0.05] hover:border-white/22",
                        )}
                      >
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white ring-1 ring-white/35 backdrop-blur-sm">
                            <CheckMini />
                          </span>
                        ) : null}
                        <span
                          className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-white/25 sm:mt-0"
                          style={{ background: c.swatch }}
                        />
                        <span className="min-w-0 flex-1 pr-8">
                          <span className="block text-[0.95rem] font-semibold leading-snug sm:text-sm">{c.label}</span>
                          <span className="mt-0.5 block text-[0.84rem] leading-relaxed text-white/70 sm:text-[0.78rem]">
                            {c.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {experience.enhancements.length > 1 ? (
              <div className="space-y-2.5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/55">Enobrecimento</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {experience.enhancements.map((e) => (
                    <OptionCard
                      key={e.id}
                      selected={selection.enhancementId === e.id}
                      onClick={() => onEnhancementChange(e.id)}
                      title={e.label}
                      description={`${e.description} Â· ${e.priceLabel}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {product.finishings.length > 1 ? (
              <div className="space-y-2.5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/55">Acabamento</p>
                <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="space-y-2.5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/55">Prazo</p>
              <div className="grid gap-3">
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
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/55">Quantidade</p>
              <p className="mt-1 text-[0.78rem] text-white/60">MÃ­nimo: {quantityMin} un.</p>
              <div className="mt-3 flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onQuantityChange(clampQty(selection.quantity - 1))}
                  disabled={selection.quantity <= quantityMin}
                  className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-lg disabled:opacity-40"
                >
                  âˆ’
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
              className="focus-ring w-full rounded-xl border border-white/10 bg-transparent py-2 text-xs font-medium text-white/50 transition hover:border-white/18 hover:text-white/70"
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
      className="min-w-0 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-4 md:p-5"
    >
      <div className="border-b border-white/10 pb-4">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-fuchsia-300/90 sm:text-[0.62rem]">
          Configurador
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.55rem,5vw,2rem)] font-semibold leading-tight tracking-tight text-white">
          Personalize seu produto
        </h1>
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-white/72 sm:text-sm">
          Escolha as opÃ§Ãµes e veja o valor atualizado antes de finalizar.
        </p>
      </div>

      <div className="mt-5">{stepper}</div>

      {stepMeta ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            <span className="text-fuchsia-300/90">{activeIndex + 1}.</span> {stepMeta.shortTitle}
          </h2>
          <p className="mt-1.5 text-[0.95rem] leading-snug text-white/65 sm:text-sm">{stepMeta.subtitle}</p>
          <div className="mt-5">{body}</div>
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
          {isLast ? "Ver total e finalizar" : "PrÃ³ximo passo"}
        </button>
      </div>
    </section>
  );
}

