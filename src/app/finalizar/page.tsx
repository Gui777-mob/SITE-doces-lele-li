"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { priceCart, brl } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

const input = "w-full rounded-full border border-queimado bg-white px-4 py-3";
const addrFields = [["cep", "CEP"], ["rua", "Rua"], ["numero", "Número"], ["bairro", "Bairro"], ["complemento", "Complemento"], ["referencia", "Ponto de referência"], ["cidade", "Cidade"]] as const;

export default function Finalizar() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [step, setStep] = useState<"dados" | "resumo">("dados");
  const [fee, setFee] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({ nome: "", telefone: "", pagamento: "Pix", entrega: "retirada", obs: "" });
  const [addr, setAddr] = useState<Record<string, string>>({});

  useEffect(() => { supabase.from("settings").select("value").eq("key", "delivery_fee").single().then(({ data }) => data && setFee(Number(data.value))); }, []);

  const isDelivery = f.entrega === "entrega";
  const t = priceCart(lines, isDelivery ? fee : 0);
  const missingAddr = isDelivery && ["rua", "numero", "bairro", "cidade"].some(k => !addr[k]?.trim());
  const invalid = !f.nome.trim() || f.telefone.replace(/\D/g, "").length < 10 || missingAddr;

  if (lines.length === 0) return <main className="p-6">Carrinho vazio. <Link href="/produtos" className="underline">Ver produtos</Link></main>;

  async function confirmar() {
    setBusy(true); setError("");
    const { data, error } = await supabase.rpc("create_order", {
      p_customer: f.nome.trim(), p_phone: f.telefone, p_payment: f.pagamento, p_delivery: f.entrega,
      p_address: isDelivery ? addr : null, p_notes: f.obs || null,
      p_items: lines.map(l => ({ product_id: l.productId, option: l.option ?? null, quantity: l.quantity })),
    });
    if (error) { setError("Não foi possível salvar o pedido. Tente novamente."); setBusy(false); return; }
    clear();
    router.push(`/pedido/${data}`);
  }

  return (
    <main className="mx-auto max-w-xl p-4 pb-16">
      <h1 className="script text-4xl text-vivo my-6">{step === "dados" ? "Seus dados" : "Confirme seu pedido"}</h1>

      {step === "dados" && (
        <div className="space-y-3">
          <input className={input} placeholder="Nome" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} />
          <input className={input} placeholder="Telefone (com DDD)" inputMode="tel" value={f.telefone} onChange={e => setF({ ...f, telefone: e.target.value })} />
          <select className={input} value={f.pagamento} onChange={e => setF({ ...f, pagamento: e.target.value })}>
            <option>Pix</option><option>Dinheiro</option><option>Cartão</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            {[["retirada", "Retirada no local"], ["entrega", "Entrega"]].map(([v, l]) => (
              <button key={v} onClick={() => setF({ ...f, entrega: v })}
                className={`rounded-full py-3 font-bold ${f.entrega === v ? "bg-choco text-white" : "bg-rosa"}`}>{l}</button>
            ))}
          </div>
          {isDelivery && addrFields.map(([k, label]) => (
            <input key={k} className={input} placeholder={label} value={addr[k] ?? ""} onChange={e => setAddr({ ...addr, [k]: e.target.value })} />
          ))}
          <textarea className="w-full rounded-3xl border border-queimado bg-white px-4 py-3" rows={3}
            placeholder="Observações do pedido (ex.: entregar depois das 18h)" value={f.obs} onChange={e => setF({ ...f, obs: e.target.value })} />
          <button disabled={invalid} onClick={() => setStep("resumo")}
            className="w-full rounded-full bg-choco py-3 font-bold text-white disabled:opacity-40">Revisar pedido</button>
        </div>
      )}

      {step === "resumo" && (
        <div className="rounded-3xl bg-white p-5 shadow space-y-2">
          {lines.map(l => (
            <div key={l.productId + (l.option ?? "")} className="flex justify-between gap-2">
              <span>{l.quantity}x {l.name}{l.option ? ` (${l.option})` : ""}</span><span>{brl(l.price * l.quantity)}</span>
            </div>
          ))}
          <hr className="border-rosa" />
          <div className="flex justify-between"><span>Subtotal</span><span>{brl(t.subtotal)}</span></div>
          {t.discount > 0 && <div className="flex justify-between text-vivo"><span>Desconto brigadeiros</span><span>− {brl(t.discount)}</span></div>}
          <div className="flex justify-between"><span>Entrega</span><span>{brl(t.deliveryFee)}</span></div>
          <div className="flex justify-between text-xl font-bold"><span>Total</span><span>{brl(t.total)}</span></div>
          <hr className="border-rosa" />
          <p>Cliente: {f.nome}</p><p>Pagamento: {f.pagamento}</p>
          <p>Recebimento: {isDelivery ? "Entrega" : "Retirada no local"}</p>
          {isDelivery && <p>Endereço: {addr.rua}, {addr.numero} - {addr.bairro}, {addr.cidade}{addr.complemento ? ` (${addr.complemento})` : ""}</p>}
          {f.obs && <p>Obs.: {f.obs}</p>}
          {error && <p className="text-red-600">{error}</p>}
          <button disabled={busy} onClick={confirmar} className="mt-2 w-full rounded-full bg-choco py-3 font-bold text-white disabled:opacity-40">
            {busy ? "Enviando..." : "Confirmar pedido"}</button>
          <button onClick={() => setStep("dados")} className="w-full py-2 underline">Voltar e editar</button>
        </div>
      )}
    </main>
  );
}
