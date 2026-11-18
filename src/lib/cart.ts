"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Line } from "./pricing";

const same = (a: Line, b: Line) => a.productId === b.productId && a.option === b.option;
export const useCart = create<{ lines: Line[]; add: (l: Line) => void; setQty: (l: Line, q: number) => void; remove: (l: Line) => void; clear: () => void }>()(
  persist((set) => ({
    lines: [],
    add: (l) => set(s => s.lines.some(x => same(x, l))
      ? { lines: s.lines.map(x => same(x, l) ? { ...x, quantity: x.quantity + l.quantity } : x) }
      : { lines: [...s.lines, l] }),
    setQty: (l, q) => set(s => ({ lines: s.lines.map(x => same(x, l) ? { ...x, quantity: Math.max(1, q) } : x) })),
    remove: (l) => set(s => ({ lines: s.lines.filter(x => !same(x, l)) })),
    clear: () => set({ lines: [] }),
  }), { name: "cart-lele-li" })
);
