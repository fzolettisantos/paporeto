/** Aba "Personagens": fichas dos integrantes do Papo Reto. */

export const PERSONAGENS_COPY = {
  slug: "personagens" as const,
  tabLabel: "Personagens",
  title: "Papo Reto: onde o futebol é sério. O resto, nem tanto.",
  subtitle: "Aqui ninguém está a salvo da zoeira.",
  description:
    "Tem apresentador que perde o controle, ex-jogador que não foge de confusão, corintiano que sofre por profissão e um Véio que distribui bronca sem pedir licença. Conheça as figuras que transformam uma simples discussão sobre futebol em um verdadeiro hospício esportivo.",
};

export interface Personagem {
  /** Slug do participante (pasta das caricaturas em public/characters). */
  slug: string;
  name: string;
  nickname: string;
  realName: string;
  role: string;
  quote: string;
  bio: string;
  especialidade: string;
  superpoder: string;
  pontoFraco: string;
  riscoTexto: string;
  /** Risco de falar merda de 1 a 5; 6 = incalculável (estoura o medidor). */
  risco: 1 | 2 | 3 | 4 | 5 | 6;
  diagnostico: string;
  /** Cor de destaque da ficha (time do coração). */
  accent: string;
}

export const PERSONAGENS: Personagem[] = [
  {
    slug: "benja",
    name: "Benja",
    nickname: "O Silvio Santos da mídia esportiva",
    realName: "Benjamin Back",
    role: "Apresentador e responsável legal pela bagunça",
    quote: "Criou o programa, convidou os malucos e agora tenta controlar a situação.",
    bio: "Benja é o maestro de uma orquestra em que ninguém sabe tocar, mas todo mundo quer fazer solo. Grita, provoca, dá risada e, quando a confusão estoura, ainda tenta colocar ordem na casa. Como se tivesse alguma chance.",
    especialidade: "Colocar lenha na fogueira e fingir que vai apagar.",
    superpoder: "Fazer cinco pessoas falarem ao mesmo tempo.",
    pontoFraco: "Estou cagando pra você.",
    riscoTexto: "Pouco... Mas às vezes ele fala.",
    risco: 2,
    diagnostico: "O hospício tem dono. Só falta alguém avisar os internos.",
    accent: "#FFD23F",
  },
  {
    slug: "mano",
    name: "Mano",
    nickname: "Sábio",
    realName: "Maurício Borges",
    role: "Comentarista e especialista em passar nervoso com o Timão",
    quote: "Mais de 20 anos falando de futebol. E o Corinthians ainda consegue surpreender negativamente.",
    bio: "Corintiano de carteirinha, reclamão por vocação e dono de uma opinião que ninguém pediu, mas todo mundo escuta (Sábio). O Mano é aquele sujeito que começa explicando futebol e, quando você percebe, já está indignado com metade do planeta.",
    especialidade: "Reclamar do Corinthians e arrumar discussão.",
    superpoder: "Tirar o Velho do giro.",
    pontoFraco: "O próprio Corinthians.",
    riscoTexto: "Altíssimo. A experiência joga a favor; às vezes a galera acha que ele quer pegar o lugar do Velho.",
    risco: 5,
    diagnostico: "Não existe paz enquanto houver uma rodada de futebol.",
    accent: "#E8E8E8",
  },
  {
    slug: "kleber",
    name: "Kléber Gladiador",
    nickname: "Monstro do Palestra",
    realName: "Ex-atacante",
    role: "Especialista em entrar de sola na discussão",
    quote: "Aposentou as chuteiras, mas a disposição pra confusão continua titular.",
    bio: "Dentro de campo era Gladiador. Fora dele, continua não levando desaforo para casa. Kléber tem a experiência de quem já enfrentou zagueiro mal-encarado e agora precisa sobreviver a uma bancada cheia de comentaristas sem freio.",
    especialidade: "Cotovelada.",
    superpoder: "Cotovelada pra caralho (o sonho é ver o cotovelo cantar no Velho).",
    pontoFraco: "O cara é gelado.",
    riscoTexto: "Depende da temperatura da resenha, mas fala pouco.",
    risco: 2,
    diagnostico: "Saiu do futebol profissional e entrou pro Papo Reto. É inacreditável ter aceitado tal convite.",
    accent: "#32D583",
  },
  {
    slug: "veio-tricolor",
    name: "Véio Fanático Tricolor",
    nickname: "O terror da berinjela",
    realName: "Silvio Albertin Junior",
    role: "Fiscal da resenha e distribuidor de esporro",
    quote: "Se não é da resenha, não entra não.",
    bio: "O Véio é a prova viva de que a paciência tem limite e a corneta não. São-paulino fanático, dono de um vocabulário que faria um juiz expulsar a bancada inteira. Quando ele abre a boca, alguém vira alvo. Se aparecer uma berinjela, é melhor correr.",
    especialidade: "Coçar o toba com a régua mágica.",
    superpoder: "Manjar no vestiário do XV.",
    pontoFraco: "Serdan, o pesadelo do Véio.",
    riscoTexto: "Incalculável. Ele prefere chamar de sinceridade.",
    risco: 6,
    diagnostico: "Idoso apenas no RG, ex-detento do Baihal.",
    accent: "#F04438",
  },
  {
    slug: "joneta",
    name: "Joneta",
    nickname: "Dedeta",
    realName: "Jonas Orlando",
    role: "Produção, áudio e alma mais pura do programa (será?)",
    quote: "Desmuta ele, Joneta! Muta ele, Joneta! Ô JONETA!",
    bio: "Nos bastidores, Joneta tenta fazer o programa funcionar enquanto a bancada faz questão de dificultar. Cuida do áudio, das interações e dos surtos coletivos. Vascaíno, já possui treinamento avançado em sofrimento e situações sem explicação.",
    especialidade: "Dedada no botão (para aplicar o VAR contra o Velho).",
    superpoder: "Sobreviver ao Papo Reto e ao Vasco.",
    pontoFraco: "Alguém gritando seu nome pela décima vez. (Sou só um!)",
    riscoTexto: "Às vezes. Mas, quando fala, ninguém perdoa.",
    risco: 3,
    diagnostico: "O único que pode silenciar a bancada. Infelizmente, nem sempre consegue.",
    accent: "#FFFFFF",
  },
  {
    slug: "carabina",
    name: "Carabina",
    nickname: "Mestre das regras (respeita o Carabas)",
    realName: "Paulo Caravina",
    role: "Especialista em arbitragem e alvo preferido da corneta",
    quote: "Ele conhece todas as regras do futebol. Só esqueceu que no Papo Reto não existe regra.",
    bio: "Carabina chega com argumento, interpretação e regulamento debaixo do braço. O problema é que ninguém quer saber. Principalmente o Véio, que já está preparando um tiro antes mesmo de ouvir a explicação. No fim, o especialista acaba tendo que recorrer à própria resenha para sobreviver.",
    especialidade: "Explicar o inexplicável e irritar o Véio.",
    superpoder: "Encontrar interpretação de arbitragem até em lance de lateral.",
    pontoFraco: "Não torço pra ninguém... (tá bom, já sabemos).",
    riscoTexto: "Alto. Principalmente quando começa com “Pela regra...”",
    risco: 4,
    diagnostico: "Entrou para analisar arbitragem. Virou réu no tribunal da zoeira.",
    accent: "#FFD23F",
  },
  {
    slug: "gadu",
    name: "Caique Silva",
    nickname: "O Gadu Boyceta",
    realName: "Jornalista esportivo",
    role: "Setorista do São Paulo e integrante da zona de risco",
    quote: "Chega com informação de bastidor e sai com um apelido novo.",
    bio: "Caique acompanha o São Paulo profissionalmente, mas ninguém preparou o rapaz para enfrentar a bancada do Papo Reto. Tenta trazer informação, análise e um mínimo de profissionalismo, deixando o Velho com ciúmes. Só que ali a seriedade dura menos que uma vantagem de um gol nos acréscimos.",
    especialidade: "Tentar informar no meio da bagunça.",
    superpoder: "Shimbalaiê.",
    pontoFraco: "Cara de boyceta é foda.",
    riscoTexto: "Moderado. Mas a fiscalização é implacável.",
    risco: 3,
    diagnostico: "Formado em Jornalismo. Pós-graduando em sobreviver à zoeira.",
    accent: "#F04438",
  },
];

export const RISCO_LABEL: Record<Personagem["risco"], string> = {
  1: "Baixíssimo",
  2: "Baixo",
  3: "Moderado",
  4: "Alto",
  5: "Altíssimo",
  6: "Incalculável",
};
