"use client";
import { usePathname } from "next/navigation";
export default function Footer() {
  if (usePathname().startsWith("/admin")) return null;
  return (
    <footer className="mt-16">
      <div className="scallop-up" />
      <div className="bg-queimado px-4 pb-10 pt-4 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:justify-between">
          <p className="script text-lg">Aceitamos pix e dinheiro 💕</p>
          <div>
            <p className="script text-lg">Faça sua encomenda!</p>
            <a href="https://wa.me/5535988290466" className="block text-xl font-bold">(35) 98829-0466</a>
            <a href="https://wa.me/5535998177706" className="block text-xl font-bold">(35) 99817-7706</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
