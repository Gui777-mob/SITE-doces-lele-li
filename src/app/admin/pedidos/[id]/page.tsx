"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/supabase-browser";
import { brl } from "@/lib/pricing";
import { STATUS } from "@/lib/status";

export default function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [o, setO] = useState<any>(null);
  useEffect(() => { db.from("orders").select("*, order_items(*)").eq("id", id).single().then(({ data }) => setO(data)); }, [id]);
  if (!o) return <p className="p-4">Carregando...</p>;
  const a = o.address;
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/pedidos" className="underline">← Pedidos</Link>
      <div className="mt-3 space-y-2 rounded-3xl bg-white p-5 shadow">
        <p className="text-2xl font-bold">Pedido #{o.number}</p>
        <select value={o.status} onChange={async e => { await db.from("orders").update({ status: e.target.value }).eq("id", o.id); setO({ ...o, status: e.target.value }); }}
          className="rounded-full border border-queimado bg-rosa px-3 py-2 font-bold">
          {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <p>Cliente: {o.customer_name}</p>
        <p>Telefone: <a className="underline" href={`https://wa.me/55${o.phone.replace(/\D/g, "")}`}>{o.phone}</a></p>
        <hr className="border-rosa" />
        {o.order_items.map((i: any) => <div key={i.id} className="flex justify-between"><span>{i.quantity}x {i.product_name}{i.option ? ` (${i.option})` : ""}</span><span>{brl(i.line_total)}</span></div>)}
        <hr className="border-rosa" />
        <div className="flex justify-between"><span>Subtotal</span><span>{brl(o.subtotal)}</span></div>
        {o.discount_total > 0 && <div className="flex justify-between"><span>Desconto</span><span>− {brl(o.discount_total)}</span></div>}
        <div className="flex justify-between"><span>Taxa de entrega</span><span>{brl(o.delivery_fee)}</span></div>
        <div className="flex justify-between text-xl font-bold"><span>Total</span><span>{brl(o.total)}</span></div>
        <hr className="border-rosa" />
        <p>Pagamento: {o.payment_method}</p>
        <p>Recebimento: {o.delivery_type === "entrega" ? "Entrega" : "Retirada no local"}</p>
        {a && <p>Endereço: {a.rua}, {a.numero} - {a.bairro}, {a.cidade}{a.cep ? ` · CEP ${a.cep}` : ""}{a.complemento ? ` · ${a.complemento}` : ""}{a.referencia ? ` · Ref.: ${a.referencia}` : ""}</p>}
        {o.notes && <p>Observações: {o.notes}</p>}
      </div>
    </div>
  );
}
