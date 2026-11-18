"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { priceCart, brl } from "@/lib/pricing";

export default function Carrinho() {
  const { lines, setQty, remove } = useCart();
  const t = priceCart(lines); // taxa de entrega entra no checkout
  const pct = Math.max(0, ...Object.values(t.pcts));
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="script text-4xl text-vivo my-6">Seu pedido</h1>
      {lines.length === 0 && <p>Seu carrinho está vazio. <Link href="/produtos" className="underline">Ver produtos</Link></p>}
      {lines.map(l => (
        <div key={l.productId + (l.option ?? "")} className="mb-3 flex items-center justify-between rounded-3xl bg-white p-4 shadow">
          <div><b>{l.name}</b>{l.option && <div className="text-sm">{l.option}</div>}<div className="text-sm">{brl(l.price)} un.</div></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(l, l.quantity - 1)} className="h-8 w-8 rounded-full bg-rosa">−</button>
            <span>{l.quantity}</span>
            <button onClick={() => setQty(l, l.quantity + 1)} className="h-8 w-8 rounded-full bg-rosa">+</button>
            <button onClick={() => remove(l)} aria-label="Remover">🗑️</button>
          </div>
        </div>
      ))}
      {lines.length > 0 && (
        <div className="rounded-3xl bg-rosa p-4 space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{brl(t.subtotal)}</span></div>
          {t.discount > 0 && <div className="flex justify-between text-vivo"><span>Desconto brigadeiros{pct ? ` (${pct}%)` : ""}</span><span>− {brl(t.discount)}</span></div>}
          <div className="flex justify-between text-xl font-bold"><span>Total</span><span>{brl(t.total)}</span></div>
          <Link href="/finalizar" className="mt-3 block rounded-full bg-choco py-3 text-center font-bold text-white">Continuar pedido</Link>
        </div>
      )}
    </main>
  );
}
