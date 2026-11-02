# Sistema de qualidade do PET Conecta

Três verificadores acusam os problemas do mapeamento de 02/11/2026. Cada código (Q, T, B) corresponde a uma linha do plano de correção.

| Verificador | Comando | O que confere |
| --- | --- | --- |
| Estático | `python3 ferramentas/checar-qualidade.py` | Q01–Q19: filtro de salvos, rolagem cortada no CSS, contraste nos 3 temas, cores e espaçamentos fora dos tokens, setas de link, arquivos soltos, JS morto, CSP, site.css em dia com a origem |
| Telas | `python3 ferramentas/checar-telas.py` | T01–T04: rolagem lateral, tabela cortada, erros no console e alvos de toque, em 390 e 1280 px, claro e escuro. Precisa do Playwright |
| Banco | `ferramentas/checar-banco.sql` no SQL Editor | B01–B09: RLS, políticas abertas, funções privilegiadas, votos sem chave, sobras do painel |

## Ciclo de cada correção

1. Escolher as linhas da fase atual no plano.
2. Corrigir. CSS e `site.js` são editados em `ferramentas/origem/` e depois gerados com `python3 ferramentas/unir-arquivos.py`.
3. Rodar `checar-arquivos.py`, `checar-qualidade.py` e `checar-telas.py`. Nenhuma FALHA pode sobrar; os números META não podem subir.
4. Olhar as capturas de 390 px em `ferramentas/telas/`.
5. Publicar só com autorização. Mudanças no banco (migrações, RLS) pedem confirmação separada.
6. Conferir o site no ar e marcar a linha como concluída no plano.
