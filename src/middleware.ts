import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Só entra em /admin quem está logado E consta em admin_profiles.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => { list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  let ok = false;
  if (user) { const { data } = await sb.from("admin_profiles").select("user_id").eq("user_id", user.id).maybeSingle(); ok = !!data; }
  const isLogin = req.nextUrl.pathname === "/admin/login";
  if (!ok && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
  if (ok && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
  return res;
}
export const config = { matcher: ["/admin/:path*"] };
