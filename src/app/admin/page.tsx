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

const verde = "#173921";
const amarelo = "#D4B233";

// MESMOS E-MAILS DO LOGIN
const adminEmails = [
  "suporte@postos4ilhas.com.br",
  "diretor@4ilhas.com",
  "admin@4ilhas.com"
];

export default function AdminPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroEmail, setFiltroEmail] = useState(""); // <- NOVO
  const [loading, setLoading] = useState(true);

  // Novos estados:
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const email = user?.email || "";
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

  // Função para buscar os relatórios do Firestore
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
    <div className="min-h-screen flex flex-col items-center bg-[#f5f7fa] py-10">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl flex flex-col items-center">
        <img
          src="/logo.jpeg"
          alt="Logo"
          className="w-20 h-20 mb-3 rounded-xl shadow"
        />
        <h1
          className="text-2xl font-extrabold mb-2"
          style={{ color: verde }}
        >
          Painel do TI/Diretor
        </h1>
        <span
          className="mb-4 text-base px-4 py-2 rounded-xl"
          style={{
            background: "#F7F8F8",
            color: verde,
            border: `1.5px solid ${amarelo}`,
            fontWeight: 600,
            letterSpacing: "0.1px",
          }}
        >
          Usuário: {userEmail}
        </span>

        {/* Filtro de datas e e-mail */}
        <div className="w-full flex flex-col md:flex-row gap-3 mb-3">
          <div className="flex flex-col w-full">
            <label className="font-semibold text-sm mb-1" style={{ color: verde }}>
              Início
            </label>
            <input
              type="date"
              className="border p-2 rounded-xl"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              style={{ borderColor: amarelo }}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="font-semibold text-sm mb-1" style={{ color: verde }}>
              Fim
            </label>
            <input
              type="date"
              className="border p-2 rounded-xl"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              style={{ borderColor: amarelo }}
            />
          </div>
        </div>
        {/* Filtro de E-mail */}
        <div className="w-full flex flex-col md:flex-row gap-3 mb-5">
          <div className="flex flex-col w-full">
            <label className="font-semibold text-sm mb-1" style={{ color: verde }}>
              E-mail (opcional)
            </label>
            <input
              type="text"
              placeholder="exemplo@email.com"
              className="border p-2 rounded-xl"
              value={filtroEmail}
              onChange={e => setFiltroEmail(e.target.value)}
              style={{ borderColor: amarelo }}
            />
          </div>
        </div>

        {/* Botão para buscar relatórios */}
        <button
          className="w-full bg-[var(--verde)] mb-4"
          style={{
            background: verde,
            color: amarelo,
            fontWeight: "bold",
            fontSize: "1.05rem",
            padding: "0.8rem",
            borderRadius: "1rem",
            marginTop: "0.5rem",
            boxShadow: "0 2px 10px #17392110",
          }}
          onClick={buscarRelatorios}
          type="button"
        >
          Buscar Relatórios
        </button>

        {/* Botão para ir ao checklist */}
        <button
          className="w-full"
          style={{
            background: amarelo,
            color: verde,
            fontWeight: "bold",
            fontSize: "1.05rem",
            padding: "0.8rem",
            borderRadius: "1rem",
            marginBottom: "0.8rem",
            marginTop: "0.2rem",
            boxShadow: "0 2px 10px #d4b23330",
          }}
          onClick={handleChecklist}
          type="button"
        >
          Preencher Checklist
        </button>
        <button
          className="text-sm text-gray-400 hover:underline mt-2"
          type="button"
          onClick={() => signOut(auth).then(() => (window.location.href = "/login"))}
        >
          Sair
        </button>

        {/* RESULTADOS */}
        <div className="w-full mt-8">
          {buscando && (
            <div className="text-gray-500 mb-4 text-center">Buscando...</div>
          )}
          {resultados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-lg overflow-hidden shadow">
                <thead>
                  <tr>
                    <th className="p-2 border-b text-left">Usuário</th>
                    <th className="p-2 border-b text-left">Data/Hora</th>
                    <th className="p-2 border-b text-left">Respostas</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, idx) => (
                    <tr key={idx} className="border-t align-top">
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">
                        {r.criadoEm?.toDate?.().toLocaleString?.() || "-"}
                      </td>
                      <td className="p-2">
                        {r.respostas &&
                          r.respostas.map?.((resp: any, i: number) => (
                            <div key={i}>
                              <b>{i + 1}:</b> Nota {resp.nota}, Obs: {resp.observacao || "-"}
                            </div>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {resultados.length === 0 && !buscando && (
            <div className="text-gray-400 mt-6 text-center">
              Nenhum checklist encontrado nesse período.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
