"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

export type SelectTheme = "dark" | "light";

const SelectThemeContext = React.createContext<SelectTheme>("dark");

function useSelectTheme() {
  return React.useContext(SelectThemeContext);
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("h-4 w-4", className)}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export function Select({
  theme = "dark",
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & { theme?: SelectTheme }) {
  return (
    <SelectThemeContext.Provider value={theme}>
      <SelectPrimitive.Root {...props} />
    </SelectThemeContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const theme = useSelectTheme();
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex min-h-[3.25rem] w-full items-center justify-between gap-2 rounded-xl px-4 py-2 text-[0.94rem] font-medium outline-none transition",
        theme === "dark"
          ? "border border-white/8 bg-white/[0.04] text-white backdrop-blur-xl hover:border-white/20 focus:ring-1 focus:ring-purple-500"
          : "border border-black/10 bg-white text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:border-black/18 focus:ring-1 focus:ring-cyan-500/40",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={theme === "light" ? "text-black/45" : undefined} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const theme = useSelectTheme();
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-xl shadow-lg",
          theme === "dark"
            ? "border border-white/8 bg-[#05070d] text-white backdrop-blur-xl"
            : "border border-black/10 bg-white text-ink",
          className,
        )}
        position="popper"
        {...props}
      >
        <SelectPrimitive.Viewport className="p-2">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const theme = useSelectTheme();
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 outline-none transition",
        theme === "dark"
          ? "text-white bg-transparent hover:bg-white/10 focus:bg-white/10 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-cyan-400 data-[state=checked]:text-white"
          : "text-ink hover:bg-black/[0.06] focus:bg-black/[0.06] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-cyan-500 data-[state=checked]:text-white",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator />
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = "SelectItem";
