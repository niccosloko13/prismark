"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type GlassSelectOption = {
  value: string;
  label: string;
};

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  buttonClassName,
  menuClassName,
  optionClassName,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  options: GlassSelectOption[];
  placeholder?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        role="combobox"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex min-h-[3.25rem] w-full items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.94rem] font-medium text-white backdrop-blur-xl transition hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500",
          buttonClassName,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? placeholder}</span>
        <span className="text-white/70">
          <ChevronDown />
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          id={listboxId}
          className={cn(
            "absolute left-0 right-0 mt-2 z-50 max-h-64 overflow-hidden rounded-xl border border-white/8 bg-[#05070d] shadow-lg backdrop-blur-xl",
            menuClassName,
          )}
        >
          <div className="max-h-64 overflow-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full select-none px-4 py-2 text-left text-white",
                    "bg-transparent transition hover:bg-white/10",
                    isSelected
                      ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white"
                      : null,
                    optionClassName,
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

