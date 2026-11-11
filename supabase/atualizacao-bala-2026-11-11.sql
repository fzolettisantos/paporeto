-- =====================================================================
-- Bala do Véio — atualização de 11/11 (Data Caique informa): 72 tiros.
-- Rode UMA vez no SQL Editor do Supabase. Substitui todos os tiros do Bala do Véio
-- por esta lista (rodar de novo não duplica: apaga e recarrega a mesma lista).
-- =====================================================================

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
  insert into public.static_shots (ranking_id, participant_id, quantity, location, note, episode, episode_time, created_at)
  select v_ranking, p.id, d.quantity, d.location, d.note, d.episode, d.episode_time, now() + make_interval(secs => d.n)
  from (values
    (1, 'kleber', 11, 'Local não definido', '+ ameaça com faca', null::int, null),
    (2, 'kleber', 2, 'Na perna', null, null::int, null),
    (3, 'kleber', 4, 'Na testa', null, null::int, null),
    (4, 'kleber', 3, 'Na cabeça', null, null::int, null),
    (5, 'serdan', 18, 'Local não definido', null, null::int, null),
    (6, 'serdan', 1, 'Na cara', null, null::int, null),
    (7, 'gadu', 7, 'Na cara', null, null::int, null),
    (8, 'grafiteiro', 7, 'Local não definido', 'Se fizer o símbolo do Palmeiras no muro da casa do Véio', null::int, null),
    (9, 'mano', 2, 'Na testa', null, null::int, null),
    (10, 'mano', 2, 'Na cara', null, null::int, null),
    (11, 'mano', 1, 'Local não definido', null, null::int, null),
    (12, 'veio-tricolor', 1, 'Na própria cabeça', 'Se apanhar do Mano e do Kleber', null::int, null),
    (13, 'veio-tricolor', 1, 'No próprio ouvido', 'Se pichar o muro do XV', null::int, null),
    (14, 'veio-tricolor', 1, 'No próprio ouvido', 'Se apanhar do Kleber', null::int, null),
    (15, 'veio-tricolor', 1, 'Na própria cabeça', 'Se apanhar do Caravina', 629, '1:08:12'),
    (16, 'veio-tricolor', 1, 'Na própria cabeça', 'Se perder pra alguém do programa na disputa de quem tem o maior QI', null::int, null),
    (17, 'nem', 2, 'Na testa', null, null::int, null),
    (18, 'luiz-gusttavo', 1, 'Na testa', null, null::int, null),
    (19, 'carabina', 1, 'Na testa', null, null::int, null),
    (20, 'mastigasamba', 1, 'Local não definido', '“Foda-se o Mastigasamba”', null::int, null),
    (21, 'bruno-di-santi', 1, 'Local não definido', '+ ameaça de pendurar 3 dias numa árvore', null::int, null),
    (22, 'oberdan', 1, 'Local não definido', null, null::int, null),
    (23, 'lucas-samuel', 1, 'Local não definido', null, null::int, null),
    (24, 'dentinho', 1, null, null, null::int, null)
  ) as d(n, slug, quantity, location, note, episode, episode_time)
  join public.participants p on p.slug = d.slug;
end $$;

-- Conferência: deve mostrar 72.
select sum(quantity) as total_de_tiros from public.static_shots s
join public.rankings r on r.id = s.ranking_id where r.slug = 'bala-do-veio';
