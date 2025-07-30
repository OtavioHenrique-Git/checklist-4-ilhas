"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const adminEmails = [
  "suporte@postos4ilhas.com.br",
  "compras@postos4ilhas.com.br",
  "guilherme@postos4ilhas.com.br",
  "rosany.4ilhas@gmail.com"
];

const EMAIL_KEY = "4ilhas-lembrar-email";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [lembrar, setLembrar] = useState(true);

  // Ao montar, busca email salvo
  useEffect(() => {
    const emailSalvo = localStorage.getItem(EMAIL_KEY);
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrar(true);
    } else {
      setLembrar(false);
    }
  }, []);

  // Atualiza email no localStorage conforme o checkbox e input
  useEffect(() => {
    if (lembrar && email) {
      localStorage.setItem(EMAIL_KEY, email);
    } else if (!lembrar) {
      localStorage.removeItem(EMAIL_KEY);
    }
  }, [lembrar, email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await setPersistence(auth, lembrar ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const userEmail = cred.user.email || "";
      if (adminEmails.includes(userEmail)) {
        router.push("/admin");
      } else {
        router.push("/checklist");
      }
    } catch (err) {
      setErro("E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#b4b25a]">
      {/* Fundo decorativo */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g1" cx="80%" cy="40%" r="90%" fx="80%" fy="40%" gradientTransform="rotate(110)">
            <stop offset="0%" stopColor="#eae7d6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#b4b25a" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#g1)" />
        <ellipse cx="900" cy="700" rx="280" ry="110" fill="#fff6d019" />
        <ellipse cx="500" cy="200" rx="350" ry="100" fill="#17392119" />
        <ellipse cx="400" cy="400" rx="200" ry="80" fill="#D4B23322" />
      </svg>
      {/* Painel login */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-[390px] flex flex-col items-center px-8 py-10 rounded-[2.2rem] shadow-2xl bg-white/90 backdrop-blur-[6px] border border-[#e2e7e6] animate-fadeIn"
      >
        {/* Logo */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg border-2 border-[#D4B233]">
          <img
            src="/logo.jpeg"
            alt="Logo 4 Ilhas"
            className="w-16 h-16 object-contain"
          />
        </div>
        <h2 className="mb-7 mt-7 text-2xl font-extrabold text-center tracking-tight text-[#173921]">Bem-vindo!</h2>
        
        {/* Input E-mail */}
        <div className="relative w-full mb-3">
          <span className="absolute left-3 top-3.5 text-[#D4B233]">
            <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 4h16v16H4V4z" stroke="none"/><path d="M4 4l8 7 8-7"/></svg>
          </span>
          <input
            type="email"
            placeholder="E-mail"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={`pl-10 pr-3 py-3 rounded-xl border focus:border-[#D4B233] bg-[#f5f6fa] text-base font-medium shadow-sm outline-none w-full transition-all
              ${erro ? "border-red-300 bg-red-50" : "border-gray-200"}
            `}
          />
        </div>

        {/* Input Senha */}
        <div className="relative w-full mb-1">
          <span className="absolute left-3 top-3.5 text-[#D4B233]">
            <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="13" r="4"/><path d="M6 11v-2a6 6 0 1112 0v2"/></svg>
          </span>
          <input
            type="password"
            placeholder="Senha"
            autoComplete="current-password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            className={`pl-10 pr-3 py-3 rounded-xl border focus:border-[#D4B233] bg-[#f5f6fa] text-base font-medium shadow-sm outline-none w-full transition-all
              ${erro ? "border-red-300 bg-red-50" : "border-gray-200"}
            `}
          />
        </div>

        {/* Erro */}
        {erro && (
          <span className="mb-2 mt-1 text-sm font-semibold text-red-600 bg-red-50 p-2 rounded-xl shadow-sm w-full text-center animate-fadeIn">
            {erro}
          </span>
        )}

        {/* Checkbox e Esqueci minha senha */}
        <div className="flex items-center justify-between w-full my-2 text-xs text-[#556168]">
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              id="rememberMe"
              className="accent-[#D4B233] rounded"
              checked={lembrar}
              onChange={() => setLembrar(!lembrar)}
            />
            <label htmlFor="rememberMe" className="select-none cursor-pointer">Lembrar-me</label>
          </div>
          <button
            type="button"
            className="hover:underline text-[#173921] font-medium"
            onClick={() => router.push("/login/recuperar")}
          >
            Esqueci a senha
          </button>
        </div>

        {/* Botão Entrar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center bg-gradient-to-r from-[#173921] to-[#D4B233] hover:opacity-95 transition-all font-bold text-lg py-3 rounded-2xl shadow disabled:opacity-70 disabled:cursor-not-allowed select-none"
        >
          {loading && (
            <svg className="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          )}
          Entrar
        </button>

        <div className="mt-7 text-gray-400 text-xs opacity-90 select-none text-center">
          Rede 4 Ilhas <span className="mx-1">•</span> Segurança garantida
        </div>
      </form>
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.85s cubic-bezier(.2,.8,.24,1.01);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(36px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
