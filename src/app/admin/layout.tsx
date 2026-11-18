"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/supabase-browser";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/admin/login") return <>{children}</>;
  const sair = async () => { await db.auth.signOut(); window.location.href = "/admin/login"; };
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-2 overflow-x-auto bg-choco px-4 py-3 text-white">
        <span className="script mr-3 text-lg">Lê & Li</span>
        {[["/admin", "Início"], ["/admin/pedidos", "Pedidos"], ["/admin/produtos", "Produtos"]].map(([h, l]) => (
          <Link key={h} href={h} className={`rounded-full px-4 py-2 font-bold ${path === h ? "bg-vivo" : ""}`}>{l}</Link>
        ))}
        <button onClick={sair} className="ml-auto rounded-full px-4 py-2 underline">Sair</button>
      </nav>
      <div className="mx-auto max-w-5xl p-4">{children}</div>
    </div>
  );
}
