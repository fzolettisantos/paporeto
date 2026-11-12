-- =====================================================================
-- Bala do Véio — atualização de 12/11 (Data Caique informa): 82 tiros (+10 na testa do Mano, com vídeo).
-- Rode UMA vez no SQL Editor do Supabase. Substitui todos os tiros do Bala do Véio
-- por esta lista (rodar de novo não duplica: apaga e recarrega a mesma lista).
-- =====================================================================

-- Garante os campos usados abaixo (bancos criados antes deles existirem).
alter table public.participants add column if not exists rankings text[];
alter table public.static_shots add column if not exists place text;
alter table public.static_shots add column if not exists note text;
alter table public.static_shots add column if not exists episode integer;
alter table public.static_shots add column if not exists episode_time text;
alter table public.static_shots add column if not exists video_url text check (video_url ~ '^https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}$');
alter table public.static_shots alter column location drop not null;
alter table public.static_shots alter column weapon drop not null;

-- O grafiteiro entra no ranking; Douglas Dias sai (a correção mudou o alvo dos 7 tiros).
insert into public.participants (slug, name, nickname, sort_order, rankings)
values ('grafiteiro', 'O Grafiteiro', 'que fizer o escudo do Palmeiras no muro do Véio', 17, array['bala-do-veio'])
on conflict (slug) do update set active = true;
update public.participants set active = false where slug = 'douglas-dias';

do $$
declare v_ranking uuid;
begin
  select id into v_ranking from public.rankings where slug = 'bala-do-veio';
  if v_ranking is null then raise exception 'Ranking bala-do-veio não encontrado'; end if;
  delete from public.static_shots where ranking_id = v_ranking;
  insert into public.static_shots (ranking_id, participant_id, quantity, location, note, episode, episode_time, video_url, created_at)
  select v_ranking, p.id, d.quantity, d.location, d.note, d.episode, d.episode_time, d.video_url, now() + make_interval(secs => d.n)
  from (values
    (1, 'kleber', 11, 'Local não definido', '+ ameaça com faca', null::int, null, null::text),
    (2, 'kleber', 2, 'Na perna', null, null::int, null, null::text),
    (3, 'kleber', 4, 'Na testa', null, null::int, null, null::text),
    (4, 'kleber', 3, 'Na cabeça', null, null::int, null, null::text),
    (5, 'serdan', 18, 'Local não definido', null, null::int, null, null::text),
    (6, 'serdan', 1, 'Na cara', null, null::int, null, null::text),
    (7, 'gadu', 7, 'Na cara', null, null::int, null, null::text),
    (8, 'grafiteiro', 7, 'Local não definido', 'Se fizer o símbolo do Palmeiras no muro da casa do Véio', null::int, null, null::text),
    (9, 'mano', 2, 'Na testa', null, null::int, null, null::text),
    (10, 'mano', 2, 'Na cara', null, null::int, null, null::text),
    (11, 'mano', 1, 'Local não definido', null, null::int, null, null::text),
    (12, 'veio-tricolor', 1, 'Na própria cabeça', 'Se apanhar do Mano e do Kleber', null::int, null, null::text),
    (13, 'veio-tricolor', 1, 'No próprio ouvido', 'Se pichar o muro do XV', null::int, null, null::text),
    (14, 'veio-tricolor', 1, 'No próprio ouvido', 'Se apanhar do Kleber', null::int, null, null::text),
    (15, 'veio-tricolor', 1, 'Na própria cabeça', 'Se apanhar do Caravina', 629, '1:08:12', null::text),
    (16, 'veio-tricolor', 1, 'Na própria cabeça', 'Se perder pra alguém do programa na disputa de quem tem o maior QI', null::int, null, null::text),
    (17, 'nem', 2, 'Na testa', null, null::int, null, null::text),
    (18, 'luiz-gusttavo', 1, 'Na testa', null, null::int, null, null::text),
    (19, 'carabina', 1, 'Na testa', null, null::int, null, null::text),
    (20, 'mastigasamba', 1, 'Local não definido', '“Foda-se o Mastigasamba”', null::int, null, null::text),
    (21, 'bruno-di-santi', 1, 'Local não definido', '+ ameaça de pendurar 3 dias numa árvore', null::int, null, null::text),
    (22, 'oberdan', 1, 'Local não definido', null, null::int, null, null::text),
    (23, 'lucas-samuel', 1, 'Local não definido', null, null::int, null, null::text),
    (24, 'dentinho', 1, null, null, null::int, null, null::text),
    (25, 'mano', 10, 'Na testa', null, null::int, '1:05:52', 'https://www.youtube.com/watch?v=qL2svAaFvd0')
  ) as d(n, slug, quantity, location, note, episode, episode_time, video_url)
  join public.participants p on p.slug = d.slug;
end $$;

-- Conferência: deve mostrar 82.
select sum(quantity) as total_de_tiros from public.static_shots s
join public.rankings r on r.id = s.ranking_id where r.slug = 'bala-do-veio';
