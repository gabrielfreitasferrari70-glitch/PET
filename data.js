/*
  CONTEÚDO DO SITE — edite só este arquivo para atualizar o PET Conecta.
  Regra: só coloque informação confirmada pelo PET. Campo vazio ("") ou lista vazia
  faz o site mostrar "a confirmar" / o estado vazio, nunca inventa dados.
*/
window.PET_DATA = {

  instagram: {
    perfil: "@petmedicina.ufmt",
    url: "https://www.instagram.com/petmedicina.ufmt/",
    mensagem: "https://ig.me/m/petmedicina.ufmt"
  },

  acervoJornal: "https://petmedicinaufmt.wordpress.com/",

  /* ---------- PROJETOS ----------
     tema: "Educação em saúde" | "Humanização" | "Comunicação" | "Cultura"
     Campos vazios aparecem como "A confirmar pelo PET". */
  projetos: [
    {
      id: "cadastro-do-bem",
      titulo: "Cadastro do Bem",
      tema: "Educação em saúde",
      resumo: "Conscientização sobre a importância de ser doador de medula óssea.",
      objetivo: "Informar a comunidade sobre a doação de medula óssea e estimular o cadastro de novos doadores.",
      publico: "",
      quando: "",
      comoParticipar: "",
      resultados: [
        { valor: "41", rotulo: "ações realizadas", periodo: "2024" },
        { valor: "1.880", rotulo: "pessoas alcançadas", periodo: "2024" },
        { valor: "27", rotulo: "novos cadastros", periodo: "2024" }
      ],
      fontes: [
        { texto: "Anais da Mostra de Extensão", url: "https://www.even3.com.br/anais/xvmostradeextensao/1070158-cadastro-do-bem--a-importancia-de-ser-doador-de-medula-ossea/" }
      ],
      instagram: ""
    },
    {
      id: "curso-aph",
      titulo: "Curso de Atendimento Pré-Hospitalar (APH)",
      tema: "Educação em saúde",
      resumo: "Curso de primeiros socorros e atendimento pré-hospitalar; a X edição está registrada para 2026.",
      objetivo: "Capacitar participantes para os primeiros cuidados em situações de urgência.",
      publico: "Público estimado de 45 pessoas (previsão do registro oficial).",
      quando: "",
      comoParticipar: "Somente pelo link oficial de inscrição, quando o PET publicar.",
      resultados: [
        { valor: "45", rotulo: "público estimado (previsão)", periodo: "2026" }
      ],
      fontes: [
        { texto: "SIEx/UFMT — X Curso de APH", url: "https://siex.ufmt.br/Projeto/Detalhes?projetoUID=17058" }
      ],
      instagram: ""
    },
    {
      id: "comecando-cedo",
      titulo: "Começando Cedo",
      tema: "Humanização",
      resumo: "Atividades de humanização, com capacitação de voluntários e ações autorizadas do projeto.",
      objetivo: "",
      publico: "",
      quando: "",
      comoParticipar: "",
      resultados: [],
      fontes: [],
      instagram: ""
    },
    {
      id: "jornal-anamnese",
      titulo: "Jornal Anamnese",
      tema: "Comunicação",
      resumo: "Jornal produzido pelo PET Medicina, com acervo histórico disponível online.",
      objetivo: "Contar à comunidade o que o PET realiza, em linguagem acessível.",
      publico: "Comunidade em geral.",
      quando: "Proposta: edição bimestral.",
      comoParticipar: "",
      resultados: [],
      fontes: [
        { texto: "Acervo histórico (WordPress)", url: "https://petmedicinaufmt.wordpress.com/" }
      ],
      instagram: ""
    }
  ],

  /* ---------- AGENDA ----------
     Exemplo de item (copie, preencha e remova os comentários):
     { titulo: "Curso de APH", data: "2026-11-20", hora: "08:00", fim: "12:00",
       local: "Faculdade de Medicina — UFMT", tema: "Educação em saúde",
       projeto: "curso-aph", status: "confirmado",
       inscricao: "https://link-oficial", descricao: "..." }
     status: "confirmado" | "inscricoes-abertas" | "encerrado" */
  eventos: [],

  /* ---------- AÇÕES REALIZADAS ----------
     Exemplo: { titulo: "Ação na praça", data: "2025-05-10", projeto: "cadastro-do-bem",
       resumo: "...", resultado: "120 pessoas atendidas",
       imagem: "/fotos/praca.jpg", video: "", instagram: "https://www.instagram.com/p/XXXX/" } */
  acoes: [],

  /* ---------- JORNAL ----------
     Exemplo: { titulo: "Anamnese nº 1", periodo: "Jan–Fev 2026",
       resumo: "...", pdf: "/jornal/anamnese-01.pdf" } */
  edicoes: []
};
