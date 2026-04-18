"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/common/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("h-3.5 w-3.5", active ? "text-yellow-500" : "text-black/16")}>
      <path
        d="m10 2.2 2.42 4.9 5.4.79-3.91 3.81.92 5.38L10 14.54l-4.83 2.54.92-5.38L2.18 7.89l5.4-.79L10 2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarGlyphs({ value }: { value: number }) {
  const rounded = Math.round(value);

  return (
    <div className="inline-flex items-center gap-1" aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} active={index < rounded} />
      ))}
    </div>
  );
}

function socialStats(rating?: ProductExperience["rating"]) {
  const reviews = rating?.reviews ?? 96;

  return {
    reviews,
    orders: Math.max(reviews * 12, 1080),
    onTimeRate: rating?.value && rating.value >= 4.9 ? "98%" : "97%",
  };
}

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
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/42">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field h-[3.25rem] appearance-none rounded-[18px] border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,249,250,0.94))] pr-11 text-[0.94rem] font-medium text-ink shadow-[0_14px_28px_rgba(15,15,15,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:border-black/18 focus:border-cyan/30"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/34">
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
          ? "border-ink bg-ink text-white shadow-[0_16px_34px_rgba(15,15,15,0.14)]"
          : "border-black/10 bg-white text-black/70 shadow-[0_10px_20px_rgba(15,15,15,0.03)] hover:-translate-y-0.5 hover:border-black/18 hover:bg-black/[0.02]",
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
    <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.995),rgba(247,248,249,0.95))] p-4 shadow-[0_18px_40px_rgba(15,15,15,0.04),inset_0_1px_0_rgba(255,255,255,0.82)]">
      <div className="mb-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/42">{title}</p>
        {description ? <p className="mt-1 text-sm leading-6 text-black/56">{description}</p> : null}
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
      description={min <= 10 ? "Ajuste rapido para pequenas tiragens e use 10+ para lotes maiores." : `Pedido minimo de ${min} unidades.`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(quantity - 1))}
          disabled={quantity <= min}
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-medium text-ink shadow-[0_10px_22px_rgba(15,15,15,0.04)] transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
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
            className="field h-11 rounded-[18px] text-center text-base font-semibold shadow-[0_10px_22px_rgba(15,15,15,0.04)]"
          />
        </label>
        <button
          type="button"
          onClick={() => onChange(clamp(quantity + 1))}
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-xl font-medium text-ink shadow-[0_10px_22px_rgba(15,15,15,0.04)] transition hover:bg-black/[0.03]"
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
  const rating = experience.rating;
  const stats = socialStats(rating);
  const selectedModel = experience.models.find((item) => item.id === selection.modelId) ?? experience.models[0];
  const selectedFormat = experience.formats.find((item) => item.id === selection.formatId) ?? experience.formats[0];
  const selectedColor = experience.colors.find((item) => item.id === selection.colorId) ?? experience.colors[0];
  const selectedEnhancement = experience.enhancements.find((item) => item.id === selection.enhancementId) ?? experience.enhancements[0];
  const selectedFinishing = product.finishings.find((item) => item.label === selection.finishing) ?? product.finishings[0];

  return (
    <div className="space-y-4">
      <section className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(0,181,255,0),rgba(0,181,255,0.42),rgba(255,46,191,0.44),rgba(255,211,0,0.38),rgba(255,211,0,0))]" />

        <div className="flex flex-wrap items-center gap-2 text-sm text-black/44">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="transition hover:text-ink">
            Produtos
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">{product.name}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="cyan">{product.badge}</Badge>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/56">
            {product.category}
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/56">
            Producao propria
          </span>
          {rating ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-black/66">
              <StarGlyphs value={rating.value} />
              {rating.value.toFixed(1)} • {rating.reviews} avaliacoes
            </span>
          ) : null}
        </div>

        <h1 className="display-title mt-4 max-w-3xl text-[clamp(2.2rem,3.6vw,3.6rem)] font-semibold leading-[0.93] tracking-[-0.04em] text-balance text-ink">
          {product.name}
        </h1>
        <p className="mt-3 max-w-3xl text-[1rem] font-medium leading-7 text-ink/90 sm:text-[1.06rem]">{product.lead}</p>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-black/58 sm:text-[0.96rem]">{product.description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,248,0.92))] px-4 py-4 shadow-[0_16px_32px_rgba(15,15,15,0.04)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Avaliacao</p>
            <div className="mt-2 flex items-center gap-2">
              <StarGlyphs value={rating?.value ?? 4.8} />
              <strong className="text-base font-semibold text-ink">{(rating?.value ?? 4.8).toFixed(1)}/5</strong>
            </div>
            <p className="mt-2 text-sm text-black/56">{stats.reviews} avaliacoes verificadas</p>
          </div>
          <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,248,0.92))] px-4 py-4 shadow-[0_16px_32px_rgba(15,15,15,0.04)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Pedidos produzidos</p>
            <strong className="mt-2 block text-[1.55rem] font-semibold tracking-[-0.03em] text-ink">
              +{new Intl.NumberFormat("pt-BR").format(stats.orders)}
            </strong>
            <p className="mt-2 text-sm text-black/56">mesma familia comercial ja produzida</p>
          </div>
          <div className="rounded-[24px] border border-cyan/18 bg-[linear-gradient(180deg,rgba(0,181,255,0.09),rgba(255,255,255,0.96))] px-4 py-4 shadow-[0_18px_34px_rgba(0,181,255,0.08)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">No prazo</p>
            <strong className="mt-2 block text-[1.32rem] font-semibold tracking-[-0.03em] text-ink">{stats.onTimeRate}</strong>
            <p className="mt-2 text-sm text-black/56">dos pedidos entregues dentro da janela comercial</p>
          </div>
        </div>
      </section>

      <section id="configurador" className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-4">
          <div>
            <p className="label-kicker">Configurador</p>
            <h2 className="display-title mt-2 text-[1.34rem] font-semibold tracking-[-0.03em] text-ink">
              Configure rapido e siga para inclusao dos extras
            </h2>
          </div>
          <Badge tone="yellow">{selectedModel?.label ?? "Modelo padrao"}</Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="surface-muted px-4 py-3.5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Selecao atual</p>
            <p className="mt-2 break-words text-sm font-medium text-ink">
              {selectedFormat?.label ?? "-"} • {selection.width} x {selection.height} cm • {selection.material}
            </p>
          </div>
          <div className="surface-muted px-4 py-3.5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Acabamento</p>
            <p className="mt-2 break-words text-sm font-medium text-ink">
              {selectedColor?.label ?? "-"} • {selectedEnhancement?.label ?? "-"} • {selectedFinishing?.label ?? "-"}
            </p>
          </div>
        </div>

        {experience.models.length > 1 ? (
          <div className="mt-3">
            <ControlCard title="Modelo" description="Escolha a estrutura comercial que melhor representa o produto.">
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

        <div className="mt-3 grid gap-3 md:grid-cols-2">
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

        <div className="mt-3">
          <QuantityControl product={product} quantity={selection.quantity} onChange={onQuantityChange} />
        </div>

        <div className="mt-3 grid gap-3">
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
                      ? "border-ink bg-ink text-white shadow-[0_16px_34px_rgba(15,15,15,0.14)]"
                      : "border-black/10 bg-white text-black/70 shadow-[0_10px_20px_rgba(15,15,15,0.03)] hover:-translate-y-0.5 hover:border-black/18 hover:bg-black/[0.02]",
                  )}
                >
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: item.swatch }} />
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

          <div className="grid gap-3 md:grid-cols-2">
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
      </section>
    </div>
  );
}
