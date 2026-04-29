"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/common/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

function StarsRow() {
  return (
    <div className="inline-flex items-center gap-0.5 text-yellow-400" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>★</span>
      ))}
    </div>
  );
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex min-h-[2.35rem] items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[-0.01em] transition duration-200 sm:min-h-[2.45rem] sm:px-3.5 sm:text-[0.8125rem]",
        active
          ? "border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white shadow-[0_6px_22px_rgba(236,72,153,0.35),0_0_28px_rgba(56,189,248,0.16)] ring-1 ring-white/15"
          : "border-white/8 bg-white/[0.04] text-white/75 shadow-[0_8px_18px_rgba(0,0,0,0.2)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.07]",
      )}
    >
      {children}
    </button>
  );
}

function ControlCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.04] p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:rounded-[16px] sm:p-3">
      <div className="mb-1.5 sm:mb-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">{title}</p>
        {description ? <p className="mt-0.5 text-[0.78rem] leading-snug text-white/58 sm:text-[0.8125rem]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function QuantityControl({
  product,
  quantity,
  onChange,
}: {
  product: Product;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  const min = product.minQuantity;
  const quickValues = [1, 5, 10].filter((value, index, list) => value >= min && list.indexOf(value) === index);

  function clamp(next: number) {
    return Math.max(min, Math.round(next) || min);
  }

  return (
    <ControlCard
      title="Quantidade"
      description={min <= 10 ? "Atalhos para tiragens curtas." : `Minimo ${min} un.`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(quantity - 1))}
          disabled={quantity <= min}
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-lg font-medium text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
        >
          -
        </button>
        <label className="flex-1">
          <span className="sr-only">Quantidade</span>
          <input
            type="number"
            min={min}
            step={1}
            value={quantity}
            onChange={(event) => onChange(clamp(Number(event.target.value)))}
            className="field h-9 rounded-[14px] border-white/8 bg-white/[0.04] text-center text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:h-10 sm:text-base"
          />
        </label>
        <button
          type="button"
          onClick={() => onChange(clamp(quantity + 1))}
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-lg font-medium text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition hover:bg-white/12 sm:h-10 sm:w-10"
        >
          +
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {quickValues.map((value) => (
          <PillButton key={value} active={quantity === value} onClick={() => onChange(value)}>
            {value}
          </PillButton>
        ))}
        {min <= 10 ? (
          <PillButton active={quantity > 10} onClick={() => onChange(Math.max(11, quantity > 10 ? quantity : 11))}>
            10+
          </PillButton>
        ) : null}
      </div>
    </ControlCard>
  );
}

export function ProductPurchasePanel({
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
}: {
  product: Product;
  experience: ProductExperience;
  selection: ProductSelectionState;
  onModelChange: (modelId: string) => void;
  onFormatChange: (formatId: string) => void;
  onMaterialChange: (material: string) => void;
  onColorChange: (colorId: string) => void;
  onEnhancementChange: (enhancementId: string) => void;
  onFinishingChange: (finishing: string) => void;
  onDeadlineChange: (deadline: string) => void;
  onQuantityChange: (quantity: number) => void;
}) {
  const selectedModel = experience.models.find((item) => item.id === selection.modelId) ?? experience.models[0];
  const selectedFormat = experience.formats.find((item) => item.id === selection.formatId) ?? experience.formats[0];
  const selectedColor = experience.colors.find((item) => item.id === selection.colorId) ?? experience.colors[0];
  const selectedEnhancement = experience.enhancements.find((item) => item.id === selection.enhancementId) ?? experience.enhancements[0];
  const selectedFinishing = product.finishings.find((item) => item.label === selection.finishing) ?? product.finishings[0];

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <section
        id="configurador"
        className="rounded-[20px] border border-white/8 bg-white/[0.04] p-3 shadow-[0_20px_56px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:rounded-[24px] sm:p-4 xl:rounded-[28px]"
      >
        <div className="mb-2 space-y-1.5">
          <Badge tone="magenta" className="px-2 py-0.5 text-[0.58rem]">
            MAIS VENDIDO
          </Badge>
          <h1 className="display-title text-[clamp(1.55rem,2.8vw,2.35rem)] font-semibold tracking-tight text-white">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70 sm:text-sm">
            <StarsRow />
            <span>4.9 (126 avaliações)</span>
          </div>
          <p className="text-xs leading-relaxed text-white/65 sm:text-sm">{product.description}</p>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/8 pb-2 sm:pb-3">
          <div className="min-w-0">
            <p className="label-kicker text-[0.6rem]">Configurador</p>
            <h2 className="display-title mt-0.5 text-sm font-semibold tracking-tight text-white sm:text-base">
              Opcoes do pedido
            </h2>
          </div>
          <Badge tone="yellow" className="shrink-0 px-2 py-0.5 text-[0.58rem]">
            {selectedModel?.label ?? "Modelo padrao"}
          </Badge>
        </div>

        <div className="mt-2 grid gap-1.5 sm:grid-cols-2 sm:gap-2">
          <div className="surface-muted px-2.5 py-2 sm:px-3 sm:py-2.5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/45">Formato e material</p>
            <p className="mt-0.5 break-words text-[0.78rem] font-medium leading-snug text-white sm:text-[0.8125rem]">
              {selectedFormat?.label ?? "-"} · {selection.width}×{selection.height} cm · {selection.material}
            </p>
          </div>
          <div className="surface-muted px-2.5 py-2 sm:px-3 sm:py-2.5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/45">Acabamento</p>
            <p className="mt-0.5 break-words text-[0.78rem] font-medium leading-snug text-white sm:text-[0.8125rem]">
              {selectedColor?.label ?? "-"} · {selectedEnhancement?.label ?? "-"} · {selectedFinishing?.label ?? "-"}
            </p>
          </div>
        </div>

        {experience.models.length > 1 ? (
          <div className="mt-2 sm:mt-2.5">
            <ControlCard title="Modelo">
              <div className="flex flex-wrap gap-1.5">
                {experience.models.map((item) => (
                  <PillButton key={item.id} active={selection.modelId === item.id} onClick={() => onModelChange(item.id)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </ControlCard>
          </div>
        ) : null}

        <div className="mt-2 grid gap-2 md:grid-cols-2 md:gap-2">
          <ControlCard title="Formato" description="Medidas do pedido.">
            <div className="flex flex-wrap gap-1.5">
              {experience.formats.map((item) => (
                <PillButton key={item.id} active={selection.formatId === item.id} onClick={() => onFormatChange(item.id)}>
                  {item.label} · {item.width}×{item.height} cm
                </PillButton>
              ))}
            </div>
          </ControlCard>

          <ControlCard title="Material">
            <div className="flex flex-wrap gap-1.5">
              {product.materials.map((item) => (
                <PillButton key={item.label} active={selection.material === item.label} onClick={() => onMaterialChange(item.label)}>
                  {item.label}
                </PillButton>
              ))}
            </div>
          </ControlCard>
        </div>

        <div className="mt-2 sm:mt-2.5">
          <QuantityControl product={product} quantity={selection.quantity} onChange={onQuantityChange} />
        </div>

        <div className="mt-2 grid gap-2 sm:mt-2.5 sm:gap-2">
          <div className="grid gap-2 md:grid-cols-2 md:gap-2">
            <ControlCard title="Cor">
              <div className="flex flex-wrap gap-1.5">
                {experience.colors.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onColorChange(item.id)}
                    className={cn(
                      "focus-ring inline-flex min-h-[2.35rem] max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-xs font-semibold leading-tight transition duration-200 sm:min-h-[2.45rem] sm:text-[0.8125rem]",
                      selection.colorId === item.id
                        ? "border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white shadow-[0_6px_22px_rgba(236,72,153,0.32)] ring-1 ring-white/15"
                        : "border-white/8 bg-white/[0.04] text-white/80 shadow-[0_8px_18px_rgba(0,0,0,0.2)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]",
                    )}
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full border border-white/20 sm:h-3.5 sm:w-3.5" style={{ background: item.swatch }} />
                    {item.label}
                  </button>
                ))}
              </div>
            </ControlCard>

            <ControlCard title="Enobrecimento">
              <div className="flex flex-wrap gap-1.5">
                {experience.enhancements.map((item) => (
                  <PillButton key={item.id} active={selection.enhancementId === item.id} onClick={() => onEnhancementChange(item.id)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </ControlCard>
          </div>

          <div className="grid gap-2 md:grid-cols-2 md:gap-2">
            <ControlCard title="Acabamento">
              <div className="flex flex-wrap gap-1.5">
                {product.finishings.map((item) => (
                  <PillButton key={item.label} active={selection.finishing === item.label} onClick={() => onFinishingChange(item.label)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </ControlCard>

            <ControlCard title="Prazo">
              <div className="flex flex-wrap gap-1.5">
                {product.deadlines.map((item) => (
                  <PillButton key={item.label} active={selection.deadline === item.label} onClick={() => onDeadlineChange(item.label)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </ControlCard>
          </div>
        </div>

        <p className="mt-2 text-center">
          <a
            href="#resumo-pedido"
            className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-cyan-300 underline-offset-2 transition hover:text-cyan-200 hover:underline"
          >
            Ver total e fechar
          </a>
        </p>
      </section>
    </div>
  );
}
