"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

// Suas cores oficiais:
const verde = "#173921";
const amarelo = "#D4B233";

const campos = [
  { nome: "Positivação de clientes", tipo: "number" },
  { nome: "Nº de frentistas", tipo: "number" },
  { nome: "Entrada de colaboradores", tipo: "number" },
  { nome: "Saída de colaboradores", tipo: "number" },
  { nome: "Contagem Semanal", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Listas de Contagens 80/20", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Mapa de cigarros em dia?", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Pontos assinados para folha de pagamento", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Pontos assinados para rescisão", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Planilha de Controle de Uniformes", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Boletos semanais", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Caixas semanal/ mensal para fechamento da folha", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Planilha de Controle de Validades", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Vendas semanais divulgada no mural", tipo: "select", opcoes: ["Sim", "Não"] },
  { nome: "Reunião Mensal agendada (colocar data)", tipo: "date" },
];

export default function EntregaveisPage() {
  const router = useRouter();
  const [respostas, setRespostas] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Só libera nas segundas
  const hoje = new Date();
  const isSegunda = true;
 
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || "");
      if (!user) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  const handleChange = (campo: string, valor: string) => {
    setRespostas({ ...respostas, [campo]: valor });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await addDoc(collection(db, "entregaveis"), {
        email: userEmail,
        criadoEm: Timestamp.now(),
        respostas,
      });
      setMsg("Entregáveis enviados com sucesso!");
      setRespostas({});
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setMsg("Erro ao enviar. Tente novamente.");
    }
    setLoading(false);
  };

  if (!isSegunda) {
    return (
      <div className="flex flex-col items-center mt-24">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6" style={{ color: verde }}>
          Entregáveis Semanais
        </h1>
        <div className="p-6 bg-yellow-100 rounded-xl border border-yellow-400 text-yellow-900 text-lg shadow">
          O preenchimento dos entregáveis só está disponível às <strong>segundas-feiras</strong>.
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-10 px-2"
      style={{
        background: "linear-gradient(120deg,#f7f9fa 0%,#eceff1 100%)",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <div
        className="w-full max-w-2xl bg-white p-0 rounded-3xl shadow-2xl border border-gray-100"
        style={{
          marginTop: 24,
          boxShadow: "0 10px 38px #17392115, 0 1.5px 10px #d4b23315",
        }}
      >
        <div
          className="flex flex-col items-center rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, ${verde} 65%, ${amarelo} 100%)`,
            padding: "2.3rem 2.3rem 1.1rem 2.3rem",
            boxShadow: "0 4px 30px #17392110",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <img src="/logo.jpeg" alt="Logo 4 Ilhas" className="w-20 h-20 mb-3 rounded-2xl bg-white shadow" style={{ border: `2.5px solid ${amarelo}` }} />
          <h1
            className="text-3xl font-extrabold text-center tracking-tight"
            style={{
              color: "#fff",
              textShadow: "0 1px 8px #17392135, 0 1px 4px #D4B23344",
              letterSpacing: "-1.2px",
              fontFamily: "'Poppins', Arial, sans-serif",
            }}
          >
            Entregáveis Semanais
          </h1>
        </div>
        <form className="flex flex-col gap-7 p-10 pt-6" onSubmit={handleSubmit}>
          {campos.map((campo, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <label
                className="font-semibold mb-1 text-base"
                style={{
                  color: verde,
                  fontWeight: 700,
                  fontSize: "1.13rem",
                  letterSpacing: "-.3px",
                }}
              >
                {campo.nome}
              </label>
              {campo.tipo === "select" ? (
                <select
                  className="border-2 border-yellow-200 rounded-xl px-4 py-2 text-base outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-[#FCFBF4] transition font-semibold text-gray-800"
                  value={respostas[campo.nome] || ""}
                  onChange={e => handleChange(campo.nome, e.target.value)}
                  required
                  style={{ minHeight: 44 }}
                >
                  <option value="">Selecione</option>
                  {campo.opcoes?.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={campo.tipo}
                  className="border-2 border-yellow-200 rounded-xl px-4 py-2 text-base outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-[#FCFBF4] transition font-semibold text-gray-800"
                  value={respostas[campo.nome] || ""}
                  onChange={e => handleChange(campo.nome, e.target.value)}
                  required
                  style={{ minHeight: 44 }}
                />
              )}
            </div>
          ))}

          <button
            disabled={loading}
            type="submit"
            className="mt-2 bg-[#173921] hover:bg-[#275a2c] text-[#D4B233] font-extrabold text-lg rounded-2xl shadow px-8 py-4 transition border-none"
            style={{
              letterSpacing: "0.02em",
              boxShadow: "0 6px 28px #17392118",
            }}
          >
            {loading ? "Enviando..." : "Enviar Entregáveis"}
          </button>
          {msg && (
            <div className="mt-4 text-center text-base font-semibold text-green-700 bg-green-50 rounded-xl py-2">
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
