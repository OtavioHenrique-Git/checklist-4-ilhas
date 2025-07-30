"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const verde = "#173921";
const amarelo = "#D4B233";

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
  const router = useRouter();

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToken(gerarToken());
    setEnviado(true);
    setTimer(30);

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

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          setEnviado(false);
          setToken("");
          window.location.href = "/login";
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Botão entregáveis
  function handleAcessarEntregaveis() {
    router.push("/entregaveis");
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
      style={{
        background: "linear-gradient(120deg,#f7f9fa 0%,#eceff1 100%)",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
      onSubmit={handleSubmit}
    >
      {/* HEADER premium responsivo */}
      <div
        className="flex flex-col items-center w-full rounded-b-3xl shadow"
        style={{
          background: `linear-gradient(90deg, ${verde} 65%, ${amarelo} 100%)`,
          boxShadow: "0 4px 30px #17392110",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginBottom: 20,
          paddingTop: 28,
          paddingBottom: 24,
          maxWidth: 700,
          width: "100%",
        }}
      >
        <img
          src="/logo.jpeg"
          alt="Logo 4 Ilhas"
          className="w-20 h-20 object-contain rounded-xl mb-3 bg-white"
          style={{ border: `2.5px solid ${amarelo}` }}
        />
        <h1
          className="font-extrabold text-3xl text-center tracking-tight"
          style={{
            color: "#fff",
            textShadow: "0 1px 8px #17392135, 0 1px 4px #D4B23344",
            letterSpacing: "-1px",
          }}
        >
          Diário de Verificação
        </h1>
        {user?.email && (
          <span
            className="mt-3 px-5 py-2 rounded-xl text-base font-medium shadow"
            style={{
              background: "#fffbe5",
              color: verde,
              border: `1.5px solid ${amarelo}`,
              boxShadow: "0 2px 10px #17392115",
              fontSize: "1.08rem",
              letterSpacing: "0.2px",
              marginTop: 6,
              marginBottom: -10,
              maxWidth: "92vw",
              textAlign: "center",
              overflowWrap: "anywhere",
            }}
          >
            Usuário: {user.email}
          </span>
        )}
      </div>

      {/* BOTÃO ENTREGÁVEIS - Centralizado e responsivo */}
      <div className="w-full flex flex-row justify-center mb-4 px-2" style={{ maxWidth: 700 }}>
        <button
          type="button"
          onClick={handleAcessarEntregaveis}
          className="px-4 py-3 rounded-xl font-bold bg-yellow-200 border border-yellow-400 hover:bg-yellow-300 transition text-green-900 shadow"
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            minWidth: 220,
            width: "100%",
            maxWidth: 370,
            boxShadow: "0 3px 16px #d4b23326",
          }}
        >
          Preencher Entregáveis Semanais
        </button>
      </div>

      {/* Cards responsivos, maxWidth no desktop */}
      <div
        className="w-full flex flex-col gap-8 mb-8 px-2"
        style={{ maxWidth: 900, width: "100%" }}
      >
        {perguntas.map((pergunta, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-xl px-4 py-5 flex flex-col border-2 transition-all mx-auto"
            style={{
              borderColor: amarelo,
              borderWidth: 2,
              boxShadow: "0 8px 34px #17392119, 0 1.5px 8px #d4b23313",
              maxWidth: 720,
              width: "100%",
            }}
          >
            <span
              className="font-semibold text-base mb-3"
              style={{
                color: verde,
                fontSize: "1.09rem",
                letterSpacing: "-0.5px",
              }}
            >
              {pergunta}
            </span>
            <div className="flex gap-2 mb-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleChange(i, "nota", n)}
                  className={`w-11 h-11 rounded-full font-bold border flex items-center justify-center shadow-md transition-all
                    ${
                      respostas[i].nota === n
                        ? "scale-110 ring-2 ring-yellow-400"
                        : "opacity-80 hover:scale-105 hover:shadow-lg"
                    }`}
                  style={{
                    background: respostas[i].nota === n ? amarelo : "#fcfcfc",
                    color: respostas[i].nota === n ? verde : "#b3b3b3",
                    borderColor: amarelo,
                    borderWidth: 2,
                    fontSize: "1.13rem",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea
              className="border-2 p-3 rounded-xl resize-none text-base transition-all focus:shadow-md"
              style={{
                borderColor: verde,
                background: "#f8faf6",
                color: verde,
                fontFamily: "'Poppins', Arial, sans-serif",
                minHeight: 44,
                maxWidth: "100%",
              }}
              rows={2}
              placeholder="Observações (opcional)..."
              value={respostas[i].observacao}
              onChange={e => handleChange(i, "observacao", e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Botão responsivo */}
      <button
        type="submit"
        className="w-full"
        style={{
          background: `linear-gradient(90deg, ${verde} 70%, ${amarelo} 100%)`,
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.15rem",
          padding: "1rem",
          borderRadius: "1.3rem",
          boxShadow: "0 7px 30px #17392115",
          letterSpacing: "0.02em",
          marginBottom: "2.5rem",
          border: "none",
          maxWidth: 420,
        }}
      >
        Enviar checklist
      </button>
    </form>
  );
}
