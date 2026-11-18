"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/supabase-browser";
import { brl } from "@/lib/pricing";
import { STATUS } from "@/lib/status";

type O = { id: number; number: number; customer_name: string; created_at: string; total: number; payment_method: string; delivery_type: string; status: string };

export default function Pedidos() {
  const [list, setList] = useState<O[]>([]);
  useEffect(() => { db.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setList(data ?? [])); }, []);
  async function mudar(o: O, status: string) {
    await db.from("orders").update({ status }).eq("id", o.id);
    setList(l => l.map(x => x.id === o.id ? { ...x, status } : x));
  }
  return (
    <>
      <h1 className="script my-4 text-3xl text-vivo">Pedidos</h1>
      <div className="space-y-3">
        {list.length === 0 && <p>Nenhum pedido ainda.</p>}
        {list.map(o => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow">
            <Link href={`/admin/pedidos/${o.id}`} className="min-w-0 flex-1">
              <b>#{o.number} · {o.customer_name}</b>
              <div className="text-sm">{new Date(o.created_at).toLocaleString("pt-BR")} · {brl(o.total)} · {o.payment_method} · {o.delivery_type === "entrega" ? "Entrega" : "Retirada"}</div>
            </Link>
            <select value={o.status} onChange={e => mudar(o, e.target.value)} className="rounded-full border border-queimado bg-rosa px-3 py-2 font-bold">
              {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
      </div>
    </>
  );
}
