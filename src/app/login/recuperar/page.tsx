"use client";
import { useState } from "react";
// Ajuste o caminho do firebase conforme sua estrutura de pastas!
import { auth } from "../../lib/firebase"; // Use '../lib/firebase' se o arquivo estiver fora da pasta login
import { sendPasswordResetEmail } from "firebase/auth";

const verde = "#173921";
const amarelo = "#D4B233";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErro("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Verifique sua caixa de entrada para redefinir sua senha.");
    } catch (err: any) {
      setErro("Não foi possível enviar o e-mail. Verifique se digitou corretamente.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center" style={{ background: "#f3f4f6" }}>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full max-w-sm">
        <img src="/logo.jpeg" alt="Logo" className="w-20 mb-3 rounded-xl shadow" />
        <h2 className="text-xl font-bold mb-5" style={{ color: verde }}>Recuperar Senha</h2>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          className="mb-3 w-full p-3 rounded-xl border border-gray-300"
          style={{ background: "#f7f8f8" }}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {msg && <div className="mb-2 text-green-700 text-sm">{msg}</div>}
        {erro && <div className="mb-2 text-red-600 text-sm">{erro}</div>}
        <button
          type="submit"
          className="w-full"
          style={{
            background: verde,
            color: amarelo,
            fontWeight: "bold",
            fontSize: "1.1rem",
            padding: "0.9rem",
            borderRadius: "1rem"
          }}
        >
          Enviar link de recuperação
        </button>
        <button
          type="button"
          className="text-sm text-gray-400 hover:underline mt-4"
          onClick={() => window.location.href = "/login"}
        >
          Voltar ao login
        </button>
      </form>
    </div>
  );
}
