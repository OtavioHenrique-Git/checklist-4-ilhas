"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "../../lib/firebase"; // ajuste se seu caminho for diferente
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  DocumentData,
  Timestamp,
} from "firebase/firestore";

const verde = "#173921";
const amarelo = "#D4B233";
const logoPath = "/logo.jpeg";

/** Utils */
function toDateInputValue(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function startOfDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`);
}
function endOfDay(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999`);
}

type Row = {
  id: string;
  data: Timestamp | null;
  gerente: string;
  paoFrances: number;
  paoMassinha: number;
  paoDeQueijo: number;
  paoDeQueijoUni: number;
};

export default function AdminRelatorioQuebras() {
  // --- Filtros (admin) ---
  const [dataInicial, setDataInicial] = useState<string>(""); // vazio = sem filtro
  const [dataFinal, setDataFinal] = useState<string>("");     // vazio = sem filtro
  const [emailGerente, setEmailGerente] = useState<string>("");

  // --- Estado de dados ---
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const ref = collection(db, "quebras");

      // Construção dinâmica dos filtros
      const filtros: any[] = [];
      // Filtro por email (igualdade)
      if (emailGerente.trim()) {
        filtros.push(where("gerente", "==", emailGerente.trim()));
      }
      // Filtro por intervalo de datas (Timestamp)
      const temIni = Boolean(dataInicial);
      const temFim = Boolean(dataFinal);
      if (temIni && temFim) {
        filtros.push(
          where("data", ">=", Timestamp.fromDate(startOfDay(dataInicial))),
          where("data", "<=", Timestamp.fromDate(endOfDay(dataFinal)))
        );
      } else if (temIni && !temFim) {
        filtros.push(where("data", ">=", Timestamp.fromDate(startOfDay(dataInicial))));
      } else if (!temIni && temFim) {
        filtros.push(where("data", "<=", Timestamp.fromDate(endOfDay(dataFinal))));
      }

      // Importante: quando existe filtro de range em "data", a consulta deve ter orderBy("data")
      const q =
        filtros.length > 0
          ? query(ref, ...filtros, orderBy("data", "desc"))
          : query(ref, orderBy("data", "desc"));

      const snap = await getDocs(q);

      const lista: Row[] = snap.docs.map((doc) => {
        const d: DocumentData = doc.data();
        return {
          id: doc.id,
          data: d.data ?? null,
          gerente: d.gerente ?? "",
          paoFrances: Number(d.paoFrances ?? 0),
          paoMassinha: Number(d.paoMassinha ?? 0),
          paoDeQueijo: Number(d.paoDeQueijo ?? 0),
          paoDeQueijoUni: Number(d.paoDeQueijoUni ?? 0),
        };
      });

      setRows(lista);
    } catch (e) {
      console.error(e);
      setErro(
        "Não foi possível carregar. Se aparecer um link de índice no console do Firestore, clique para criar o índice composto."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carrega automaticamente ao alterar filtros
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicial, dataFinal, emailGerente]);

  const totalizador = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          frances: acc.frances + r.paoFrances,
          massinha: acc.massinha + r.paoMassinha,
          queijo: acc.queijo + r.paoDeQueijo,
          queijoUni: acc.queijoUni + r.paoDeQueijoUni,
          total:
            acc.total +
            r.paoFrances +
            r.paoMassinha +
            r.paoDeQueijo +
            r.paoDeQueijoUni,
        }),
        { frances: 0, massinha: 0, queijo: 0, queijoUni: 0, total: 0 }
      ),
    [rows]
  );

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "#f7f9fa" }}>
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-6 md:px-10 pt-8">
          <div className="flex flex-col items-center mb-4">
            <img
              src={logoPath}
              alt="Logo"
              className="w-20 h-20 object-contain rounded-xl mb-2 bg-white shadow"
              style={{ border: `2.5px solid ${amarelo}` }}
            />
            <h1
              className="text-2xl md:text-3xl font-extrabold text-center"
              style={{ color: verde, letterSpacing: "-0.5px" }}
            >
              Relatório de Quebras de Pães (Admin)
            </h1>
          </div>

          {/* Filtros (Admin) */}
          <div className="mt-4 p-4 rounded-2xl border bg-[#f8faf6]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: verde }}>
                  Data inicial
                </label>
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  placeholder={toDateInputValue()}
                  className="w-full border-2 rounded-xl p-3 outline-none bg-white focus:border-yellow-400 text-green-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: verde }}>
                  Data final
                </label>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="w-full border-2 rounded-xl p-3 outline-none bg-white focus:border-yellow-400 text-green-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: verde }}>
                  Email do gerente
                </label>
                <input
                  type="email"
                  value={emailGerente}
                  onChange={(e) => setEmailGerente(e.target.value)}
                  placeholder="ex.: itapema@postos4ilhas.com.br"
                  className="w-full border-2 rounded-xl p-3 outline-none bg-white focus:border-yellow-400 text-green-900"
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={carregar}
                className="px-4 py-3 rounded-xl font-bold text-white"
                style={{ background: verde }}
                disabled={loading}
              >
                {loading ? "Carregando..." : "Aplicar filtros"}
              </button>
              <button
                onClick={() => {
                  setDataInicial("");
                  setDataFinal("");
                  setEmailGerente("");
                }}
                className="px-4 py-3 rounded-xl font-bold border"
                style={{ borderColor: amarelo, color: verde }}
                disabled={loading}
              >
                Limpar
              </button>
            </div>

            {erro && <div className="mt-2 text-red-600 text-sm">{erro}</div>}
          </div>
        </div>

        {/* Tabela */}
        <div className="px-2 md:px-6 pb-8 overflow-x-auto">
          <table className="min-w-[880px] w-full border-collapse rounded-lg overflow-hidden">
            <thead className="bg-green-900 text-white">
              <tr>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Gerente</th>
                <th className="p-3 text-right">Pão Francês</th>
                <th className="p-3 text-right">Pão Massinha</th>
                <th className="p-3 text-right">Pão de Queijo</th>
                <th className="p-3 text-right">Pão de Queijo Uni</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Carregando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const dataFmt =
                    r.data?.toDate?.()
                      ?.toLocaleDateString("pt-BR") ||
                    "-";
                  const total =
                    r.paoFrances +
                    r.paoMassinha +
                    r.paoDeQueijo +
                    r.paoDeQueijoUni;
                  return (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-[#ffffff]" : "bg-[#f9fbf7]"}
                    >
                      <td className="p-3">{dataFmt}</td>
                      <td className="p-3">{r.gerente || "-"}</td>
                      <td className="p-3 text-right">{r.paoFrances}</td>
                      <td className="p-3 text-right">{r.paoMassinha}</td>
                      <td className="p-3 text-right">{r.paoDeQueijo}</td>
                      <td className="p-3 text-right">{r.paoDeQueijoUni}</td>
                      <td className="p-3 text-right">{total}</td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Rodapé somatório */}
            {rows.length > 0 && !loading && (
              <tfoot>
                <tr className="bg-green-50 font-semibold">
                  <td className="p-3" colSpan={2}>
                    Somatório (registros listados)
                  </td>
                  <td className="p-3 text-right">{totalizador.frances}</td>
                  <td className="p-3 text-right">{totalizador.massinha}</td>
                  <td className="p-3 text-right">{totalizador.queijo}</td>
                  <td className="p-3 text-right">{totalizador.queijoUni}</td>
                  <td className="p-3 text-right">{totalizador.total}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
