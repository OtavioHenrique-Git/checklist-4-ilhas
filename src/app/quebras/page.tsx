"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase"; // ajuste para "../lib/firebase" se precisar
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

/** Paleta 4 Ilhas */
const verde = "#173921";
const amarelo = "#D4B233";
const bgCinza = "#f7f9fa";
const logoPath = "/logo.jpeg";

/** Utilidades */
function clampNonNegative(n: number) {
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
function toNumberSafe(v: string) {
  // aceita vírgula ou ponto
  const num = Number(String(v).replace(",", "."));
  return clampNonNegative(num);
}
function yyyyMmDd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function toPtBr(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default function QuebrasPage() {
  const router = useRouter();

  // auth
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // campos
  const [paoFrances, setPaoFrances] = useState<string>("");
  const [paoMassinha, setPaoMassinha] = useState<string>("");
  const [paoDeQueijo, setPaoDeQueijo] = useState<string>("");
  const [paoDeQueijoUni, setPaoDeQueijoUni] = useState<string>("");

  // data do registro (padrão: hoje)
  const [dataStr, setDataStr] = useState<string>(yyyyMmDd(new Date()));

  // estados UI
  const [saving, setSaving] = useState(false);
  const allNumbersValid = useMemo(() => {
    return (
      paoFrances !== "" &&
      paoMassinha !== "" &&
      paoDeQueijo !== "" &&
      paoDeQueijoUni !== ""
    );
  }, [paoFrances, paoMassinha, paoDeQueijo, paoDeQueijoUni]);

  const total = useMemo(() => {
    return (
      toNumberSafe(paoFrances) +
      toNumberSafe(paoMassinha) +
      toNumberSafe(paoDeQueijo) +
      toNumberSafe(paoDeQueijoUni)
    );
  }, [paoFrances, paoMassinha, paoDeQueijo, paoDeQueijoUni]);

  // carregar user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) {
      alert("Faça login para lançar as quebras.");
      return;
    }
    if (!allNumbersValid) {
      alert("Preencha todos os campos numéricos.");
      return;
    }

    try {
      setSaving(true);

      // normaliza números
      const vFrances = toNumberSafe(paoFrances);
      const vMassinha = toNumberSafe(paoMassinha);
      const vQueijo = toNumberSafe(paoDeQueijo);
      const vQueijoUni = toNumberSafe(paoDeQueijoUni);

      // data escolhida pelo usuário (à meia-noite local)
      const dateChosen = new Date(dataStr + "T00:00:00");
      const tsData = Timestamp.fromDate(dateChosen);

      // strings úteis para filtros
      const dataISO = dataStr; // "YYYY-MM-DD"
      const dataBR = toPtBr(dateChosen);

      await addDoc(collection(db, "quebras"), {
        paoFrances: vFrances,
        paoMassinha: vMassinha,
        paoDeQueijo: vQueijo,
        paoDeQueijoUni: vQueijoUni,
        total,
        data: tsData,           // para filtros por intervalo (Timestamp)
        dataISO,                // para igualdade "=="
        dataBR,                 // para exibir sem converter
        gerente: user.email,    // para filtro por email
        createdAt: serverTimestamp(), // auditoria
      });

      // limpa form
      setPaoFrances("");
      setPaoMassinha("");
      setPaoDeQueijo("");
      setPaoDeQueijoUni("");

      alert("Quebras registradas com sucesso.");
      router.push("/"); // ajuste o destino se quiser
    } catch (err) {
      console.error(err);
      alert("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (!authReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bgCinza }}
      >
        <span className="text-gray-600">Carregando…</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: bgCinza }}
    >
      <div
        className="w-full max-w-xl rounded-3xl shadow-2xl p-8 bg-white border border-gray-100"
        style={{ boxShadow: "0 8px 40px #17392114, 0 2px 10px #d4b23318", margin: "40px 0" }}
      >
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoPath}
            alt="Logo 4 Ilhas"
            className="w-20 h-20 object-contain rounded-xl mb-2 bg-white shadow"
            style={{ border: `2.5px solid ${amarelo}` }}
          />
          <h2
            className="text-2xl font-extrabold text-center mb-1"
            style={{
              color: verde,
              letterSpacing: "-0.5px",
              fontFamily: "'Poppins', Arial, sans-serif",
              textShadow: "0 2px 8px #D4B23313",
            }}
          >
            Lançar <span style={{ color: amarelo }}>Quebras</span> de Pães
          </h2>
          <span
            className="text-base text-gray-600 mb-2"
            style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
          >
            {user?.email ?? "Não autenticado"}
          </span>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Data do registro */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Data do registro
            </label>
            <input
              type="date"
              value={dataStr}
              onChange={(e) => setDataStr(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-semibold transition"
              required
            />
          </div>

          {/* Campos numéricos */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão Francês
            </label>
            <input
              inputMode="decimal"
              step="0.001"
              min="0"
              value={paoFrances}
              onChange={(e) => setPaoFrances(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              placeholder="Quantidade perdida"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão Massinha
            </label>
            <input
              inputMode="decimal"
              step="0.001"
              min="0"
              value={paoMassinha}
              onChange={(e) => setPaoMassinha(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              placeholder="Quantidade perdida"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão de Queijo
            </label>
            <input
              inputMode="decimal"
              step="0.001"
              min="0"
              value={paoDeQueijo}
              onChange={(e) => setPaoDeQueijo(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              placeholder="Quantidade perdida"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão de Queijo Uni
            </label>
            <input
              inputMode="decimal"
              step="0.001"
              min="0"
              value={paoDeQueijoUni}
              onChange={(e) => setPaoDeQueijoUni(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              placeholder="Quantidade perdida"
              required
            />
          </div>

          {/* Resumo */}
          <div className="mt-2 text-sm text-gray-700">
            <span className="font-semibold" style={{ color: verde }}>
              Total informado:
            </span>{" "}
            {total}
          </div>

          {/* Ações */}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving || !user}
              className="flex-1 py-3 rounded-xl font-extrabold disabled:opacity-60"
              style={{
                background: `linear-gradient(90deg, ${amarelo} 60%, ${verde} 100%)`,
                color: "#fff",
                fontSize: "1.08rem",
                letterSpacing: "0.5px",
                boxShadow: "0 6px 24px #d4b23322",
                transition: "0.2s",
              }}
            >
              {saving ? "Salvando..." : "Salvar Quebras"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPaoFrances("");
                setPaoMassinha("");
                setPaoDeQueijo("");
                setPaoDeQueijoUni("");
                setDataStr(yyyyMmDd(new Date()));
              }}
              className="px-4 py-3 rounded-xl font-semibold border"
              style={{ borderColor: amarelo, color: verde }}
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
