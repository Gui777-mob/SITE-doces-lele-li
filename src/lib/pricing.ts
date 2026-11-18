// Única fonte da regra de desconto (espelha discount_pct() no SQL). Só brigadeiros têm desconto.
export const discountPct = (q: number) => (q >= 200 ? 30 : q >= 100 ? 25 : q >= 50 ? 15 : 0);

export type Line = { productId: number; name: string; price: number; group: string | null; option?: string; quantity: number };

export function priceCart(lines: Line[], deliveryFee = 0) {
  const qtyByGroup: Record<string, number> = {};
  lines.forEach(l => l.group && (qtyByGroup[l.group] = (qtyByGroup[l.group] ?? 0) + l.quantity));
  let subtotal = 0, discount = 0;
  const pcts: Record<string, number> = {};
  lines.forEach(l => {
    const gross = l.price * l.quantity;
    const pct = l.group ? discountPct(qtyByGroup[l.group]) : 0;
    if (l.group) pcts[l.group] = pct;
    subtotal += gross;
    discount += Math.round(gross * pct) / 100;
  });
  return { subtotal, discount, pcts, deliveryFee, total: subtotal - discount + deliveryFee };
}
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
