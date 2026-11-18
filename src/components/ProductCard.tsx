"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/pricing";

export type Product = { id: number; name: string; description?: string; price: number; image_url?: string; discount_group: string | null; options: string[] };

export default function ProductCard({ p }: { p: Product }) {
  const add = useCart(s => s.add);
  const step = p.discount_group ? 5 : 1;
  const [qty, setQty] = useState(p.discount_group ? 25 : 1);
  const [option, setOption] = useState(p.options[0]);
  return (
    <div className="rounded-3xl bg-white p-4 shadow-md shadow-rosa flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-full border-4 border-choco bg-rosa mx-auto w-full max-w-[220px]">
        {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
      </div>
      <h3 className="font-bold text-lg">{p.name}</h3>
      {p.description && <p className="text-sm opacity-80">{p.description}</p>}
      <p className="text-xl font-bold text-vivo">{brl(p.price)}</p>
      {p.discount_group && <p className="text-xs">A partir de 50 un.: até 30% de desconto 💕</p>}
      {p.options.length > 0 && (
        <select value={option} onChange={e => setOption(e.target.value)} className="rounded-full border border-queimado px-3 py-2">
          {p.options.map(o => <option key={o}>{o}</option>)}
        </select>
      )}
      <div className="flex items-center gap-2">
        <button onClick={() => setQty(Math.max(1, qty - step))} className="h-10 w-10 rounded-full bg-rosa font-bold">−</button>
        <span className="w-10 text-center font-bold">{qty}</span>
        <button onClick={() => setQty(qty + step)} className="h-10 w-10 rounded-full bg-rosa font-bold">+</button>
      </div>
      <button onClick={() => add({ productId: p.id, name: p.name, price: p.price, group: p.discount_group, option, quantity: qty })}
        className="rounded-full bg-choco py-3 font-bold text-white">Adicionar ao pedido</button>
    </div>
  );
}
