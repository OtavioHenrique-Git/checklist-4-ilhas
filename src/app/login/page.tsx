"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

const verde = "#173921";
const amarelo = "#D4B233";
const cinzaClaro = "#F3F4F6";

const adminEmails = [
  "suporte@postos4ilhas.com.br",
  "diretor@4ilhas.com",
  "admin@4ilhas.com"
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const userEmail = cred.user.email || "";
      if (adminEmails.includes(userEmail)) {
        router.push("/admin");
      } else {
        router.push("/checklist");
      }
    } catch (err) {
      setErro("Email ou senha incorretos");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: `linear-gradient(120deg, #e7e9ec 0%, #f3f4f6 100%)`,
      }}
    >
      <form
        className="rounded-3xl shadow-2xl p-10 flex flex-col items-center w-full max-w-sm bg-white"
        onSubmit={handleLogin}
        style={{
          boxShadow: "0 10px 50px 0 #0001, 0 1.5px 4px #d4b23322",
          border: "1.5px solid #e0e2e6",
        }}
      >
        <div
          className="flex items-center justify-center bg-white shadow-lg rounded-2xl p-3 mb-4"
          style={{
            marginTop: "-70px",
            boxShadow: "0 4px 24px #17392133",
            position: "relative",
            zIndex: 2,
          }}
        >
          <img
            src="/logo.jpeg"
            alt="Logo 4 Ilhas"
            className="w-20 h-20 rounded-xl object-contain"
            style={{
              border: `3px solid ${amarelo}`,
              background: "#fff",
            }}
          />
        </div>
        <h2
          className="mb-7 mt-1 text-2xl font-bold text-center"
          style={{ color: verde, letterSpacing: "-0.5px", fontFamily: "inherit" }}
        >
          Bem-vindo!
        </h2>

        <input
          type="email"
          placeholder="E-mail"
          className="mb-3 w-full p-3 rounded-xl border border-gray-200 focus:border-[var(--verde)] focus:outline-none text-base transition-all"
          style={{
            background: cinzaClaro,
            borderColor: "#e1e4e8",
            fontWeight: 500,
            boxShadow: "0 2px 12px #d4b23310",
          }}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="mb-3 w-full p-3 rounded-xl border border-gray-200 focus:border-[var(--verde)] focus:outline-none text-base transition-all"
          style={{
            background: cinzaClaro,
            borderColor: "#e1e4e8",
            fontWeight: 500,
            boxShadow: "0 2px 12px #d4b23310",
          }}
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />
        {erro && (
          <span className="mb-2 mt-2 text-sm font-semibold text-red-600 bg-red-50 p-2 rounded-xl shadow-sm">
            {erro}
          </span>
        )}
        <button
          type="submit"
          className="w-full mt-4"
          style={{
            background: `linear-gradient(90deg, ${verde} 70%, ${amarelo} 100%)`,
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.15rem",
            padding: "0.95rem",
            borderRadius: "1.1rem",
            boxShadow: "0 4px 18px #17392111",
            letterSpacing: "0.02em",
            transition: "all 0.2s",
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = "0.93")}
          onMouseOut={e => (e.currentTarget.style.opacity = "1")}
        >
          Entrar
        </button>

        {/* BOTÃO ESQUECI MINHA SENHA */}
        <button
          type="button"
          className="text-sm text-gray-400 hover:underline mt-3 mb-2"
          style={{ fontWeight: 500 }}
          onClick={() => router.push("/login/recuperar")}
        >
          Esqueci minha senha
        </button>

        <div className="mt-7 text-gray-500 text-xs opacity-80 select-none">
          Rede 4 Ilhas • Segurança garantida
        </div>
      </form>
    </div>
  );
}
