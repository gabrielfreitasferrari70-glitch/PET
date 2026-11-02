-- Verificacao do banco do PET Conecta (tabelas pet_* no projeto Supabase Planejamento).
-- Somente leitura. Cada linha devolvida e um problema; resultado vazio = tudo certo.
-- Rodar no SQL Editor do Supabase ou pedir ao Claude para rodar.

-- B01 Tabela do PET sem RLS
select 'B01' as codigo, 'Tabela sem RLS' as problema, c.relname as detalhe
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'pet\_%' and not c.relrowsecurity

union all
-- B02 Politica que deixa o publico (anon) ou todos gravarem
select 'B02', 'Politica de escrita aberta', p.tablename || ' · ' || p.policyname
from pg_policies p
where p.schemaname = 'public' and p.tablename like 'pet\_%' and p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  and (p.roles && array['anon', 'public']::name[])

union all
-- B03 Leitura publica que nao filtra por publicado/aprovado
select 'B03', 'Leitura publica sem filtro', p.tablename || ' · ' || coalesce(p.qual, '(sem condicao)')
from pg_policies p
where p.schemaname = 'public' and p.tablename like 'pet\_%' and p.cmd = 'SELECT'
  and (p.roles && array['anon', 'public']::name[])
  and coalesce(p.qual, '') !~ '(publicado|aprovada)'

union all
-- B04 Funcao SECURITY DEFINER do PET executavel pelo publico, fora a de voto
select 'B04', 'Funcao privilegiada aberta ao publico', p.proname
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname like 'pet\_%' and p.prosecdef
  and has_function_privilege('anon', p.oid, 'execute') and p.proname <> 'pet_votar_tema'

union all
-- B05 Votos registrados sem chave de visitante nos ultimos 30 dias (escaparam da checagem de duplicidade)
select 'B05', 'Voto sem chave de visitante', count(*)::text || ' voto(s)'
from public.pet_votos_log
where visitante is null and criado_em > now() - interval '30 days'
having count(*) > 0

union all
-- B06 Sal do voto ausente (sem ele nenhum voto e conferido)
select 'B06', 'Sal do voto ausente', 'pet_segredos.voto_sal'
where not exists (select 1 from public.pet_segredos where nome = 'voto_sal' and coalesce(valor, '') <> '')

union all
-- B07 Contagem de votos diferente do registro
select 'B07', 'Votos fora de sincronia', s.tema || ': ' || s.votos || ' contados, ' || coalesce(l.n, 0) || ' registrados'
from public.pet_sugestoes s
left join (select tema_id, count(*) n from public.pet_votos_log group by 1) l on l.tema_id = s.id
where s.votos <> coalesce(l.n, 0)

union all
-- B08 Evento publicado que termina antes de comecar ou sem data de fim e sem dia inteiro
select 'B08', 'Evento com datas inconsistentes', e.slug
from public.pet_eventos e
where e.publicado and (e.fim < e.inicio)

union all
-- B09 Sobras do painel removido
select 'B09', 'Sobra do painel de admin', o.nome
from (values ('pet_admins'), ('pet_is_admin')) o(nome)
where exists (select 1 from pg_class where relname = o.nome) or exists (select 1 from pg_proc where proname = o.nome);
