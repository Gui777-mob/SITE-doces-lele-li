"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

export default function Header() {
  const path = usePathname();
  const count = useCart(s => s.lines.length);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []); // evita erro de hidratação (carrinho vem do navegador)
  if (path.startsWith("/admin")) return null;
  const badge = ready && count > 0 ? count : null;
  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/90 px-4 py-3 backdrop-blur shadow-sm">
        <Link href="/" className="script text-xl text-choco">Doces da <span className="text-vivo">Lê & Li</span></Link>
        <nav className="flex items-center gap-4 font-bold">
          <Link href="/produtos">Produtos</Link>
          <Link href="/carrinho" className="relative rounded-full bg-rosa px-4 py-2">🛒 Carrinho
            {badge && <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-vivo text-xs text-white">{badge}</span>}
          </Link>
        </nav>
      </header>
      {badge && (
        <Link href="/carrinho" className="fixed bottom-4 right-4 z-20 rounded-full bg-choco px-5 py-3 font-bold text-white shadow-lg sm:hidden">
          🛒 Ver carrinho ({badge})
        </Link>
      )}
    </>
  );
}
