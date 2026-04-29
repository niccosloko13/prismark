"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/common/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field h-[3.25rem] appearance-none rounded-[18px] border-white/8 bg-white/[0.04] pr-11 text-[0.94rem] font-medium text-white shadow-[0_14px_28px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:border-white/18 focus:border-cyan/40"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45">
          <ChevronDown />
        </span>
      </div>
    </label>
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
        "focus-ring inline-flex min-h-[2.7rem] items-center rounded-full border px-4 py-2.5 text-sm font-semibold tracking-[-0.01em] transition duration-200",
        active
          ? "border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white shadow-[0_8px_28px_rgba(236,72,153,0.38),0_0_36px_rgba(56,189,248,0.18)] ring-1 ring-white/15"
          : "border-white/8 bg-white/[0.04] text-white/75 shadow-[0_10px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]",
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
    <div className="rounded-[18px] border border-white/8 bg-white/[0.04] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:rounded-[20px] sm:p-3.5">
      <div className="mb-2 sm:mb-2.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">{title}</p>
        {description ? <p className="mt-1 text-[0.8125rem] leading-snug text-white/60 sm:text-sm sm:leading-6">{description}</p> : null}
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
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-xl font-medium text-white shadow-[0_10px_22px_rgba(0,0,0,0.25)] transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
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
            className="field h-11 rounded-[18px] border-white/8 bg-white/[0.04] text-center text-base font-semibold text-white shadow-[0_10px_22px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          />
        </label>
        <button
          type="button"
          onClick={() => onChange(clamp(quantity + 1))}
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-xl font-medium text-white shadow-[0_10px_22px_rgba(0,0,0,0.25)] transition hover:bg-white/12"
        >
          +
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-center gap-2 px-0.5 text-sm text-white/50">
        <Link href="/" className="transition hover:text-white">
          Home
        </Link>
        <span className="text-white/35">/</span>
        <Link href="/produtos" className="transition hover:text-white">
          Produtos
        </Link>
        <span className="text-white/35">/</span>
        <span className="font-medium text-white">{product.name}</span>
      </div>

      <section id="configurador" className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/8 pb-3 sm:gap-3 sm:pb-4">
          <div className="min-w-0">
            <p className="label-kicker text-[0.64rem]">Configurador</p>
            <h2 className="display-title mt-1 text-base font-semibold tracking-tight text-white sm:mt-1.5 sm:text-[1.2rem]">
              Opcoes do pedido
            </h2>
          </div>
          <Badge tone="yellow" className="shrink-0 px-2.5 py-1 text-[0.62rem]">
            {selectedModel?.label ?? "Modelo padrao"}
          </Badge>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-2.5">
          <div className="surface-muted px-3 py-2.5 sm:px-3.5 sm:py-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">Formato e material</p>
            <p className="mt-1 break-words text-[0.8125rem] font-medium leading-snug text-white sm:text-sm">
              {selectedFormat?.label ?? "-"} · {selection.width}×{selection.height} cm · {selection.material}
            </p>
          </div>
          <div className="surface-muted px-3 py-2.5 sm:px-3.5 sm:py-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">Acabamento</p>
            <p className="mt-1 break-words text-[0.8125rem] font-medium leading-snug text-white sm:text-sm">
              {selectedColor?.label ?? "-"} · {selectedEnhancement?.label ?? "-"} · {selectedFinishing?.label ?? "-"}
            </p>
          </div>
        </div>

        {experience.models.length > 1 ? (
          <div className="mt-2.5 sm:mt-3">
            <ControlCard title="Modelo">
              <div className="flex flex-wrap gap-2">
                {experience.models.map((item) => (
                  <PillButton key={item.id} active={selection.modelId === item.id} onClick={() => onModelChange(item.id)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </ControlCard>
          </div>
        ) : null}

        <div className="mt-2.5 grid gap-2 md:grid-cols-2 md:gap-2.5">
          <ControlCard title="Material">
            <SelectField label="Material" value={selection.material} onChange={onMaterialChange}>
              {product.materials.map((item) => (
                <option key={item.label} value={item.label}>
                  {item.label}
                </option>
              ))}
            </SelectField>
          </ControlCard>

          <ControlCard title="Formato">
            <SelectField label="Formato" value={selection.formatId} onChange={onFormatChange}>
              {experience.formats.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} • {item.width} x {item.height} cm
                </option>
              ))}
            </SelectField>
          </ControlCard>
        </div>

        <div className="mt-2.5 sm:mt-3">
          <QuantityControl product={product} quantity={selection.quantity} onChange={onQuantityChange} />
        </div>

        <div className="mt-2.5 grid gap-2 sm:mt-3 sm:gap-2.5">
          <ControlCard title="Cor">
            <div className="flex flex-wrap gap-2">
              {experience.colors.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onColorChange(item.id)}
                  className={cn(
                    "focus-ring inline-flex min-h-[2.8rem] max-w-full items-center gap-2 rounded-full border px-4 py-2.5 text-left text-sm font-semibold leading-tight transition duration-200",
                    selection.colorId === item.id
                      ? "border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white shadow-[0_8px_28px_rgba(236,72,153,0.35),0_0_32px_rgba(56,189,248,0.15)] ring-1 ring-white/15"
                      : "border-white/8 bg-white/[0.04] text-white/80 shadow-[0_10px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]",
                  )}
                >
                  <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: item.swatch }} />
                  {item.label}
                </button>
              ))}
            </div>
          </ControlCard>

          <ControlCard title="Enobrecimento">
            <div className="flex flex-wrap gap-2">
              {experience.enhancements.map((item) => (
                <PillButton key={item.id} active={selection.enhancementId === item.id} onClick={() => onEnhancementChange(item.id)}>
                  {item.label}
                </PillButton>
              ))}
            </div>
          </ControlCard>

          <div className="grid gap-2 md:grid-cols-2 md:gap-2.5">
            <ControlCard title="Acabamento">
              <div className="flex flex-wrap gap-2">
                {product.finishings.map((item) => (
                  <PillButton key={item.label} active={selection.finishing === item.label} onClick={() => onFinishingChange(item.label)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </ControlCard>

            <ControlCard title="Prazo">
              <div className="flex flex-wrap gap-2">
                {product.deadlines.map((item) => (
                  <PillButton key={item.label} active={selection.deadline === item.label} onClick={() => onDeadlineChange(item.label)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </ControlCard>
          </div>
        </div>

        <p className="mt-3 text-center">
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
