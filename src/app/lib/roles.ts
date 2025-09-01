// src/app/lib/roles.ts

// TI/Diretoria
export const directorEmails = [
  "suporte@postos4ilhas.com.br",
  "guilherme@postos4ilhas.com.br",
  "compras@postos4ilhas.com.br",
  "rosany.4ilhas@gmail.com",
];

export function isDirectorEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return directorEmails.map((x) => x.toLowerCase()).includes(e);
}

// MONITORAMENTO — só quem pode ver/usar o módulo de monitoramento
export const monitoramentoEmails = [
  "monitoramento@postos4ilhas.com.br",
  // se tiver mais, adicione aqui
];

export function isMonitoramentoEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return monitoramentoEmails.map((x) => x.toLowerCase()).includes(e);
}
