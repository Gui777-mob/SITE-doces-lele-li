import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

const categories = [
  { slug: "paves", name: "Pavês", icon: "🍰" },
  { slug: "brigadeiros", name: "Brigadeiros", icon: "🍫" },
  { slug: "trufas", name: "Trufas", icon: "🍬" },
  { slug: "bombons", name: "Bombons", icon: "🍓" },
];

export default async function Home() {
  const { data: featured } = await supabase.from("products").select("*").eq("available", true).eq("featured", true).order("sort_order").limit(4);
  return (
    <main>
      <section className="bg-salmao px-4 pt-10 text-center">
        <div className="mx-auto mb-6 grid h-40 w-40 place-items-center rounded-full border-4 border-dotted border-choco bg-rosa ring-8 ring-rosa/60">
          <span className="script text-3xl leading-tight text-choco">Doces da<br /><span className="text-vivo">Lê & Li</span></span>
        </div>
        <h1 className="script mx-auto max-w-md text-3xl text-choco">Doces artesanais feitos com muito carinho 💕</h1>
        <p className="mx-auto mt-3 max-w-md">Pavês, brigadeiros, trufas e bombons para adoçar o seu dia. Monte seu pedido em poucos toques.</p>
        <Link href="/produtos" className="mt-6 inline-block rounded-full bg-choco px-8 py-3 text-lg font-bold text-white shadow-lg">Ver produtos</Link>
        <div className="scallop-down mt-10" style={{ marginBottom: -1 }} />
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-12">
        <h2 className="script mb-5 text-3xl text-vivo">Categorias</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map(c => (
            <Link key={c.slug} href={`/produtos?cat=${c.slug}`} className="rounded-3xl bg-white p-5 text-center shadow-md shadow-rosa transition hover:-translate-y-1">
              <div className="text-4xl">{c.icon}</div>
              <div className="mt-2 font-bold">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-12">
          <h2 className="script mb-5 text-3xl text-vivo">Nossos queridinhos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <section className="mx-auto mt-12 max-w-3xl rounded-3xl bg-rosa p-6 text-center">
        <p className="script text-2xl text-choco">Brigadeiros para festa?</p>
        <p className="mt-2">A partir de 50 unidades você ganha desconto: 15% (50), 25% (100) e 30% (200 ou mais). O desconto aparece direto no carrinho.</p>
      </section>
    </main>
  );
}
