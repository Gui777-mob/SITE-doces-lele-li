"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/supabase-browser";
import { brl } from "@/lib/pricing";

type P = { id: number; name: string; price: number; image_url: string | null; available: boolean; categories: { name: string } | null };

export default function Produtos() {
  const [list, setList] = useState<P[]>([]);
  const load = () => db.from("products").select("id,name,price,image_url,available,categories(name)").order("category_id").order("id").then(({ data }) => setList((data as any) ?? []));
  useEffect(() => { load(); }, []);
  async function toggle(p: P) { await db.from("products").update({ available: !p.available }).eq("id", p.id); load(); }
  async function excluir(p: P) { if (confirm(`Excluir "${p.name}"?`)) { await db.from("products").delete().eq("id", p.id); load(); } }
  return (
    <>
      <div className="my-4 flex items-center justify-between">
        <h1 className="script text-3xl text-vivo">Produtos</h1>
        <Link href="/admin/produtos/novo" className="rounded-full bg-choco px-5 py-3 font-bold text-white">+ Adicionar produto</Link>
      </div>
      <div className="space-y-3">
        {list.map(p => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3 shadow">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-choco bg-rosa">{p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1"><b>{p.name}</b><div className="text-sm">{p.categories?.name} · {brl(p.price)}</div></div>
            <button onClick={() => toggle(p)} className={`rounded-full px-4 py-2 text-sm font-bold ${p.available ? "bg-green-100" : "bg-gray-200"}`}>{p.available ? "Disponível" : "Indisponível"}</button>
            <Link href={`/admin/produtos/${p.id}`} className="rounded-full bg-rosa px-4 py-2 font-bold">Editar</Link>
            <button onClick={() => excluir(p)} className="rounded-full bg-red-100 px-4 py-2 font-bold">Excluir</button>
          </div>
        ))}
      </div>
    </>
  );
}
