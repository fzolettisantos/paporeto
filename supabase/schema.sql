-- =====================================================================
-- Papo Reto Ranking — schema do Supabase
-- Rode inteiro no SQL Editor do Supabase (é idempotente: pode rodar de novo).
-- =====================================================================


-- ---------------------------------------------------------------------
-- Participantes
-- ---------------------------------------------------------------------
create table if not exists public.participants (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 40),
  name         text not null check (length(name) between 1 and 60),
  nickname     text check (length(nickname) <= 80),
  active       boolean not null default true,
  sort_order   integer not null default 0,
  -- { "<ranking>": { "top": "url", "middle": "url", "bottom": "url", "neutral": "url" } }
  avatar_paths jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Rankings (o texto fica no código; aqui ficam status e período)
-- ---------------------------------------------------------------------
create table if not exists public.rankings (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  description    text,
  kind           text not null check (kind in ('positive', 'negative')),
  status         text not null default 'active' check (status in ('active', 'inactive')),
  period_kind    text not null default 'weekly' check (period_kind in ('daily', 'weekly', 'monthly', 'all_time')),
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Votos: um por votante, por ranking, por período.
-- voter_key e ip_hash são HMACs gerados no servidor (nenhum IP ou cookie cru é guardado).
-- ---------------------------------------------------------------------
-- Rankings em que cada participante aparece (null = todos).
alter table public.participants add column if not exists rankings text[];

-- Rankings estáticos (ex.: Bala do Véio) não têm votação: a ordem é definida pelo programa.
alter table public.rankings add column if not exists mode text not null default 'vote';
do $$ begin
  alter table public.rankings add constraint rankings_mode_check check (mode in ('vote', 'static'));
exception when duplicate_object then null; end $$;

create table if not exists public.static_standings (
  ranking_id     uuid not null references public.rankings(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  position       smallint not null check (position between 1 and 99),
  updated_at     timestamptz not null default now(),
  primary key (ranking_id, participant_id)
);

-- Bala do Véio: "tiros" cadastrados pelo programa (quantidade, local do tiro e tipo de arma).
create table if not exists public.static_shots (
  id             uuid primary key default gen_random_uuid(),
  ranking_id     uuid not null references public.rankings(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  quantity       integer not null check (quantity between 1 and 9999),
  location       text not null check (length(location) between 1 and 60),
  weapon         text not null check (length(weapon) between 1 and 60),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
-- Localidade onde aconteceu (opcional), ex.: "Episódio 360". Local e arma também são opcionais.
alter table public.static_shots add column if not exists place text check (length(place) <= 60);
alter table public.static_shots add column if not exists note text check (length(note) <= 200);
alter table public.static_shots alter column location drop not null;
alter table public.static_shots alter column weapon drop not null;
create index if not exists static_shots_ranking_idx on public.static_shots (ranking_id, participant_id);

create table if not exists public.votes (
  id             bigint generated always as identity primary key,
  ranking_id     uuid not null references public.rankings(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  period_key     text not null check (length(period_key) <= 20),
  voter_key      text not null check (length(voter_key) <= 100),
  ip_hash        text not null check (length(ip_hash) <= 100),
  created_at     timestamptz not null default now(),
  unique (ranking_id, period_key, voter_key)
);
create index if not exists votes_ip_idx on public.votes (ranking_id, period_key, ip_hash);

-- O voto é semanal (period_key = semana) e soma também no mês e na temporada (ano) da data do voto.
alter table public.votes add column if not exists month_key text check (length(month_key) <= 20);
alter table public.votes add column if not exists season_key text check (length(season_key) <= 20);

-- Placar agregado (leitura pública e Realtime, sem expor os votos individuais).
create table if not exists public.vote_totals (
  ranking_id     uuid not null references public.rankings(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  period_key     text not null,
  votes          integer not null default 0 check (votes >= 0),
  updated_at     timestamptz not null default now(),
  primary key (ranking_id, period_key, participant_id)
);

-- ---------------------------------------------------------------------
-- Charges
-- ---------------------------------------------------------------------
create table if not exists public.charges (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (length(title) between 1 and 120),
  image_url    text not null,
  storage_path text,
  description  text check (length(description) <= 500),
  credits      text not null default 'Oberdan',
  published_on date not null default current_date,
  published    boolean not null default false,
  width        integer,
  height       integer,
  created_at   timestamptz not null default now()
);
create index if not exists charges_published_idx on public.charges (published, published_on desc);

-- ---------------------------------------------------------------------
-- Placar: mantido por trigger
-- ---------------------------------------------------------------------
create or replace function public.apply_vote_total() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Placar da semana, do mês e da temporada (cada um é uma chave em vote_totals).
  if tg_op = 'INSERT' then
    insert into vote_totals (ranking_id, participant_id, period_key, votes)
    select new.ranking_id, new.participant_id, k, 1
    from unnest(array[new.period_key, new.month_key, new.season_key]) as k
    where k is not null
    on conflict (ranking_id, period_key, participant_id)
    do update set votes = vote_totals.votes + 1, updated_at = now();
    return new;
  elsif tg_op = 'DELETE' then
    update vote_totals set votes = greatest(votes - 1, 0), updated_at = now()
    where ranking_id = old.ranking_id and participant_id = old.participant_id
      and period_key = any (array[old.period_key, old.month_key, old.season_key]);
    return old;
  end if;
  return null;
end $$;

drop trigger if exists votes_apply_total on public.votes;
create trigger votes_apply_total after insert or delete on public.votes
for each row execute function public.apply_vote_total();

-- ---------------------------------------------------------------------
-- Voto: validação no banco. Só a service role (servidor do site) pode chamar.
-- Retorna: ok | duplicate | ip_limit | invalid | closed | not_votable
-- ---------------------------------------------------------------------
drop function if exists public.cast_vote(text, uuid, text, text, text, integer);

create or replace function public.cast_vote(
  p_ranking_slug   text,
  p_participant_id uuid,
  p_period_key     text,
  p_voter_key      text,
  p_ip_hash        text,
  p_ip_limit       integer default 20,
  p_month_key      text default null,
  p_season_key     text default null
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_ranking rankings%rowtype;
  v_count   integer;
  v_id      bigint;
begin
  select * into v_ranking from rankings where slug = p_ranking_slug;
  if not found then return 'invalid'; end if;
  if v_ranking.mode <> 'vote' then return 'not_votable'; end if;
  if v_ranking.status <> 'active' then return 'closed'; end if;
  if not exists (
    select 1 from participants
    where id = p_participant_id and active and (rankings is null or p_ranking_slug = any(rankings))
  ) then return 'invalid'; end if;
  if p_voter_key is null or p_ip_hash is null or p_period_key is null then return 'invalid'; end if;

  -- Evita corrida entre votos do mesmo IP no mesmo ranking/período.
  perform pg_advisory_xact_lock(hashtext(v_ranking.id::text || p_period_key || p_ip_hash));

  if exists (select 1 from votes where ranking_id = v_ranking.id and period_key = p_period_key and voter_key = p_voter_key) then
    return 'duplicate';
  end if;

  select count(*) into v_count from votes
  where ranking_id = v_ranking.id and period_key = p_period_key and ip_hash = p_ip_hash;
  if v_count >= greatest(p_ip_limit, 1) then return 'ip_limit'; end if;

  insert into votes (ranking_id, participant_id, period_key, month_key, season_key, voter_key, ip_hash)
  values (v_ranking.id, p_participant_id, p_period_key, p_month_key, p_season_key, p_voter_key, p_ip_hash)
  on conflict (ranking_id, period_key, voter_key) do nothing
  returning id into v_id;

  return case when v_id is null then 'duplicate' else 'ok' end;
end $$;

revoke all on function public.cast_vote(text, uuid, text, text, text, integer, text, text) from public, anon, authenticated;
grant execute on function public.cast_vote(text, uuid, text, text, text, integer, text, text) to service_role;
revoke all on function public.apply_vote_total() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RLS: o público só LÊ o necessário. Escritas passam pelo servidor (service role).
-- ---------------------------------------------------------------------
alter table public.participants enable row level security;
alter table public.rankings     enable row level security;
alter table public.votes        enable row level security;
alter table public.vote_totals  enable row level security;
alter table public.charges      enable row level security;
alter table public.static_standings enable row level security;

alter table public.static_shots enable row level security;
drop policy if exists "tiros do Véio são públicos" on public.static_shots;
create policy "tiros do Véio são públicos" on public.static_shots for select to anon, authenticated using (true);

drop policy if exists "ranking do programa é público" on public.static_standings;
create policy "ranking do programa é público" on public.static_standings for select to anon, authenticated using (true);

drop policy if exists "participantes ativos são públicos" on public.participants;
create policy "participantes ativos são públicos" on public.participants for select to anon, authenticated using (active);

drop policy if exists "rankings são públicos" on public.rankings;
create policy "rankings são públicos" on public.rankings for select to anon, authenticated using (true);

drop policy if exists "placar é público" on public.vote_totals;
create policy "placar é público" on public.vote_totals for select to anon, authenticated using (true);

drop policy if exists "charges publicadas são públicas" on public.charges;
create policy "charges publicadas são públicas" on public.charges for select to anon, authenticated using (published);

-- votes: sem nenhuma policy → anon/authenticated não leem nem escrevem.
revoke all on public.votes from anon, authenticated;
revoke insert, update, delete on public.participants, public.rankings, public.vote_totals, public.charges, public.static_standings, public.static_shots from anon, authenticated;

-- ---------------------------------------------------------------------
-- Realtime do placar
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vote_totals'
  ) then
    alter publication supabase_realtime add table public.vote_totals;
  end if;
exception when undefined_object then
  raise notice 'Publicação supabase_realtime não encontrada; Realtime desativado.';
end $$;

-- ---------------------------------------------------------------------
-- Storage: caricaturas e charges (leitura pública; upload só pelo servidor)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('characters', 'characters', true, 2097152, array['image/webp', 'image/avif', 'image/png']),
  ('charges', 'charges', true, 4194304, array['image/webp', 'image/avif', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Dados iniciais
-- ---------------------------------------------------------------------
insert into public.rankings (slug, name, description, kind, period_kind) values
  ('falou-merda', 'Troféu Falou Merda', 'Aqui o primeiro lugar é uma vergonha.', 'negative', 'weekly'),
  ('sabio', 'O Sábio da Resenha', 'Milagrosamente, alguém falou algo que presta.', 'positive', 'weekly'),
  ('bala-do-veio', 'Quem vai levar Bala do Véio?', 'Falou demais? Agora aguenta a bronca.', 'negative', 'all_time')
on conflict (slug) do nothing;

-- Bala do Véio é estático (brincadeira interna do programa, sem votação do público).
update public.rankings set mode = 'static' where slug = 'bala-do-veio';

-- Participantes do Papo Reto. Novos participantes podem ser cadastrados pelo painel /papo-reto/admin.
insert into public.participants (slug, name, nickname, sort_order) values
  ('kleber', 'Kleber o Gladiador', null, 1),
  ('benja', 'Benja', null, 2),
  ('mano', 'Mano', null, 3),
  ('joneta', 'Joneta', null, 4),
  ('carabina', 'Carabina', null, 5),
  ('gadu', 'Gadu Boyceta', 'Caique Silva', 6)
on conflict (slug) do nothing;

-- Véio Fanático Tricolor: nos três rankings (levou um tiro dele mesmo no Bala do Véio).
insert into public.participants (slug, name, nickname, sort_order, rankings) values
  ('veio-tricolor', 'Véio Fanático Tricolor', null, 7, null)
on conflict (slug) do nothing;
update public.participants set rankings = null where slug = 'veio-tricolor';

-- Citados nos dados do Bala do Véio (só nesse ranking).
insert into public.participants (slug, name, nickname, sort_order, rankings) values
  ('serdan', 'Serdan', null, 8, array['bala-do-veio']),
  ('oberdan', 'Oberdan', null, 9, array['bala-do-veio']),
  ('lucas-samuel', 'Lucas Samuel', 'do chat', 10, array['bala-do-veio']),
  ('dentinho', 'Dentinho', null, 11, array['bala-do-veio']),
  ('luiz-gusttavo', 'Luiz Gusttavo', 'torcedor do Cruzeiro', 12, array['bala-do-veio']),
  ('mastigasamba', 'Mastigasamba', null, 13, array['bala-do-veio']),
  ('bruno-di-santi', 'Bruno Di Santi', null, 14, array['bala-do-veio']),
  ('nem', 'Nem', null, 15, array['bala-do-veio']),
  ('douglas-dias', 'Douglas Dias', null, 16, array['bala-do-veio'])
on conflict (slug) do nothing;

-- Tiros do Bala do Véio — dados do programa (Caique), atualização de 09/11.
-- Só é carregado se o ranking ainda não tiver tiros (rodar o arquivo de novo não duplica).
do $$
declare v_ranking uuid;
begin
  select id into v_ranking from public.rankings where slug = 'bala-do-veio';
  if v_ranking is null or exists (select 1 from public.static_shots where ranking_id = v_ranking) then return; end if;
  insert into public.static_shots (ranking_id, participant_id, quantity, location, place, note, created_at)
  select v_ranking, p.id, d.quantity, d.location, d.place, d.note, now() + make_interval(secs => d.n)
  from (values
    (1, 'serdan', 12, 'Na testa', null, null),
    (2, 'gadu', 7, 'Local não pré-definido', null, null),
    (3, 'carabina', 1, 'Na cara', null, null),
    (4, 'oberdan', 1, 'Local não pré-definido', null, null),
    (5, 'mano', 1, 'Na cara', null, 'Porque falou da Dona Bila'),
    (6, 'lucas-samuel', 1, null, 'Chat', null),
    (7, 'dentinho', 1, null, null, null),
    (8, 'luiz-gusttavo', 1, 'Na testa', null, null),
    (9, 'mastigasamba', 1, null, null, '“Foda-se o Mastigasamba”'),
    (10, 'bruno-di-santi', 1, null, null, 'Ameaça feita nas entrelinhas + combo de deixar ele amarrado numa árvore 3 dias'),
    (11, 'kleber', 10, null, null, null),
    (12, 'kleber', 2, 'Na perna', null, 'Última atualização (09/11)'),
    (13, 'nem', 1, 'Na boca', 'Episódio 360', null),
    (14, 'douglas-dias', 7, null, null, 'Pediu pra um grafiteiro fazer o escudo do Palmeiras no muro da casa do Véio'),
    (15, 'veio-tricolor', 1, 'Na cabeça (nele mesmo)', 'EP 629, aos 1:08:12',
      '“Se eu apanhar de um gordinho desse (Carabina) eu dou um tiro na minha cabeça”')
  ) as d(n, slug, quantity, location, place, note)
  join public.participants p on p.slug = d.slug;
end $$;
