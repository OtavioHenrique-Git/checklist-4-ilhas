// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase"; // <— AJUSTE AQUI

const verde = "#173921";
const amarelo = "#D4B233";

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setUserEmail(user.email || null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f9fa" }}>
        <div className="text-gray-600">Carregando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f9fa" }}>
      <header
        className="w-full py-10 text-center text-white"
        style={{
          background: `linear-gradient(90deg, ${verde} 0%, ${amarelo} 100%)`,
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
        }}
      >
        <h1 className="text-3xl font-bold">Diário de Verificação</h1>
        {userEmail && (
          <div className="mt-2 bg-white/15 px-3 py-1 rounded-full text-sm">
            Usuário: {userEmail}
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Link href="/entregaveis" className="block">
          <button
            className="w-full px-6 py-4 rounded-xl font-semibold shadow"
            style={{ background: amarelo, color: verde }}
          >
            Preencher Entregáveis Semanais
          </button>
        </Link>

        <Link href="/quebras" className="block">
          <button
            className="w-full px-6 py-4 rounded-xl font-semibold shadow border"
            style={{ background: "#fff", borderColor: amarelo, color: verde }}
          >
            Lançar Quebras de Pães
          </button>
        </Link>

        {/* Botão do módulo Monitoramento */}
        <Link href="/monitoramento" className="block">
          <button
            className="w-full px-6 py-4 rounded-xl font-semibold shadow"
            style={{ background: amarelo, color: verde }}
          >
            Preencher Monitoramento
          </button>
        </Link>
      </main>
    </div>
  );
}
