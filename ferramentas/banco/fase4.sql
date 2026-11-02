-- Fase 4 do plano de correcao (PET Conecta, banco do Supabase "Planejamento").
-- AINDA NAO APLICADA. So roda com confirmacao explicita do dono do projeto.
-- Conferido em 02/11/2026: nenhuma politica, funcao, view ou chave estrangeira depende de pet_admins ou pet_is_admin,
-- e pet_sugestoes nao tem politica de INSERT (as sugestoes chegam por e-mail), entao a trigger nao e usada.

-- Tarefa 18: voto que chega sem IP deixa de passar sem limite.
-- Sem chave de visitante, o tema aceita no maximo 10 votos por hora nessa condicao.
create or replace function public.pet_votar_tema(p_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v integer; h json; ip text; chave text; sal text;
begin
  if not exists (select 1 from public.pet_sugestoes where id = p_id and status = 'aprovada') then
    raise exception 'Tema indisponivel.';
  end if;

  begin h := current_setting('request.headers', true)::json; exception when others then h := null; end;
  ip := btrim(split_part(coalesce(nullif(h->>'cf-connecting-ip',''), nullif(h->>'x-forwarded-for',''), nullif(h->>'x-real-ip',''), ''), ',', 1));
  if ip like '%:%' then
    ip := coalesce(substring(ip from '^([0-9a-fA-F]{0,4}(:[0-9a-fA-F]{0,4}){0,3})'), ip);
  end if;

  if ip <> '' then
    select valor into sal from public.pet_segredos where nome = 'voto_sal';
    chave := encode(digest(ip || ':' || sal, 'sha256'), 'hex');
    if exists (select 1 from public.pet_votos_log
               where tema_id = p_id and visitante = chave and criado_em > now() - interval '24 hours') then
      raise exception 'Voce ja votou neste tema.';
    end if;
  end if;

  if chave is null and (select count(*) from public.pet_votos_log
                        where tema_id = p_id and visitante is null and criado_em > now() - interval '1 hour') >= 10 then
    raise exception 'Muitos votos neste tema nesta hora. Tente mais tarde.';
  end if;

  if (select count(*) from public.pet_votos_log where tema_id = p_id and criado_em > now() - interval '1 hour') >= 120 then
    raise exception 'Muitos votos neste tema nesta hora. Tente mais tarde.';
  end if;

  insert into public.pet_votos_log(tema_id, visitante) values (p_id, chave);
  update public.pet_sugestoes set votos = votos + 1 where id = p_id returning votos into v;
  return v;
end $function$;

-- Tarefa 19: sobras do painel de administracao removido (tabela vazia, funcao e trigger sem uso).
drop trigger if exists pet_sugestoes_limite on public.pet_sugestoes;
drop function if exists public.pet_sugestoes_limite();
drop function if exists public.pet_is_admin();
drop table if exists public.pet_admins;
