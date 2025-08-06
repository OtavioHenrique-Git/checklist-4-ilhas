"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

const verde = "#173921";
const amarelo = "#D4B233";
const logoPath = "/logo.jpeg"; // ajuste se o nome for diferente

export default function QuebrasPage() {
  const [paoFrances, setPaoFrances] = useState("");
  const [paoMassinha, setPaoMassinha] = useState("");
  const [paoDeQueijo, setPaoDeQueijo] = useState("");
  const [paoDeQueijoUni, setPaoDeQueijoUni] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, "quebras"), {
      paoFrances: Number(paoFrances),
      paoMassinha: Number(paoMassinha),
      paoDeQueijo: Number(paoDeQueijo),
      paoDeQueijoUni: Number(paoDeQueijoUni),
      data: Timestamp.now(),
      gerente: user?.email || "",
    });
    setLoading(false);
    setPaoFrances(""); setPaoMassinha(""); setPaoDeQueijo(""); setPaoDeQueijoUni("");
    alert("Quebras registradas!");
    router.push('/'); // Volta para o dashboard, ajuste se quiser outra página
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f9fa" }}>
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl p-8 bg-white border border-gray-100"
        style={{
          boxShadow: "0 8px 40px #17392114, 0 2px 10px #d4b23318",
          margin: "40px 0",
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoPath}
            alt="Logo"
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
          <span className="text-base text-gray-500 mb-2" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
            {user?.email}
          </span>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão Francês:
            </label>
            <input
              type="number"
              value={paoFrances}
              onChange={e => setPaoFrances(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              required
              placeholder="Digite o valor da quebra"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão Massinha:
            </label>
            <input
              type="number"
              value={paoMassinha}
              onChange={e => setPaoMassinha(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              required
              placeholder="Digite o valor da quebra"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão de Queijo:
            </label>
            <input
              type="number"
              value={paoDeQueijo}
              onChange={e => setPaoDeQueijo(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              required
              placeholder="Digite o valor da quebra"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" style={{ color: verde }}>
              Pão de Queijo Uni:
            </label>
            <input
              type="number"
              value={paoDeQueijoUni}
              onChange={e => setPaoDeQueijoUni(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-yellow-400 bg-[#f8faf6] text-green-900 font-bold transition"
              required
              placeholder="Digite o valor da quebra"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-extrabold"
            style={{
              background: `linear-gradient(90deg, ${amarelo} 60%, ${verde} 100%)`,
              color: "#fff",
              fontSize: "1.18rem",
              letterSpacing: "0.5px",
              boxShadow: "0 6px 24px #d4b23322",
              transition: "0.2s",
            }}
          >
            {loading ? "Salvando..." : "Salvar Quebras"}
          </button>
        </form>
      </div>
    </div>
  );
}
