"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/supabase-browser";

const inp = "w-full rounded-2xl border border-queimado bg-white px-4 py-3";
const empty = { name: "", description: "", price: "", category_id: "", image_url: "", available: true, featured: false, options: "" };

export default function ProdutoForm() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const novo = id === "novo";
  const [f, setF] = useState(empty); const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false); const [erro, setErro] = useState("");
  useEffect(() => {
    db.from("categories").select("id,name").order("sort_order").then(({ data }) => setCats(data ?? []));
    if (!novo) db.from("products").select("*").eq("id", id).single().then(({ data: d }) => d &&
      setF({ ...empty, ...d, price: String(d.price), category_id: String(d.category_id), description: d.description ?? "", image_url: d.image_url ?? "", options: (d.options ?? []).join(", ") }));
  }, [id, novo]);

  async function salvar() {
    const price = Number(f.price.replace(",", "."));
    if (!f.name.trim() || !price || !f.category_id) return setErro("Preencha nome, preço e categoria.");
    setBusy(true); setErro("");
    let image_url = f.image_url || null;
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^\w.]/g, "_")}`;
      const { error } = await db.storage.from("produtos").upload(path, file);
      if (error) { setBusy(false); return setErro("Não foi possível enviar a foto."); }
      image_url = db.storage.from("produtos").getPublicUrl(path).data.publicUrl;
    }
    // Ofertas por quantidade (brigadeiros) são ligadas pelo campo discount_group, que este formulário não altera.
    const row = { name: f.name.trim(), description: f.description || null, price, category_id: Number(f.category_id), image_url,
      available: f.available, featured: f.featured, options: f.options.split(",").map(s => s.trim()).filter(Boolean) };
    const { error } = novo ? await db.from("products").insert(row) : await db.from("products").update(row).eq("id", id);
    if (error) { setBusy(false); return setErro("Erro ao salvar o produto."); }
    router.push("/admin/produtos");
  }

  return (
    <div className="mx-auto max-w-xl space-y-3">
      <h1 className="script my-4 text-3xl text-vivo">{novo ? "Novo produto" : "Editar produto"}</h1>
      <input className={inp} placeholder="Nome" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      <textarea className={inp} rows={3} placeholder="Descrição" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <input className={inp} placeholder="Preço (ex.: 95,00)" inputMode="decimal" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
      <select className={inp} value={f.category_id} onChange={e => setF({ ...f, category_id: e.target.value })}>
        <option value="">Categoria...</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input className={inp} placeholder="Sabores, separados por vírgula (opcional)" value={f.options} onChange={e => setF({ ...f, options: e.target.value })} />
      <div>
        {f.image_url && !file && <img src={f.image_url} alt="" className="mb-2 h-24 w-24 rounded-full border-2 border-choco object-cover" />}
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={f.available} onChange={e => setF({ ...f, available: e.target.checked })} /> Disponível para compra</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={e => setF({ ...f, featured: e.target.checked })} /> Destaque na página inicial</label>
      {erro && <p className="text-red-600">{erro}</p>}
      <button disabled={busy} onClick={salvar} className="w-full rounded-full bg-choco py-3 font-bold text-white disabled:opacity-40">{busy ? "Salvando..." : "Salvar"}</button>
    </div>
  );
}
