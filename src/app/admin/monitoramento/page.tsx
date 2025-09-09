// src/app/admin/monitoramento/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { isDirectorEmail } from "../../lib/roles";

const verde = "#173921";
const amarelo = "#D4B233";

type Row = {
  id: string;
  unidade: string;
  data: string; // YYYY-MM-DD
  horaAbertura: string;
  horaFechamento: string;
  houveAtraso: "nao" | "abertura" | "fechamento" | "ambos";
  motivoAtraso: string;
  camerasOk: boolean;
  ocorrenciasSeguranca: string;
  problemasGerais: string;
  acoesCorretivas: string;
  assinatura: string;
  userEmail: string;
  createdAt?: any;
};

function br(d: string) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

function atrasoLabel(v: Row["houveAtraso"]) {
  switch (v) {
    case "nao":
      return "Não";
    case "abertura":
      return "Abertura";
    case "fechamento":
      return "Fechamento";
    case "ambos":
      return "Ambos";
    default:
      return "";
  }
}

export default function AdminMonitoramentoPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState<string>("");

  const [inicio, setInicio] = useState<string>("");
  const [fim, setFim] = useState<string>("");
  const [unidadeFiltro, setUnidadeFiltro] = useState<string>("");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (!isDirectorEmail(user.email || "")) {
        router.replace("/");
        return;
      }
      setUserEmail(user.email || null);
      setLoadingUser(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErroMsg("");
        const q = query(collection(db, "monitoramento"), orderBy("data", "desc"));
        const snap = await getDocs(q);
        const list: Row[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setRows(list);
      } catch (e: any) {
        console.error(e);
        setErroMsg("Erro ao carregar registros de monitoramento.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Unidades únicas para o <select>
  const unidades = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.unidade).filter(Boolean))).sort();
  }, [rows]);

  const filtrados = useMemo(() => {
    return rows.filter((r) => {
      if (unidadeFiltro && r.unidade !== unidadeFiltro) return false;
      if (inicio && r.data < inicio) return false;
      if (fim && r.data > fim) return false;
      return true;
    });
  }, [rows, inicio, fim, unidadeFiltro]);

  const kpis = useMemo(() => {
    const total = filtrados.length;
    const atrasos = filtrados.filter((r) => r.houveAtraso !== "nao").length;
    const camerasProblema = filtrados.filter((r) => !r.camerasOk).length;
    return { total, atrasos, camerasProblema };
  }, [filtrados]);

  function limparFiltros() {
    setInicio("");
    setFim("");
    setUnidadeFiltro("");
  }

  function exportCSV() {
    if (!filtrados.length) return;

    const header = [
      "Unidade",
      "Data",
      "Abertura",
      "Fechamento",
      "Houve Atraso",
      "Motivo Atraso",
      "Câmeras OK",
      "Ocorrências Segurança",
      "Problemas Gerais",
      "Ações Corretivas",
      "Assinatura",
      "Usuário (email)",
    ];

    const lines = filtrados.map((r) =>
      [
        r.unidade,
        br(r.data),
        r.horaAbertura,
        r.horaFechamento,
        atrasoLabel(r.houveAtraso),
        (r.motivoAtraso || "").replace(/\r?\n/g, " "),
        r.camerasOk ? "Sim" : "Não",
        (r.ocorrenciasSeguranca || "").replace(/\r?\n/g, " "),
        (r.problemasGerais || "").replace(/\r?\n/g, " "),
        (r.acoesCorretivas || "").replace(/\r?\n/g, " "),
        r.assinatura,
        r.userEmail || "",
      ]
        .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monitoramento_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loadingUser) {
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
        <h1 className="text-3xl font-bold">Admin — Monitoramento</h1>
        {userEmail && (
          <div className="mt-2 bg-white/15 px-3 py-1 rounded-full text-sm">
            Acesso: {userEmail}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Filtros */}
        <div className="bg-white shadow-lg rounded-2xl p-4" style={{ border: `1px solid ${amarelo}55` }}>
          <div className="grid md:grid-cols-6 gap-3">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Início</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Fim</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold mb-1">Unidade (opcional)</label>
              <select
                className="border rounded-lg px-3 py-2"
                value={unidadeFiltro}
                onChange={(e) => setUnidadeFiltro(e.target.value)}
              >
                <option value="">Todas as unidades</option>
                {unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3 md:col-span-2">
              <button
                onClick={exportCSV}
                className="w-full px-4 py-3 rounded-xl text-white font-semibold shadow"
                style={{ background: verde }}
              >
                Exportar CSV
              </button>
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-3 rounded-xl font-semibold border"
                style={{ borderColor: verde }}
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-4 text-center" style={{ border: `1px solid ${amarelo}55` }}>
            <div className="text-sm text-gray-600">Total de Registros</div>
            <div className="text-3xl font-bold" style={{ color: verde }}>{kpis.total}</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center" style={{ border: `1px solid ${amarelo}55` }}>
            <div className="text-sm text-gray-600">Com Atraso</div>
            <div className="text-3xl font-bold">{kpis.atrasos}</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center" style={{ border: `1px solid ${amarelo}55` }}>
            <div className="text-sm text-gray-600">Câmeras com Problema</div>
            <div className="text-3xl font-bold">{kpis.camerasProblema}</div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden" style={{ border: `1px solid ${amarelo}55` }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead style={{ background: "#faf7ea" }}>
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Unidade</th>
                  <th className="text-left p-3">Abertura</th>
                  <th className="text-left p-3">Fechamento</th>
                  <th className="text-left p-3">Atraso</th>
                  <th className="text-left p-3">Câmeras</th>
                  <th className="text-left p-3">Assinatura</th>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-4" colSpan={9}>Carregando…</td>
                  </tr>
                ) : filtrados.length ? (
                  filtrados.map((r) => (
                    <>
                      <tr key={r.id} className="border-t">
                        <td className="p-3">{br(r.data)}</td>
                        <td className="p-3">{r.unidade}</td>
                        <td className="p-3">{r.horaAbertura}</td>
                        <td className="p-3">{r.horaFechamento}</td>
                        <td className="p-3">{atrasoLabel(r.houveAtraso)}</td>
                        <td className="p-3">{r.camerasOk ? "OK" : "Problema"}</td>
                        <td className="p-3">{r.assinatura}</td>
                        <td className="p-3">{r.userEmail}</td>
                        <td className="p-3">
                          <button
                            className="px-3 py-1 rounded-lg border text-xs font-semibold"
                            style={{ borderColor: amarelo }}
                            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                          >
                            {expandedId === r.id ? "Fechar" : "Ver"}
                          </button>
                        </td>
                      </tr>

                      {expandedId === r.id && (
                        <tr className="border-t" key={r.id + "_det"}>
                          <td className="p-4 bg-[#fffdf6]" colSpan={9}>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <div className="font-semibold" style={{ color: verde }}>Motivo do Atraso</div>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                  {r.motivoAtraso || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold" style={{ color: verde }}>Ocorrências de Segurança</div>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                  {r.ocorrenciasSeguranca || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold" style={{ color: verde }}>Problemas Gerais</div>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                  {r.problemasGerais || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold" style={{ color: verde }}>Ações Corretivas</div>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                  {r.acoesCorretivas || "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td className="p-4" colSpan={9}>Nenhum registro encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {erroMsg && (
          <div className="text-red-600">{erroMsg}</div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => router.push("/admin")}
            className="px-5 py-3 rounded-xl font-semibold border"
            style={{ borderColor: verde }}
          >
            Voltar ao Painel
          </button>
        </div>
      </main>
    </div>
  );
}
