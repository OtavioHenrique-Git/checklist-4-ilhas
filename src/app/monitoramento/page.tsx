// src/app/monitoramento/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { isMonitoramentoEmail } from "../lib/roles"; // ⬅️ GUARD DE PAPEL

const verde = "#173921";
const amarelo = "#D4B233";

type HouveAtraso = "nao" | "abertura" | "fechamento" | "ambos";

export default function MonitoramentoPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Campos do formulário
  const [unidade, setUnidade] = useState("");
  const [data, setData] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
  });

  const [horaAbertura, setHoraAbertura] = useState("");
  const [horaFechamento, setHoraFechamento] = useState("");
  const [houveAtraso, setHouveAtraso] = useState<HouveAtraso>("nao");
  const [motivoAtraso, setMotivoAtraso] = useState("");

  const [camerasOk, setCamerasOk] = useState<"sim" | "nao" | "">("");
  const [ocorrenciasSeguranca, setOcorrenciasSeguranca] = useState("");
  const [problemasGerais, setProblemasGerais] = useState("");
  const [acoesCorretivas, setAcoesCorretivas] = useState("");
  const [assinatura, setAssinatura] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [erroMsg, setErroMsg] = useState("");

  // AUTH + ROLE GUARD
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (!isMonitoramentoEmail(user.email || "")) {
        // não autorizado a usar o módulo
        router.replace("/checklist");
        return;
      }
      setUserEmail(user.email || null);
      setLoadingUser(false);
    });
    return () => unsub();
  }, [router]);

  const podeSalvar = useMemo(() => {
    if (!unidade.trim()) return false;
    if (!data) return false;
    if (!horaAbertura) return false;
    if (!horaFechamento) return false;
    if (!camerasOk) return false;
    if (!assinatura.trim()) return false;
    return true;
  }, [unidade, data, horaAbertura, horaFechamento, camerasOk, assinatura]);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErroMsg("");
    setOkMsg("");

    if (!podeSalvar || !userEmail) {
      setErroMsg("Preencha os campos obrigatórios.");
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, "monitoramento"), {
        unidade: unidade.trim(),
        data, // YYYY-MM-DD
        horaAbertura,
        horaFechamento,
        houveAtraso,
        motivoAtraso: motivoAtraso.trim(),
        camerasOk: camerasOk === "sim",
        ocorrenciasSeguranca: ocorrenciasSeguranca.trim(),
        problemasGerais: problemasGerais.trim(),
        acoesCorretivas: acoesCorretivas.trim(),
        assinatura: assinatura.trim(),
        userEmail,
        createdAt: serverTimestamp(),
      });
      setOkMsg("Registro salvo com sucesso!");
      // limpa campos (mantém a data do dia)
      setUnidade("");
      setHoraAbertura("");
      setHoraFechamento("");
      setHouveAtraso("nao");
      setMotivoAtraso("");
      setCamerasOk("");
      setOcorrenciasSeguranca("");
      setProblemasGerais("");
      setAcoesCorretivas("");
      setAssinatura("");
    } catch (err) {
      console.error(err);
      setErroMsg("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
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
        <h1 className="text-3xl font-bold">Monitoramento — Abertura/Fechamento & Segurança</h1>
        {userEmail && (
          <div className="mt-2 bg-white/15 px-3 py-1 rounded-full text-sm">
            Usuário: {userEmail}
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSalvar}
          className="bg-white shadow-lg rounded-2xl p-6 space-y-6"
          style={{ border: `1px solid ${amarelo}55` }}
        >
          {/* Identificação */}
          <section className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold mb-1">Unidade *</label>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Ex.: Posto Centro"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Data *</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </section>

          {/* Abertura / Fechamento */}
          <section>
            <h2 className="font-bold text-lg mb-3" style={{ color: verde }}>
              Rotina de Abertura e Fechamento
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Horário de Abertura *</label>
                <input
                  type="time"
                  className="border rounded-lg px-3 py-2"
                  value={horaAbertura}
                  onChange={(e) => setHoraAbertura(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Horário de Fechamento *</label>
                <input
                  type="time"
                  className="border rounded-lg px-3 py-2"
                  value={horaFechamento}
                  onChange={(e) => setHoraFechamento(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Houve atraso? *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["nao", "abertura", "fechamento", "ambos"] as HouveAtraso[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setHouveAtraso(op)}
                      className={`px-3 py-2 rounded-lg border ${houveAtraso === op ? "font-semibold" : ""}`}
                      style={{
                        background: houveAtraso === op ? amarelo : "white",
                        borderColor: amarelo,
                      }}
                    >
                      {op === "nao" ? "Não" : op[0].toUpperCase() + op.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {houveAtraso !== "nao" && (
              <div className="mt-3">
                <label className="font-semibold mb-1 block">Motivo do Atraso</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Descreva o motivo…"
                  value={motivoAtraso}
                  onChange={(e) => setMotivoAtraso(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </section>

          {/* Segurança */}
          <section>
            <h2 className="font-bold text-lg mb-3" style={{ color: verde }}>
              Segurança
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-col">
                <label className="font-semibold mb-2">Câmeras funcionando? *</label>
                <div className="flex gap-2">
                  {(["sim", "nao"] as const).map((op) => (
                    <button
                      type="button"
                      key={op}
                      onClick={() => setCamerasOk(op)}
                      className={`px-4 py-2 rounded-lg border ${camerasOk === op ? "font-semibold" : ""}`}
                      style={{
                        background: camerasOk === op ? amarelo : "white",
                        borderColor: amarelo,
                      }}
                    >
                      {op === "sim" ? "Sim" : "Não"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="font-semibold mb-1 block">Ocorrências de Segurança</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Descreva qualquer anormalidade…"
                value={ocorrenciasSeguranca}
                onChange={(e) => setOcorrenciasSeguranca(e.target.value)}
                rows={3}
              />
            </div>
          </section>

          {/* Ocorrências Gerais */}
          <section>
            <h2 className="font-bold text-lg mb-3" style={{ color: verde }}>
              Ocorrências Gerais
            </h2>
            <div className="grid gap-3">
              <div>
                <label className="font-semibold mb-1 block">Problemas encontrados</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Descreva os problemas encontrados no turno…"
                  value={problemasGerais}
                  onChange={(e) => setProblemasGerais(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="font-semibold mb-1 block">Ações corretivas</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Descreva as ações corretivas tomadas…"
                  value={acoesCorretivas}
                  onChange={(e) => setAcoesCorretivas(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="font-semibold mb-1 block">Assinatura (nome completo) *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Responsável pelo monitoramento"
                  value={assinatura}
                  onChange={(e) => setAssinatura(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Ações */}
          <div className="flex items-center gap-3 pt-2">
            <button
              disabled={!podeSalvar || salvando}
              type="submit"
              className="px-5 py-3 rounded-xl text-white font-semibold shadow"
              style={{ background: verde, opacity: !podeSalvar || salvando ? 0.8 : 1 }}
            >
              {salvando ? "Salvando…" : "Salvar Registro"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-5 py-3 rounded-xl font-semibold border"
              style={{ borderColor: verde }}
            >
              Voltar
            </button>
          </div>

          {okMsg && <div className="text-green-700">{okMsg}</div>}
          {erroMsg && <div className="text-red-600">{erroMsg}</div>}
        </form>
      </main>
    </div>
  );
}
