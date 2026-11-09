# Papo Reto Ranking

> **A resenha é deles. A corneta é sua.**

Site de humor esportivo, feito por fãs, em que o público vota nos integrantes do Papo Reto
(Canal do Benja) em rankings humorísticos. **Projeto independente, sem vínculo oficial com o Canal do Benja.**

Fluxo: **entrar → escolher ranking → ver a zoeira → votar → compartilhar.**

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lucide · Supabase (+ Realtime) · Docker + Caddy (VPS).

---

## Estrutura

```
src/app/                 # páginas: /, /falou-merda, /sabio, /bala-do-veio, /charges, /admin, API, imagens Open Graph
src/components/          # Header, Hero, RankingTabs, RankingBoard, RankingCard, CharacterAvatar, ShotsTable…
src/config/              # textos dos rankings, participantes, dados do Bala do Véio, site
src/lib/                 # ranking/empates, expressões, períodos, compartilhamento (lib/server = Supabase, voto, painel)
public/characters/       # caricaturas: <participante>/<ranking>/{top,middle,bottom,neutral}.webp
public/rankings/         # troféus e artes de fundo das laterais
supabase/schema.sql      # banco: tabelas, RLS, função de voto, carga inicial
deploy/                  # servidor: docker-compose, Caddy (HTTPS) e script de preparação do VPS
.github/workflows/       # testa a cada mudança e publica no VPS a cada atualização da main
```

## Começando

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

Sem as variáveis do Supabase o site sobe em **modo demonstração**: participantes reais, mas votos **simulados**,
sinalizados por uma faixa amarela no topo e pelo selo "Dados simulados". A votação funciona (em memória, por
instância do servidor), mas nada disso é voto real. Os dados do Bala do Véio são os do programa.

| Script | O que faz |
| --- | --- |
| `npm run dev` / `npm run build` | Geram antes os manifestos de caricaturas e ilustrações (`npm run characters`) |
| `npm run check` | TypeScript + ESLint + testes |

## Rankings e expressões

| Ranking | Tipo | TOP (1º) | MIDDLE | BOTTOM (último) |
| --- | --- | --- | --- | --- |
| Falou Mais Merda (`falou-merda`) | negativo | assustado | olhando pra cima, desconfiado | sorrindo, aliviado |
| O Mais Sábio (`sabio`) | positivo | orgulhoso, confiante | pensativo | confuso, sem graça |
| Bala do Véio (`bala-do-veio`) | negativo, **sem votação** | apavorado | apreensivo | aliviado, rindo |

A expressão é escolhida automaticamente por **participante + ranking + posição** (`src/lib/ranking.ts`),
sem nenhuma regra ligada a nomes.

**Regras de classificação**

- 3+ participantes: primeiro TOP, último BOTTOM, demais MIDDLE.
- 2 participantes: primeiro TOP, segundo BOTTOM.
- 1 participante: NEUTRAL (usa `neutral.webp` se existir).

**Empates** (regra consistente, coberta por testes):

- Quem tem a mesma quantidade de votos **divide a posição** (classificação esportiva: 1º, 1º, 3º) e o card mostra "Empate".
- A expressão vale para o **grupo de votos**: o grupo com mais votos é TOP, o com menos é BOTTOM, os outros MIDDLE.
- Se **todos** estiverem empatados (inclusive com zero votos), ninguém se destacou: todos ficam NEUTRAL.
- Dentro de um empate, a ordem visual segue a ordem administrativa e o nome — sem mudar a posição.

A posição nunca é comunicada só pela caricatura ou pela cor: há numeração, selos em texto
("Líder da vergonha", "Cérebro do Papo Reto", "Na mira do Véio"…), "Subiu/Caiu", texto alternativo
descrevendo a expressão e `aria-label` em cada card.

### Bala do Véio: ranking do programa

É uma brincadeira interna do programa: **o público não vota**. A ordem segue o **total de tiros** de cada um
(mais tiros no topo; totais iguais empatam; quem não levou tiro fica em último, "longe da bronca"). As expressões
seguem as mesmas regras de posição. A aba não mostra votos, porcentagem nem botão de votar, e o voto é recusado na
API (`not_votable`) e no banco (`rankings.mode = 'static'`).

**Tiros do Véio.** Cada box mostra uma tabela com **quantidade · local do tiro (onde acerta no corpo) · localidade
(onde o Véio vai dar os tiros) · tipo de arma · evidência (episódio e tempo, ex.: "EP 629 · 1:08:12")** e o
total de tiros da pessoa; o motivo aparece numa linha abaixo do registro, e colunas sem nenhum dado no box ficam
escondidas. Acima de todos os boxes aparece o total geral. Só a quantidade é obrigatória.

- **Dados atuais:** atualização de 09/11 informada pelo Caique, em `src/config/bala-do-veio.ts`
  (mostrados no site enquanto o Supabase não está ligado) e na carga inicial do `supabase/schema.sql`.
- **Próximas atualizações:** pelo painel (seção do Bala do Véio → "Tiros"), na tabela `static_shots`.
- Pessoas citadas só nesse ranking (Serdan, Oberdan, Lucas Samuel, Dentinho, Luiz Gusttavo, Mastigasamba,
  Bruno Di Santi, Nem e Douglas Dias) estão cadastradas com `rankings = ['bala-do-veio']`.

### Arte de fundo das laterais

Os três rankings (Falou Merda, Sábio e Bala do Véio) têm arte de fundo nas laterais da tela
(`public/rankings/<ranking>-bg-left.webp` e `-bg-right.webp`), fixa nas bordas e trocada com uma
transição curta ao mudar de aba. Ela só aparece em telas a partir de 1280px e ocupa apenas o espaço livre ao
lado do conteúdo, para não ficar atrás de textos; no celular nada é carregado. Para outro ranking, adicione os dois
arquivos e a entrada em `BACKDROPS` (`src/components/RankingBackdrop.tsx`).

## Caricaturas

As caricaturas **não** estão incluídas. A arquitetura está pronta para receber arquivos do Oberdan ou de
titulares que autorizarem o uso:

```
public/characters/benja/falou-merda/top.webp
public/characters/benja/falou-merda/middle.webp
public/characters/benja/falou-merda/bottom.webp
public/characters/benja/sabio/…
public/characters/benja/bala-do-veio/…
```

- A pasta é o **slug** do participante: `kleber`, `benja`, `mano`, `joneta`, `carabina`, `gadu`, `veio-tricolor` (já criadas); aceita `.avif`, `.webp` ou `.png` (quadrado, ex.: 512×512, fundo transparente, rosto centralizado com a mesma margem).
- O manifesto é gerado sozinho no `dev`/`build`. Também dá para enviar pelo painel `/admin` (Supabase Storage), que tem prioridade sobre a pasta.
- Enquanto um arquivo não existir, aparece um **placeholder ilustrado genérico** (não retrata ninguém) com a expressão certa daquele estado. O sistema **nunca** usa outra expressão no lugar.
- Só as caricaturas da aba aberta são carregadas, e fora da tela com lazy loading.
- Os cards compartilháveis embutem a caricatura quando houver versão `.png` (o gerador de imagens não lê WebP/AVIF); senão usam o placeholder.
- Quando houver caricaturas, o rodapé mostra o crédito (`NEXT_PUBLIC_CARICATURE_CREDIT`).

## Votação

- Só **Falou Mais Merda** e **O Mais Sábio** têm votação.
- **Semana, mês e temporada.** Cada ranking com votação tem três recortes, escolhidos no seletor
  "Semana · Mês · Temporada" (e no link: `?periodo=mes` ou `?periodo=temporada`). A pessoa vota **uma vez por
  semana** em cada ranking, e esse voto soma ao mesmo tempo na semana, no mês e na temporada da data do voto.
- **A temporada é o ano** e termina em 31/12: quem estiver no topo da temporada leva o título do ano. O site mostra
  quantos dias faltam. A semana começa na segunda (configurável no painel), no fuso de São Paulo.
- No banco, cada voto guarda as três chaves (`period_key` = semana, `month_key`, `season_key`) e o placar
  `vote_totals` tem uma linha por recorte (`W2026-11-09`, `M2026-11`, `S2026`).
- A validação acontece **no servidor e no banco** (`cast_vote`): ranking ativo, participante ativo,
  voto único por votante/ranking/período (restrição `unique`) e limite de votos por IP no período.
- O votante é identificado por um cookie `httpOnly` assinado (HMAC). No banco ficam só hashes (`voter_key`, `ip_hash`), nunca o IP ou o cookie.
- Rate limit em memória por IP (12 votos/min por instância) + bloqueio de POSTs de outras origens.
- O `localStorage` não é usado como controle de voto.
- É possível ver os resultados sem votar.

**Limitação honesta:** sem login, não existe garantia absoluta de um voto por pessoa. Quem limpar os cookies
pode votar de novo — até o limite por IP do período (`VOTE_IP_LIMIT_PER_PERIOD`, padrão 20, para não punir
Wi-Fi compartilhado e 4G com CGNAT). Para eventos de grande audiência, considere somar Cloudflare Turnstile/WAF
ou login social.

**Atualização ao vivo:** os números atualizam por polling (20 s) e, com o Supabase Realtime, a cada mudança no
placar. Para não tirar o botão de baixo do dedo de ninguém, a **ordem** dos cards só muda depois do seu voto,
em ciclos de 8 s com a pessoa sem interagir, ou ao tocar em "atualizar posições". Animações respeitam
`prefers-reduced-motion`.

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode todo o arquivo [`supabase/schema.sql`](supabase/schema.sql) (pode rodar de novo sem problema). Ele cria:
   - tabelas `participants`, `rankings`, `votes`, `vote_totals`, `charges`;
   - **RLS** em todas: o público só lê participantes ativos, rankings, o placar agregado e charges publicadas; a tabela `votes` fica fechada;
   - a função `cast_vote` (executável só pela service role) e o trigger que mantém o placar;
   - o placar na publicação do **Realtime**;
   - os buckets públicos `characters` e `charges` (upload só pelo servidor);
   - os três rankings e os participantes (Kleber o Gladiador, Benja, Mano, Joneta, Carabina, Gadu Boyceta e Véio Fanático Tricolor). Novos pelo `/admin`.
   - cada participante pode entrar só em alguns rankings (`participants.rankings`; vazio = todos). O Véio Fanático Tricolor está só no Falou Merda e no Sábio.
3. Em **Project Settings → API**, copie a URL, a chave `anon` e a `service_role` para o `.env.local`.
4. Gere os segredos:
   ```bash
   openssl rand -base64 48
   ```
   Use um para `VOTE_SECRET` e outro para `ADMIN_SESSION_SECRET`, e defina uma senha longa em `ADMIN_PASSWORD`.

> A `SUPABASE_SERVICE_ROLE_KEY` só é lida no servidor (`src/lib/server/*` importa `server-only`).
> Nunca a coloque numa variável com prefixo `NEXT_PUBLIC_`.

## Painel administrativo (`/admin`)

Protegido por senha (`ADMIN_PASSWORD`), com sessão em cookie `httpOnly` assinado (12 h), limite de tentativas
de login e `noindex`. Permite:

- cadastrar, editar, ordenar e ativar/desativar participantes;
- enviar e remover caricaturas por ranking e expressão;
- ativar/pausar rankings e escolher o dia em que a semana começa;
- consultar os resultados da semana, do mês e da temporada;
- cadastrar, publicar, despublicar e excluir charges;

Sem Supabase o painel avisa que o site está em modo demonstração.

## Publicação no servidor (VPS)

O site roda num VPS (ex.: Hostinger KVM 1, São Paulo, **Ubuntu 24.04**) com Docker. O **Caddy** entrega o site e
gera o certificado HTTPS sozinho. Cada atualização da `main` é testada e publicada pelo GitHub Actions.

**1. Preparar o servidor (uma vez).** No painel do VPS, abra o **Terminal do navegador** (como root), cole todo o
conteúdo de [`deploy/server-setup.sh`](deploy/server-setup.sh) e aperte Enter. O script instala o Docker, liga o
firewall e as atualizações de segurança automáticas, cria o usuário `deploy` e mostra no fim os valores dos Secrets.

**2. Secrets no GitHub.** Em *Settings → Secrets and variables → Actions → New repository secret*:

| Secret | Valor |
| --- | --- |
| `VPS_HOST` | IP do VPS (o script mostra) |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | a chave que o script mostra (das linhas `BEGIN` até `END`, inclusive) |
| `APP_ENV` | o conteúdo do `.env` de produção (modelo abaixo) |

Modelo do `APP_ENV` (veja todas as variáveis em `.env.example`):

```
SITE_DOMAIN=seudominio.com.br
NEXT_PUBLIC_SITE_URL=https://seudominio.com.br
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VOTE_SECRET=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Sem domínio ainda? Deixe `SITE_DOMAIN` vazio e `NEXT_PUBLIC_SITE_URL=http://IP-DO-VPS`: o site responde pelo IP,
sem HTTPS, até o domínio ficar pronto.

**3. Domínio.** No DNS do domínio, crie registros **A** para `@` e `www` apontando para o IP do VPS. Com
`SITE_DOMAIN` preenchido, o Caddy gera o HTTPS sozinho na primeira visita (e o `www` redireciona para o domínio).

**4. Publicar.** Qualquer atualização na `main` publica sozinha. Para publicar sem mudar nada:
*Actions → Testar e publicar → Run workflow*. Enquanto os Secrets não existirem, o workflow só testa e pula a
publicação (sem erro).

No servidor, os arquivos ficam em `/opt/paporeto` (`app/` com o código, `docker-compose.yml`, `Caddyfile` e `.env`).
O rate limit em memória vale por instância; o limite que manda de verdade é o do banco.

## Compartilhamento

- URLs por aba: `/falou-merda`, `/sabio`, `/bala-do-veio`, `/charges` (abrem a mesma experiência já na aba).
- Botões: **Mandar no WhatsApp** (primeiro no celular), **Compartilhar ranking** (Web Share API, com fallback para copiar) e **Copiar link**.
- **Cards em imagem** (`/api/share-card?ranking=…&participant=…`): 1080×1350 com ranking, posição, caricatura, nome, votos, frase e identidade do site. Os números vêm sempre do banco, nunca da URL, então não dá para forjar um card. No celular o card vai direto para o menu de compartilhamento; no desktop, é baixado.
- Frases como "BENJA LIDERA O TROFÉU FALOU MERDA. O POVO NÃO PERDOOU!" só aparecem quando correspondem ao resultado real (líder isolado, com votos). Em modo demonstração o texto é um convite genérico e o card leva o selo "Dados simulados".
- Open Graph/Twitter por aba, sem números (para não ficar desatualizado).

## Acessibilidade

Abas com `role="tablist"` e navegação por setas/Home/End; foco visível; áreas de toque ≥ 44 px; textos
alternativos que descrevem a expressão; anúncios de voto em `aria-live`; galeria em `<dialog>` nativo (Esc
fecha e o foco volta); link "Pular para os rankings"; nada depende de hover; safe areas respeitadas.

## Pendências (dependem de vocês)

- **Caricaturas autorizadas** do Oberdan (3 expressões × 3 rankings por participante).
- **Logos em alta resolução** (SVG): os enviados têm 98×52 e 66×65 px e perdem nitidez em telas densas.
- **Autorização de uso** das marcas Papo Reto / Canal do Benja e confirmação do link oficial do YouTube (`NEXT_PUBLIC_YOUTUBE_URL`).
- Credenciais do Supabase e domínio final.
