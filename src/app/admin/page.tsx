"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/supabase-browser";
import { brl } from "@/lib/pricing";

export default function Dashboard() {
  const [o, setO] = useState<{ status: string; total: number }[]>([]);
  const [fee, setFee] = useState("0");
  const [salvo, setSalvo] = useState(false);
  useEffect(() => {
    db.from("orders").select("status,total").then(({ data }) => setO(data ?? []));
    db.from("settings").select("value").eq("key", "delivery_fee").single().then(({ data }) => data && setFee(data.value));
  }, []);
  const valid = o.filter(x => x.status !== "cancelado");
  const cards = [
    ["Pedidos", o.length], ["Pendentes", o.filter(x => !["entregue", "cancelado"].includes(x.status)).length],
    ["Concluídos", o.filter(x => x.status === "entregue").length], ["Valor total", brl(valid.reduce((a, x) => a + Number(x.total), 0))],
  ];
  async function salvarTaxa() {
    await db.from("settings").update({ value: String(Number(fee.replace(",", ".")) || 0) }).eq("key", "delivery_fee");
    setSalvo(true); setTimeout(() => setSalvo(false), 2000);
  }
  return (
    <>
      <h1 className="script my-4 text-3xl text-vivo">Início</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(([l, v]) => <div key={l as string} className="rounded-3xl bg-white p-5 shadow"><div className="text-sm">{l}</div><div className="text-2xl font-bold">{v}</div></div>)}
      </div>
      <p className="mt-2 text-xs">Pendentes = ainda não entregues nem cancelados. O valor total não conta cancelados.</p>
      <div className="mt-6 flex max-w-sm items-center gap-2 rounded-3xl bg-rosa p-4">
        <label className="font-bold">Taxa de entrega R$</label>
        <input className="w-24 rounded-full border border-queimado px-3 py-2" value={fee} onChange={e => setFee(e.target.value)} />
        <button onClick={salvarTaxa} className="rounded-full bg-choco px-4 py-2 font-bold text-white">{salvo ? "Salvo ✓" : "Salvar"}</button>
      </div>
    </>
  );
}
