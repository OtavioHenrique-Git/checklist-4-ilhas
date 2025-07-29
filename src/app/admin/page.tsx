"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";

// Import Google Fonts no topo do arquivo _app.tsx ou layout.tsx
// Exemplo (em _app.tsx): import "@fontsource/poppins/500.css"; // npm install @fontsource/poppins
// OU use <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet" />

const verde = "#173921";
const amarelo = "#D4B233";

const adminEmails = [
  "suporte@postos4ilhas.com.br",
  "guilherme@postos4ilhas.com.br",
  "compras@postos4ilhas.com.br",
];

export default function AdminPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const email = (user?.email || "").trim().toLowerCase();
      setUserEmail(email);
      if (!email) {
        router.replace("/login");
      } else if (!adminEmails.includes(email)) {
        router.replace("/checklist");
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  function handleChecklist() {
    router.push("/checklist");
  }

  async function buscarRelatorios() {
    setBuscando(true);
    let q: any = collection(db, "checklists");
    let filtros: any[] = [];
    if (dataInicio) {
      filtros.push(where("criadoEm", ">=", Timestamp.fromDate(new Date(dataInicio + "T00:00:00"))));
    }
    if (dataFim) {
      filtros.push(where("criadoEm", "<=", Timestamp.fromDate(new Date(dataFim + "T23:59:59"))));
    }
    if (filtroEmail.trim() !== "") {
      filtros.push(where("email", "==", filtroEmail.trim().toLowerCase()));
    }
    if (filtros.length > 0) {
      q = query(q, ...filtros, orderBy("criadoEm", "desc"));
    } else {
      q = query(q, orderBy("criadoEm", "desc"));
    }
    const snap = await getDocs(q);
    setResultados(snap.docs.map(d => d.data()));
    setBuscando(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <span style={{ color: verde, fontWeight: 700 }}>Carregando...</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f7f9fa] flex flex-col items-center px-2 py-6 w-full"
      style={{
        fontFamily: "'Poppins', 'Segoe UI', 'Inter', Arial, sans-serif",
      }}
    >
      {/* Header premium */}
      <header className="w-full max-w-2xl flex flex-col items-center mb-5">
        <img
          src="/logo.jpeg"
          alt="Logo"
          className="w-28 h-28 mb-3 rounded-2xl shadow-lg object-contain"
          style={{
            border: "3.5px solid #d4b23322",
            background: "#fff",
            boxShadow: "0 4px 32px 0 #17392121",
          }}
        />
        <h1
          className="text-3xl md:text-4xl font-bold text-center mb-1"
          style={{
            color: verde,
            letterSpacing: "-1px",
            fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
            textShadow: "0 2px 8px #D4B23311, 0 0.5px 1px #fff",
          }}
        >
          Painel do TI/Diretor
        </h1>
        <span
          className="text-base text-gray-500 font-medium mb-2"
          style={{
            wordBreak: "break-all",
            fontFamily: "'Poppins', Arial, sans-serif",
            opacity: 0.92,
          }}
        >
          {userEmail}
        </span>
      </header>

      {/* Filtros */}
      <section className="w-full max-w-2xl flex flex-col md:flex-row gap-2 md:gap-4 items-center mb-3">
        <div className="flex flex-col w-full">
          <label className="font-semibold text-sm mb-1" style={{ color: verde }}>Início</label>
          <input
            type="date"
            className="border p-2 rounded-lg text-base"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            style={{ borderColor: amarelo, background: "#fcfcfc" }}
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold text-sm mb-1" style={{ color: verde }}>Fim</label>
          <input
            type="date"
            className="border p-2 rounded-lg text-base"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            style={{ borderColor: amarelo, background: "#fcfcfc" }}
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold text-sm mb-1" style={{ color: verde }}>E-mail (opcional)</label>
          <input
            type="text"
            placeholder="exemplo@email.com"
            className="border p-2 rounded-lg text-base"
            value={filtroEmail}
            onChange={e => setFiltroEmail(e.target.value)}
            style={{ borderColor: amarelo, background: "#fcfcfc" }}
          />
        </div>
      </section>

      {/* Botões */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-3 mb-3">
        <button
          className="flex-1"
          style={{
            background: verde,
            color: amarelo,
            fontWeight: "bold",
            fontSize: "1.13rem",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 2.5px 14px #17392118",
            transition: "0.2s",
          }}
          onClick={buscarRelatorios}
          type="button"
        >
          Buscar Relatórios
        </button>
        <button
          className="flex-1"
          style={{
            background: amarelo,
            color: verde,
            fontWeight: "bold",
            fontSize: "1.13rem",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 2.5px 14px #d4b23319",
            transition: "0.2s",
          }}
          onClick={handleChecklist}
          type="button"
        >
          Preencher Checklist
        </button>
      </div>
      <button
        className="text-sm text-gray-400 hover:underline mb-8"
        type="button"
        onClick={() => signOut(auth).then(() => (window.location.href = "/login"))}
        style={{ width: "100%", textAlign: "center" }}
      >
        Sair
      </button>

      {/* Resultados */}
      <main className="w-full max-w-2xl flex flex-col gap-7">
        {buscando && (
          <div className="text-gray-500 mb-4 text-center">Buscando...</div>
        )}
        {resultados.length > 0 ? (
          resultados.map((r, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow bg-[#f8fff9] border border-green-100 p-4 md:p-6 w-full transition-all"
              style={{
                fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
                boxShadow: "0 2px 18px #17392115",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-1">
                <span className="font-bold text-lg md:text-xl text-green-900 block mb-1 md:mb-0" style={{ color: verde, wordBreak: "break-all" }}>
                  {r.email}
                </span>
                <span className="text-xs text-gray-400 font-semibold text-right">
                  {r.criadoEm?.toDate?.().toLocaleString?.() || "-"}
                </span>
              </div>
              <div className="mt-1">
                <span className="font-bold text-green-900 text-base">Respostas:</span>
                <div className="flex flex-col gap-2 mt-2">
                  {r.respostas && r.respostas.map?.((resp: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg border border-green-50 shadow-sm p-2 flex flex-col w-full"
                    >
                      <div className="flex flex-row items-center gap-2">
                        <span className="font-bold text-green-900">{i + 1}.</span>
                        <span className="font-medium text-gray-800">
                          Nota <span style={{ color: verde, fontWeight: 700 }}>{resp.nota}</span>
                        </span>
                      </div>
                      {resp.observacao && resp.observacao.trim() && (
                        <span className="mt-1 text-gray-700 text-xs">
                          <span className="font-semibold text-green-900">Obs:</span> {resp.observacao}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : !buscando ? (
          <div className="text-gray-400 text-center">Nenhum checklist encontrado nesse período.</div>
        ) : null}
      </main>
    </div>
  );
}
