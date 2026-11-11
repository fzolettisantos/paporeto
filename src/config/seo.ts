import type { TabSlug } from "@/types";

/**
 * Textos de SEO de cada página: título (até ~60 caracteres), descrição (até ~155) e palavras-chave.
 * O título é combinado com o template "%s | Papo Reto Ranking" do layout.
 */
export const SEO_KEYWORDS_BASE = [
  "Papo Reto",
  "Papo Reto Canal do Benja",
  "Canal do Benja",
  "Benjamin Back",
  "Benja",
  "ranking Papo Reto",
  "resenha de futebol",
  "programa de futebol no YouTube",
];

export const HOME_SEO = {
  title: "Papo Reto Ranking: os rankings da resenha do Canal do Benja",
  description:
    "Vote todo dia no Troféu Falou Merda e no Sábio da Resenha, veja quem vai levar Bala do Véio e conheça a bancada do Papo Reto. Ao vivo de seg. a sex., 12h–14h.",
  keywords: [...SEO_KEYWORDS_BASE, "horário do Papo Reto", "que horas passa o Papo Reto", "integrantes do Papo Reto"],
};

export const TAB_SEO: Record<TabSlug, { title: string; description: string; keywords: string[] }> = {
  "falou-merda": {
    title: "Troféu Falou Merda: quem falou mais besteira no Papo Reto?",
    description:
      "Vote todo dia em quem mais falou besteira no Papo Reto do Canal do Benja. Ranking da semana, do mês e da temporada, com os últimos campeões da vergonha.",
    keywords: ["Troféu Falou Merda", "falou merda Papo Reto", "ranking falou merda", "votação Papo Reto"],
  },
  sabio: {
    title: "O Sábio da Resenha: quem é o mais sábio do Papo Reto?",
    description:
      "Milagrosamente, alguém falou algo que presta. Vote todo dia no mais sábio do Papo Reto e veja quem lidera na semana, no mês e na temporada.",
    keywords: ["Sábio da Resenha", "mais sábio Papo Reto", "ranking sábio", "votação Papo Reto"],
  },
  "bala-do-veio": {
    title: "Quem vai levar Bala do Véio? Ranking de tiros do Papo Reto",
    description:
      "O ranking de tiros do Véio Fanático Tricolor no Papo Reto: total de tiros, local, localidade e evidência (episódio e tempo) de cada um que entrou na mira.",
    keywords: ["Bala do Véio", "Véio Fanático Tricolor", "tiros do Véio", "Silvio Albertin Junior", "berinjela Papo Reto"],
  },
  bancada: {
    title: "A Bancada do Papo Reto: integrantes, apelidos e fichas",
    description:
      "Conheça os integrantes do Papo Reto: Benja, Mano, Kléber Gladiador, Véio Fanático Tricolor, Joneta, Carabina e Caique Silva. Bio, Instagram e ficha da resenha.",
    keywords: [
      "integrantes do Papo Reto",
      "bancada do Papo Reto",
      "Maurício Borges Mano",
      "Kléber Gladiador",
      "Joneta Jonas Orlando",
      "Carabina Paulo Caravina",
      "Caique Silva",
    ],
  },
  charges: {
    title: "As Charges do Oberdan sobre o Papo Reto",
    description:
      "As charges do Oberdan sobre a resenha do Papo Reto e do Canal do Benja: Benja, Mano, Véio e a bancada em desenho. Se virou charge, virou história.",
    keywords: ["charges do Oberdan", "Oberdan Machado", "charges de futebol"],
  },
};
