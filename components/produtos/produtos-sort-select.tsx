"use client";

import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortValue = "mais-vendidos" | "menor-preco" | "maior-preco" | "nome";

export function ProdutosSortSelect({ value }: { value: SortValue }) {
  const [sort, setSort] = useState<SortValue>(value);

  const options = useMemo(
    () => [
      { value: "mais-vendidos" as const, label: "Mais vendidos" },
      { value: "menor-preco" as const, label: "Menor preço" },
      { value: "maior-preco" as const, label: "Maior preço" },
      { value: "nome" as const, label: "Nome" },
    ],
    [],
  );

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="ordenar" className="text-[0.8rem] text-white/60">
        Ordenar por
      </label>
      <div className="min-w-[9.5rem]">
          <Select value={sort} onValueChange={(next) => setSort(next as SortValue)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>
      <input type="hidden" name="sort" value={sort} />
    </div>
  );
}

