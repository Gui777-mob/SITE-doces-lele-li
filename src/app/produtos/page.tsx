import { createClient } from "@supabase/supabase-js";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 60;
export default async function Produtos({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: cats } = await db.from("categories").select("*").order("sort_order");
  let q = db.from("products").select("*, categories!inner(slug)").eq("available", true).order("sort_order");
  if (cat) q = q.eq("categories.slug", cat);
  const { data: products } = await q;
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="script text-4xl text-vivo my-6">Nossos doces</h1>
      <nav className="flex gap-2 overflow-x-auto pb-3">
        <Link href="/produtos" className="rounded-full bg-rosa px-4 py-2 font-bold">Todos</Link>
        {cats?.map(c => <Link key={c.id} href={`/produtos?cat=${c.slug}`} className="rounded-full bg-rosa px-4 py-2 font-bold">{c.name}</Link>)}
      </nav>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </main>
  );
}
