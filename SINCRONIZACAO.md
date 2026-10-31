# Situação do código (31/10/2026)

O site publicado em https://pet-conecta.vercel.app NÃO é gerado deste repositório.
Ele é HTML/CSS/JS estático enviado diretamente à Vercel (sem vínculo com o Git).
O código nesta branch `main` é uma versão antiga (SPA) e está desatualizado.

Dados dinâmicos (agenda, acervo do Anamnese, linha do tempo) vêm do Supabase
(tabelas `pet_eventos`, `pet_edicoes_anamnese`, `pet_marcos`, `pet_resultados_projeto`,
`pet_sugestoes`, `pet_parcerias_demo`), com RLS: leitura pública apenas do que está publicado.

Para sincronizar: copiar a pasta do site publicado para este repositório e ligar o projeto
da Vercel ao repositório.
