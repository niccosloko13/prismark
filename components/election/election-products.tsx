"use client";

import { useReducer } from "react";

import {
  buildElectionBudgetWhatsAppUrl,
  ELECTION_MATERIALS,
  type ElectionMaterialAccent,
  type ElectionMaterialIcon,
  type ElectionMaterialId,
  getElectionMaterial,
} from "@/lib/election-budget-materials";
import { cn } from "@/lib/utils";

const accentMap: Record<
  ElectionMaterialAccent,
  { ring: string; glow: string; activeGlow: string; iconBg: string; iconText: string }
> = {
  sky: {
    ring: "border-sky-400/60",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:shadow-[0_0_32px_rgba(56,189,248,0.5)]",
    activeGlow: "shadow-[0_0_36px_rgba(56,189,248,0.75),0_0_56px_rgba(56,189,248,0.35)]",
    iconBg: "bg-sky-500/25 text-sky-200",
    iconText: "text-sky-100",
  },
  amber: {
    ring: "border-amber-300/65",
    glow: "shadow-[0_0_20px_rgba(252,211,77,0.35)] hover:shadow-[0_0_32px_rgba(252,211,77,0.5)]",
    activeGlow: "shadow-[0_0_36px_rgba(252,211,77,0.75),0_0_56px_rgba(252,211,77,0.35)]",
    iconBg: "bg-amber-400/25 text-amber-200",
    iconText: "text-amber-100",
  },
  rose: {
    ring: "border-rose-400/60",
    glow: "shadow-[0_0_20px_rgba(251,113,133,0.35)] hover:shadow-[0_0_32px_rgba(251,113,133,0.5)]",
    activeGlow: "shadow-[0_0_36px_rgba(251,113,133,0.75),0_0_56px_rgba(251,113,133,0.35)]",
    iconBg: "bg-rose-500/25 text-rose-200",
    iconText: "text-rose-100",
  },
  blue: {
    ring: "border-blue-400/60",
    glow: "shadow-[0_0_20px_rgba(96,165,250,0.35)] hover:shadow-[0_0_32px_rgba(96,165,250,0.5)]",
    activeGlow: "shadow-[0_0_36px_rgba(96,165,250,0.75),0_0_56px_rgba(96,165,250,0.35)]",
    iconBg: "bg-blue-500/25 text-blue-200",
    iconText: "text-blue-100",
  },
  yellow: {
    ring: "border-yellow-400/70",
    glow: "shadow-[0_0_22px_rgba(250,204,21,0.4)] hover:shadow-[0_0_36px_rgba(250,204,21,0.55)]",
    activeGlow: "shadow-[0_0_40px_rgba(250,204,21,0.8),0_0_64px_rgba(250,204,21,0.45)]",
    iconBg: "bg-yellow-400/25 text-yellow-200",
    iconText: "text-yellow-100",
  },
  red: {
    ring: "border-red-500/60",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_32px_rgba(239,68,68,0.5)]",
    activeGlow: "shadow-[0_0_36px_rgba(239,68,68,0.75),0_0_56px_rgba(239,68,68,0.35)]",
    iconBg: "bg-red-500/25 text-red-200",
    iconText: "text-red-100",
  },
  violet: {
    ring: "border-violet-400/60",
    glow: "shadow-[0_0_20px_rgba(167,139,250,0.35)] hover:shadow-[0_0_32px_rgba(167,139,250,0.5)]",
    activeGlow: "shadow-[0_0_36px_rgba(167,139,250,0.75),0_0_56px_rgba(167,139,250,0.35)]",
    iconBg: "bg-violet-500/25 text-violet-200",
    iconText: "text-violet-100",
  },
  orange: {
    ring: "border-orange-400/60",
    glow: "shadow-[0_0_20px_rgba(251,146,60,0.35)] hover:shadow-[0_0_32px_rgba(251,146,60,0.5)]",
    activeGlow: "shadow-[0_0_36px_rgba(251,146,60,0.75),0_0_56px_rgba(251,146,60,0.35)]",
    iconBg: "bg-orange-500/25 text-orange-200",
    iconText: "text-orange-100",
  },
};

type BudgetState = {
  selectedMaterials: string[];
  quantities: Record<string, number>;
  bannerWidth: number;
  bannerHeight: number;
};

type BudgetAction =
  | { type: "toggle"; id: ElectionMaterialId }
  | { type: "setQty"; id: string; value: number }
  | { type: "setBannerW"; value: number }
  | { type: "setBannerH"; value: number };

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case "toggle": {
      const id = action.id;
      if (state.selectedMaterials.includes(id)) {
        const nextQty = { ...state.quantities };
        delete nextQty[id];
        return {
          ...state,
          selectedMaterials: state.selectedMaterials.filter((x) => x !== id),
          quantities: nextQty,
        };
      }
      const m = getElectionMaterial(id);
      return {
        ...state,
        selectedMaterials: [...state.selectedMaterials, id],
        quantities: { ...state.quantities, [id]: m?.minQty ?? 1 },
      };
    }
    case "setQty":
      return {
        ...state,
        quantities: { ...state.quantities, [action.id]: action.value },
      };
    case "setBannerW":
      return { ...state, bannerWidth: action.value };
    case "setBannerH":
      return { ...state, bannerHeight: action.value };
    default:
      return state;
  }
}

const initialBudgetState: BudgetState = {
  selectedMaterials: [],
  quantities: {},
  bannerWidth: 1,
  bannerHeight: 1,
};

function ProductIcon({ type, className }: { type: ElectionMaterialIcon; className?: string }) {
  const c = cn("h-5 w-5", className);
  switch (type) {
    case "doc":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M8 4h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 4v4h4M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "wide":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <rect x="3" y="7" width="18" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "post":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M12 3v18M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="6" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "banner":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "wind":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M4 10h12a2 2 0 1 0 0-4M4 14h8M6 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "fabric":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M4 8c4 0 4-3 8-3s4 3 8 3v8c-4 0-4 3-8 3s-4-3-8-3V8Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "folder":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M4 8a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9H4V8Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <rect x="5" y="7" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "perforated":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <rect x="4" y="6" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 6v12M12 6v12M16 6v12" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2" />
        </svg>
      );
    case "bumper":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M5 14c2-4 4-6 7-6s5 2 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="4" y="14" width="16" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "flag":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M5 3v18M5 5h10l-2 4 2 4H5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "newspaper":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={c} aria-hidden>
          <path d="M7 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2v-16a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 9h8M10 13h5M10 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

const fieldClass =
  "w-full rounded-xl border border-white/18 bg-black/35 px-3 py-2.5 text-sm font-medium text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20";

export function ElectionProducts({ className }: { className?: string }) {
  const [state, dispatch] = useReducer(budgetReducer, initialBudgetState);
  const { selectedMaterials, quantities, bannerWidth, bannerHeight } = state;

  const orderedSelected = ELECTION_MATERIALS.filter((m) => selectedMaterials.includes(m.id));

  function sendBudget() {
    if (selectedMaterials.length === 0) return;
    const url = buildElectionBudgetWhatsAppUrl({
      selectedIds: selectedMaterials,
      quantities,
      bannerWidth,
      bannerHeight,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className={cn("relative z-[1] min-w-0", className)} aria-labelledby="election-products-heading">
      <div id="election-products-heading" className="text-center lg:text-left">
        <h2 className="text-[clamp(1.35rem,3.5vw,1.85rem)] font-black uppercase leading-tight tracking-wide text-white">
          Quais materiais você precisa?
        </h2>
        <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/70 sm:text-base">
          Selecione abaixo e monte seu orçamento em segundos.
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-2">
        {ELECTION_MATERIALS.map((p) => {
          const a = accentMap[p.accent];
          const selected = selectedMaterials.includes(p.id);
          return (
            <li key={p.id} className="min-w-0">
              <button
                type="button"
                onClick={() => dispatch({ type: "toggle", id: p.id })}
                aria-pressed={selected}
                className={cn(
                  "group flex w-full min-h-[4.25rem] items-center gap-2.5 rounded-2xl border bg-white/[0.04] px-3 py-2.5 text-left backdrop-blur-md transition duration-300 ease-out sm:gap-3 sm:px-3.5 sm:py-3",
                  a.ring,
                  selected ? cn("bg-white/[0.1] ring-2 ring-yellow-400/70", a.activeGlow) : cn(a.glow, "hover:-translate-y-0.5 hover:bg-white/[0.07]"),
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 sm:h-11 sm:w-11",
                    a.iconBg,
                  )}
                >
                  <ProductIcon type={p.icon} className={cn(a.iconText)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[0.8rem] font-black uppercase tracking-wide text-white sm:text-[0.95rem]">{p.cardTitle}</p>
                  <p className="line-clamp-2 text-[0.65rem] font-medium text-white/60 sm:text-xs">{p.cardSubtitle}</p>
                </div>
                {selected ? (
                  <span className="shrink-0 rounded-full bg-yellow-400/25 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-yellow-200 sm:text-[0.65rem]">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {selectedMaterials.length > 0 ? (
        <div
          className="mt-8 rounded-2xl border border-white/12 bg-white/[0.04] p-4 shadow-[0_0_40px_rgba(59,130,246,0.08)] backdrop-blur-md transition-all duration-300 ease-out sm:p-6"
          role="region"
          aria-label="Seu orçamento"
        >
          <h3 className="text-center text-lg font-black uppercase tracking-wide text-white sm:text-xl lg:text-left">Seu orçamento</h3>
          <p className="mt-1 text-center text-xs text-white/55 sm:text-sm lg:text-left">Ajuste as quantidades. Enviaremos tudo formatado no WhatsApp.</p>

          <ul className="mt-5 flex flex-col gap-4 sm:gap-5">
            {orderedSelected.map((m) => (
              <li
                key={m.id}
                className="animate-election-row-in rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5"
              >
                <p className="text-sm font-black uppercase tracking-wide text-yellow-200 sm:text-base">{m.quoteLabel}</p>
                {m.fieldType === "banner_dims" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className="block text-xs font-semibold text-white/70">
                      Largura (m)
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0.1}
                        step={0.1}
                        value={bannerWidth}
                        onChange={(e) => dispatch({ type: "setBannerW", value: Number(e.target.value) || 0.1 })}
                        className={cn(fieldClass, "mt-1.5")}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-white/70">
                      Altura (m)
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0.1}
                        step={0.1}
                        value={bannerHeight}
                        onChange={(e) => dispatch({ type: "setBannerH", value: Number(e.target.value) || 0.1 })}
                        className={cn(fieldClass, "mt-1.5")}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-white/70">
                      Quantidade (mín. {m.minQty.toLocaleString("pt-BR")})
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        value={quantities[m.id] ?? m.minQty}
                        onChange={(e) =>
                          dispatch({
                            type: "setQty",
                            id: m.id,
                            value: Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                          })
                        }
                        className={cn(fieldClass, "mt-1.5")}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-white/60 sm:text-sm">
                      Tamanho: <span className="font-semibold text-white/85">{m.sizeNote}</span>
                      <span className="mx-2 text-white/30">·</span>
                      Mínimo: <span className="font-semibold text-white/85">{m.minQty.toLocaleString("pt-BR")}</span>
                    </p>
                    <label className="block text-xs font-semibold text-white/70">
                      Quantidade desejada
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={quantities[m.id] ?? m.minQty}
                        onChange={(e) =>
                          dispatch({ type: "setQty", id: m.id, value: Math.max(0, Number.parseInt(e.target.value, 10) || 0) })
                        }
                        className={cn(fieldClass, "mt-1.5 max-w-full sm:max-w-xs")}
                      />
                    </label>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-center sm:mt-8">
            <button
              type="button"
              onClick={sendBudget}
              className={cn(
                "focus-ring w-full max-w-md rounded-full bg-white px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-black shadow-[0_0_24px_rgba(255,255,255,0.25)] transition sm:w-auto sm:min-w-[20rem] sm:px-10 sm:text-base",
                "hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.45)] active:scale-[0.99]",
              )}
            >
              Enviar orçamento agora
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
