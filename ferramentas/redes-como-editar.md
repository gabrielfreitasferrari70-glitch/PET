# Como editar os posts e vídeos dos projetos

Os blocos "No Instagram" e "No YouTube" de cada projeto vêm de `redes-dados.json`, na raiz do site. Um bloco sem itens fica escondido.

Cada projeto tem duas listas. Exemplo:

```json
"acuidade-visual": {
  "instagram": [
    { "titulo": "Texto curto do post", "url": "https://www.instagram.com/petmedicina.ufmt/p/CODIGO/" }
  ],
  "youtube": [
    { "titulo": "Título do vídeo", "id": "CODIGO_DO_VIDEO" }
  ]
}
```

- `url` é o endereço completo do post, começando por `https://www.instagram.com/`.
- `id` é o código de 11 caracteres que vem depois de `watch?v=` no endereço do vídeo.
- A ordem da lista é a ordem na página.

Antes de publicar, rode `python3 ferramentas/checar-redes.py` para encontrar erros de digitação.
