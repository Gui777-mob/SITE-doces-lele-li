import { supabase, WHATSAPP } from "@/lib/supabase";
import { brl } from "@/lib/pricing";
import Link from "next/link";

export const dynamic = "force-dynamic";
type Item = { id: number; product_name: string; option: string | null; quantity: number; line_total: number };

export default async function Pedido({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data: o } = await supabase.rpc("get_order", { p_token: token });
  if (!o) return <main className="p-6">Pedido não encontrado. <Link href="/" className="underline">Voltar</Link></main>;

  const a = o.address;
  const msg = [
    `Olá! Fiz o pedido #${o.number} no site.`,
    ...o.items.map((i: Item) => `${i.quantity}x ${i.product_name}${i.option ? ` (${i.option})` : ""} - ${brl(i.line_total)}`),
    `Total: ${brl(o.total)}`, `Pagamento: ${o.payment_method}`,
    o.delivery_type === "entrega" ? `Entrega: ${a?.rua}, ${a?.numero} - ${a?.bairro}` : "Retirada no local",
  ].join("\n");

  return (
    <main className="mx-auto max-w-xl p-4 pb-16">
      <h1 className="script text-4xl text-vivo my-6">Pedido recebido! 💕</h1>
      <div className="rounded-3xl bg-white p-5 shadow space-y-2">
        <p className="text-2xl font-bold">PEDIDO #{o.number}</p>
        {o.items.map((i: Item) => (
          <div key={i.id} className="flex justify-between gap-2">
            <span>{i.quantity}x {i.product_name}{i.option ? ` (${i.option})` : ""}</span><span>{brl(i.line_total)}</span>
          </div>
        ))}
        <hr className="border-rosa" />
        <div className="flex justify-between"><span>Subtotal</span><span>{brl(o.subtotal)}</span></div>
        {o.discount_total > 0 && <div className="flex justify-between text-vivo"><span>Desconto</span><span>− {brl(o.discount_total)}</span></div>}
        <div className="flex justify-between"><span>Entrega</span><span>{brl(o.delivery_fee)}</span></div>
        <div className="flex justify-between text-xl font-bold"><span>TOTAL</span><span>{brl(o.total)}</span></div>
        <hr className="border-rosa" />
        <p>Cliente: {o.customer_name}</p><p>Pagamento: {o.payment_method}</p>
        <p>Recebimento: {o.delivery_type === "entrega" ? "Entrega" : "Retirada no local"}</p>
        {a && <p>Endereço: {a.rua}, {a.numero} - {a.bairro}, {a.cidade}</p>}
        {o.notes && <p>Obs.: {o.notes}</p>}
      </div>
      <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`} target="_blank"
        className="mt-4 block rounded-full bg-vivo py-3 text-center font-bold text-white">Enviar pelo WhatsApp</a>
      <Link href="/produtos" className="mt-3 block text-center underline">Fazer outro pedido</Link>
    </main>
  );
}
