// src/app/admin/page.tsx
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

const perguntas = [
  "Limpeza e organização do Pátio",
  "Limpeza e Organização dos banheiros",
  "Organização da frente de Caixa - PDV",
  "Layout, abastecimento e organização do expositor de cigarros e acessórios",
  "Abastecimento, exposição e precificação de mercadorias em loja",
  "Manutenção do Mapa de Cigarros",
  "Manutenção da contagem 80/20",
  "Depósito da loja e troca de mercadorias",
  "Padrão de exposição e mix do balcão de doces e salgados",
  "Organização, limpeza das mesas da área do café e som ambiente",
  "Prazos de rotinas administrativas e financeiras",
  "Apresentação geral da Filial",
];

const camposEntregaveis = [
  "Positivação de clientes",
  "Nº de frentistas",
  "Entrada de colaboradores",
  "Saída de colaboradores",
  "Contagem Semanal",
  "Listas de Contagens 80/20",
  "Mapa de cigarros em dia?",
  "Pontos assinados para folha de pagamento",
  "Pontos assinados para rescisão",
  "Planilha de Controle de Uniformes",
  "Boletos semanais",
  "Caixas semanal/ mensal para fechamento da folha",
  "Planilha de Controle de Validades",
  "Vendas semanais divulgada no mural",
  "Reunião Mensal agendada (colocar data)",
];

const verde = "#173921";
const amarelo = "#D4B233";

const adminEmails = [
  "suporte@postos4ilhas.com.br",
  "guilherme@postos4ilhas.com.br",
  "compras@postos4ilhas.com.br",
  "rosany.4ilhas@gmail.com",
];

function corDaNota(nota: number) {
  if (nota <= 2) return "#ef4444";
  if (nota === 3) return "#fbbf24";
  return "#22c55e";
}

export default function AdminPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState<any[]>([]);
  const [resultadosEntregaveis, setResultadosEntregaveis] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscandoEntregaveis, setBuscandoEntregaveis] = useState(false);
  const [aba, setAba] = useState<"relatorios" | "entregaveis">("relatorios");

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
    setAba("relatorios");
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
    setResultados(snap.docs.map((d) => d.data()));
    setBuscando(false);
  }

  async function buscarEntregaveis() {
    setAba("entregaveis");
    setBuscandoEntregaveis(true);
    let q: any = collection(db, "entregaveis");
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
    setResultadosEntregaveis(snap.docs.map((d) => d.data()));
    setBuscandoEntregaveis(false);
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
      style={{ fontFamily: "'Poppins', 'Segoe UI', 'Inter', Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="w-full max-w-2xl flex flex-col items-center mb-5">
        <img
          src="/logo.jpeg"
          alt="Logo"
          className="w-32 h-32 mb-2 rounded-2xl shadow-lg object-contain"
          style={{
            border: "3.5px solid #d4b23335",
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
            textShadow: "0 2px 8px #D4B23312, 0 0.5px 1px #fff",
          }}
        >
          Painel do TI/Diretor
        </h1>
        <span
          className="text-base text-gray-500 font-medium mb-2"
          style={{ wordBreak: "break-all", fontFamily: "'Poppins', Arial, sans-serif", opacity: 0.92 }}
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
            onChange={(e) => setDataInicio(e.target.value)}
            style={{ borderColor: amarelo, background: "#fcfcfc" }}
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold text-sm mb-1" style={{ color: verde }}>Fim</label>
          <input
            type="date"
            className="border p-2 rounded-lg text-base"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
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
            onChange={(e) => setFiltroEmail(e.target.value)}
            style={{ borderColor: amarelo, background: "#fcfcfc" }}
          />
        </div>
      </section>

      {/* Botões principais */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-3 mb-3">
        <button
          className={`flex-1 ${aba === "relatorios" ? "ring-2 ring-green-600" : ""}`}
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
        <button
          className={`flex-1 ${aba === "entregaveis" ? "ring-2 ring-yellow-600" : ""}`}
          style={{
            background: "#fffbe5",
            color: verde,
            fontWeight: "bold",
            fontSize: "1.13rem",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 2.5px 14px #d4b23319",
            transition: "0.2s",
            border: "1.8px solid #D4B233",
          }}
          onClick={buscarEntregaveis}
          type="button"
        >
          Buscar Entregáveis
        </button>
      </div>

      {/* Relatórios extras */}
      <div className="w-full max-w-2xl flex flex-col gap-2 mb-4">
        {/* Quebras */}
        <button
          style={{
            background: "#fffbe5",
            color: verde,
            fontWeight: "bold",
            fontSize: "1.13rem",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 2.5px 14px #d4b23319",
            border: "1.8px solid #D4B233",
          }}
          onClick={() => router.push("/admin/quebras")}
          type="button"
        >
          Ver Relatório de Quebras
        </button>

        {/* MONITORAMENTO — NOVO BOTÃO */}
        <button
          style={{
            background: verde,
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.13rem",
            padding: "1rem",
            borderRadius: "1rem",
            boxShadow: "0 2.5px 14px #17392118",
          }}
          onClick={() => router.push("/admin/monitoramento")}
          type="button"
        >
          Ver Monitoramento
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
        {aba === "relatorios" ? (
          buscando ? (
            <div className="text-gray-500 mb-4 text-center">Buscando...</div>
          ) : resultados.length > 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {r.respostas && r.respostas.map?.((resp: any, i: number) => (
                      <div key={i} className="bg-white rounded-lg border border-green-50 shadow-sm p-3 flex flex-col w-full">
                        <span className="font-bold text-green-900 mb-1">{i + 1}. {perguntas[i]}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex items-center justify-center rounded-full"
                            style={{
                              width: 36,
                              height: 36,
                              background: corDaNota(resp.nota),
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 20,
                              boxShadow: "0 2px 8px #17392117",
                            }}
                            title={`Nota: ${resp.nota}`}
                          >
                            {resp.nota}
                          </span>
                          <span className="font-medium text-gray-700 text-sm">
                            {resp.nota <= 2 ? "Nota baixa" : resp.nota === 3 ? "Nota regular" : "Nota boa"}
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
                  {r.respostas && r.respostas.length > 0 && (
                    <div className="mt-5 flex items-center gap-2">
                      <span className="font-semibold text-green-900 text-lg" style={{ color: verde }}>Média:</span>
                      <span
                        className="rounded-full px-4 py-1 font-bold text-lg shadow"
                        style={{
                          background: "#fff",
                          color: "#173921",
                          border: `2px solid ${corDaNota(
                            Math.round(
                              r.respostas.reduce((acc: any, curr: any) => acc + Number(curr.nota || 0), 0) /
                              r.respostas.length
                            )
                          )}`,
                          minWidth: 56,
                          textAlign: "center",
                        }}
                        title="Média das notas"
                      >
                        {(
                          r.respostas.reduce((acc: any, curr: any) => acc + Number(curr.nota || 0), 0) /
                          r.respostas.length
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center">Nenhum checklist encontrado nesse período.</div>
          )
        ) : buscandoEntregaveis ? (
          <div className="text-gray-500 mb-4 text-center">Buscando...</div>
        ) : resultadosEntregaveis.length > 0 ? (
          resultadosEntregaveis.map((r, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow bg-[#fffbe9] border border-yellow-200 p-4 md:p-6 w-full transition-all"
              style={{
                fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
                boxShadow: "0 2px 18px #D4B23322",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-1">
                <span className="font-bold text-lg md:text-xl block mb-1 md:mb-0" style={{ color: amarelo, wordBreak: "break-all" }}>
                  {r.email}
                </span>
                <span className="text-xs text-gray-400 font-semibold text-right">
                  {r.criadoEm?.toDate?.().toLocaleString?.() || "-"}
                </span>
              </div>
              <div className="mt-1">
                <span className="font-bold text-yellow-900 text-base">Entregáveis:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {camposEntregaveis.map((campo, i) => (
                    <div key={i} className="bg-white rounded-lg border border-yellow-100 shadow-sm p-3 flex flex-col w-full">
                      <span className="font-bold text-yellow-800 mb-1">{campo}</span>
                      <span className="text-sm text-gray-700">
                        {String(r.respostas?.[campo] ?? "-")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center">Nenhum entregável encontrado nesse período.</div>
        )}
      </main>
    </div>
  );
}
