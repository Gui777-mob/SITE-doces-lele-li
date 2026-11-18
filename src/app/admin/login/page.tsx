"use client";
import { useState } from "react";
import { db } from "@/lib/supabase-browser";

export default function Login() {
  const [email, setEmail] = useState(""); const [senha, setSenha] = useState(""); const [msg, setMsg] = useState("");
  async function entrar() {
    setMsg("Entrando...");
    const { data, error } = await db.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) return setMsg("Erro no login: " + error.message);
    const { data: perfil, error: e2 } = await db.from("admin_profiles").select("user_id").eq("user_id", data.user.id).maybeSingle();
    setMsg(`Login ok. Administrador: ${perfil ? "sim" : "NÃO"}${e2 ? " | erro: " + e2.message : ""}`);
    if (perfil) window.location.href = "/admin";
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-6 shadow">
        <h1 className="script text-3xl text-vivo">Painel da Lê & Li</h1>
        <input className="w-full rounded-full border border-queimado px-4 py-3" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full rounded-full border border-queimado px-4 py-3" type="password" placeholder="Senha" value={senha}
          onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && entrar()} />
        {msg && <p className="text-sm">{msg}</p>}
        <button onClick={entrar} className="w-full rounded-full bg-choco py-3 font-bold text-white">Entrar</button>
      </div>
    </main>
  );
}
