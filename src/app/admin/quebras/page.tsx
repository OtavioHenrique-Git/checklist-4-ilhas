"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Altere para o nome do seu arquivo de logo, se necessário!
const logoPath = "/logo.jpeg";

const verde = "#173921";
const amarelo = "#D4B233";

export default function QuebrasRelatorioPage() {
  const [quebras, setQuebras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuebras() {
      setLoading(true);
      const q = query(collection(db, "quebras"), orderBy("data", "desc"));
      const snap = await getDocs(q);
      setQuebras(snap.docs.map((doc) => doc.data()));
      setLoading(false);
    }
    fetchQuebras();
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#f7f9fa" }}
    >
      <div
        className="w-full max-w-3xl rounded-3xl shadow-2xl p-8 bg-white border border-gray-100"
        style={{ boxShadow: "0 8px 40px #17392112, 0 1.5px 8px #d4b23313" }}
      >
        <div className="flex flex-col items-center mb-7">
          <img
            src={logoPath}
            alt="Logo"
            className="w-24 h-24 object-contain rounded-xl mb-2 bg-white shadow"
            style={{ border: `2.5px solid ${amarelo}` }}
          />
          <h2
            className="text-3xl font-extrabold text-center mb-1"
            style={{
              color: verde,
              letterSpacing: "-0.5px",
              fontFamily: "'Poppins', Arial, sans-serif",
              textShadow: "0 2px 8px #D4B23315",
            }}
          >
            Relatório de Quebras de Pães
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full rounded-2xl overflow-hidden">
            <thead>
              <tr style={{ background: verde, color: "#fff" }}>
                <th className="py-3 px-4 text-left font-bold">Data</th>
                <th className="py-3 px-4 text-left font-bold">Gerente</th>
                <th className="py-3 px-4 text-center font-bold">Pão Francês</th>
                <th className="py-3 px-4 text-center font-bold">Pão Massinha</th>
                <th className="py-3 px-4 text-center font-bold">Pão de Queijo</th>
                <th className="py-3 px-4 text-center font-bold">Pão de Queijo Uni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : quebras.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    Nenhum lançamento de quebra encontrado.
                  </td>
                </tr>
              ) : (
                quebras.map((q, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-[#f7f9fa]" : "bg-[#fffbe5]"}
                  >
                    <td className="py-2 px-4 text-sm">
                      {q.data?.toDate
                        ? q.data.toDate().toLocaleDateString("pt-BR")
                        : new Date(q.data.seconds * 1000).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 px-4 text-sm">{q.gerente || "-"}</td>
                    <td className="py-2 px-4 text-center font-bold text-green-900">{q.paoFrances}</td>
                    <td className="py-2 px-4 text-center font-bold text-green-900">{q.paoMassinha}</td>
                    <td className="py-2 px-4 text-center font-bold text-green-900">{q.paoDeQueijo}</td>
                    <td className="py-2 px-4 text-center font-bold text-green-900">{q.paoDeQueijoUni}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
