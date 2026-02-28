import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

import { CommandPalette } from "@/components/CommandPalette";

interface CommandPaletteContextValue {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openCommandPalette = useCallback(() => setOpen(true), []);
  const closeCommandPalette = useCallback(() => setOpen(false), []);

  return (
    <CommandPaletteContext.Provider value={{ openCommandPalette, closeCommandPalette }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}
