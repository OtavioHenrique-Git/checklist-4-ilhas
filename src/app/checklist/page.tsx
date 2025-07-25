"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const verde = "#173921";
const amarelo = "#D4B233";
const cinzaClaro = "#F3F4F6";

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

type RespostaItem = {
  nota: number;
  observacao: string;
};

export default function ChecklistPage() {
  const [respostas, setRespostas] = useState<RespostaItem[]>(
    perguntas.map(() => ({
      nota: 3,
      observacao: "",
    }))
  );
  const [enviado, setEnviado] = useState(false);
  const [token, setToken] = useState("");
  const [timer, setTimer] = useState(30);
  const [user, setUser] = useState<User | null>(null);

  // Busca usuário logado do Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  function gerarToken() {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  function handleChange(
    index: number,
    field: keyof RespostaItem,
    value: number | string
  ) {
    const novo = [...respostas];
    (novo[index][field] as typeof value) = value;
    setRespostas(novo);
  }

  // Salva o checklist no Firestore
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToken(gerarToken());
    setEnviado(true);
    setTimer(30);

    // Salva no banco
    try {
      await addDoc(collection(db, "checklists"), {
        email: user?.email || "desconhecido",
        uid: user?.uid || null,
        respostas,
        criadoEm: serverTimestamp()
      });
    } catch (err) {
      alert("Erro ao salvar checklist!");
    }

    // Inicia o countdown para redirecionar ao login depois de 30 segundos
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          setEnviado(false);
          setToken("");
          // Redireciona para o login ao acabar o tempo
          window.location.href = "/login";
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Tela do Token
  if (enviado) {
    return (
      <div
        style={{ background: verde }}
        className="min-h-screen flex flex-col justify-center items-center"
      >
        <div className="bg-white text-center rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-xs w-full">
          <img src="/logo.jpeg" alt="Logo" className="w-20 mb-2 rounded-xl" />
          <span
            className="text-lg font-semibold mb-2"
            style={{ color: verde }}
          >
            Token Gerado
          </span>
          <span
            className="text-5xl font-mono font-extrabold mb-2 tracking-widest"
            style={{ color: amarelo }}
          >
            {token}
          </span>
          <span className="text-base mb-1" style={{ color: verde }}>
            Válido por <b>{timer}</b> segundos
          </span>
          <span className="text-xs text-gray-500">
            (Use para liberar o computador)
          </span>
        </div>
      </div>
    );
  }

  // Tela Principal
  return (
    <form
      className="min-h-screen w-full flex flex-col items-center"
      style={{ background: "linear-gradient(120deg, #f7f9fa 0%, #eceff1 100%)" }}
      onSubmit={handleSubmit}
    >
      {/* TOPO MELHORADO */}
      <div className="flex flex-col items-center mt-8 mb-3 w-full">
        <div
          className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center mb-2"
          style={{ boxShadow: "0 4px 32px 0 #17392120" }}
        >
          <img
            src="/logo.jpeg"
            alt="Logo 4 Ilhas"
            className="w-20 h-20 object-contain rounded-xl mb-1"
            style={{ border: `2.5px solid ${amarelo}` }}
          />
        </div>
        <h1
          className="font-extrabold text-3xl text-center tracking-tight"
          style={{
            color: verde,
            letterSpacing: "-0.5px",
            fontFamily: "'Segoe UI', 'Inter', Arial, sans-serif",
          }}
        >
          Diário de Verificação
        </h1>
        {/* E-mail do gerente logado */}
        {user?.email && (
          <span
            className="mt-2 mb-2 px-4 py-2 rounded-xl text-base font-medium"
            style={{
              background: "#F7F8F8",
              color: verde,
              border: `1.5px solid ${amarelo}`,
              boxShadow: "0 2px 10px #1739210c",
              fontSize: "1.08rem",
              letterSpacing: "0.2px",
            }}
          >
            Usuário: {user.email}
          </span>
        )}
      </div>

      <div className="w-full max-w-xl flex flex-col gap-8 mb-8 px-2">
        {perguntas.map((pergunta, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-xl px-6 py-5 flex flex-col border relative transition-all"
            style={{
              borderColor: verde,
              borderWidth: 1.5,
              boxShadow:
                "0 6px 32px #17392119, 0 1.5px 6px #d4b23310",
            }}
          >
            <span
              className="font-semibold text-base mb-3"
              style={{
                color: verde,
                fontSize: "1.08rem",
                letterSpacing: "-0.5px",
              }}
            >
              {pergunta}
            </span>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleChange(i, "nota", n)}
                  className={`w-10 h-10 rounded-full font-bold border flex items-center justify-center shadow-md transition-all
                    ${
                      respostas[i].nota === n
                        ? "scale-110 ring-2 ring-yellow-400"
                        : "opacity-80 hover:scale-105 hover:shadow-lg"
                    }`}
                  style={{
                    background:
                      respostas[i].nota === n ? amarelo : "#fcfcfc",
                    color: respostas[i].nota === n ? verde : "#b3b3b3",
                    borderColor: amarelo,
                    borderWidth: 2,
                    fontSize: "1.15rem",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea
              className="border p-2 rounded-xl resize-none text-sm transition-all focus:shadow-md"
              style={{
                borderColor: verde,
                background: "#fafafa",
                fontFamily: "'Segoe UI', 'Inter', Arial, sans-serif",
                color: verde,
              }}
              rows={2}
              placeholder="Observações (opcional)..."
              value={respostas[i].observacao}
              onChange={e => handleChange(i, "observacao", e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full max-w-xl"
        style={{
          background: `linear-gradient(90deg, ${verde} 70%, ${amarelo} 100%)`,
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.25rem",
          padding: "1rem",
          borderRadius: "1.3rem",
          boxShadow: "0 6px 28px #17392118",
          letterSpacing: "0.02em",
          marginBottom: "2.5rem",
          border: "none",
        }}
      >
        Enviar checklist
      </button>
    </form>
  );
}
