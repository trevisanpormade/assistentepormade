/* ============================================================
   Assistente de Objeções — Pormade
   Banco de objeções e imagens agora vivem no Firestore.
   Este arquivo cuida de: busca da melhor resposta, casamento de
   imagens por palavra-chave, CRUD do banco e das imagens, e
   comportamento das seções colapsáveis / botões de UI.
   ============================================================ */

/* ---------- Banco padrão (usado só para semear o Firestore na
   primeira vez que o app roda, ou ao clicar em "Restaurar modelo") ---------- */
const defaultDatabase = [
  { objection: "Achei caro", keywords: ["caro", "preço", "valor", "orçamento", "mais barato", "desconto"], response: "Eu entendo perfeitamente. Quando o cliente olha só para o preço, realmente pode parecer uma decisão maior. Mas o valor do produto está ligado ao resultado que ele entrega: mais segurança na escolha, economia de tempo e uma solução pensada para evitar retrabalho.\n\nA ideia não é ser apenas mais uma compra, mas sim resolver um problema que poderia continuar custando tempo, energia e dinheiro se fosse deixado para depois." },
  { objection: "Encontrei mais barato", keywords: ["concorrente", "mais barato", "menor preço", "outra empresa", "cotação"], response: "É normal encontrar opções com preços menores. A diferença está no que cada solução entrega. Na Pormade, você recebe um kit completo, desenvolvido para agilizar a instalação, reduzir desperdícios, garantir acabamento superior e contar com suporte técnico durante todo o processo.\n\nMuitas vezes, o que parece mais barato na compra acaba ficando mais caro na instalação, nos ajustes e na manutenção." },
  { objection: "Vou pensar", keywords: ["pensar", "analisar", "depois", "decidir", "avaliar"], response: "Claro, é importante tomar uma decisão com segurança. Só gostaria de deixar um ponto para sua análise: quanto antes definirmos essa etapa, maior a tranquilidade no planejamento da obra, evitando atrasos e garantindo disponibilidade dos produtos.\n\nPosso deixar tudo preparado para que, quando você decidir, o processo seja rápido e sem preocupações." },
  { objection: "Preciso conversar com meu esposo(a) ou sócio", keywords: ["esposa", "marido", "família", "sócio", "decidir junto"], response: "Sem problemas, essa decisão realmente merece ser compartilhada. Posso fornecer todas as informações de forma organizada para facilitar essa conversa.\n\nAssim, vocês conseguem avaliar não apenas o investimento, mas também os benefícios em qualidade, durabilidade, produtividade e tranquilidade que a solução da Pormade oferece." },
  { objection: "Minha obra ainda está no começo", keywords: ["obra iniciando", "cedo", "depois", "ainda falta", "começo da obra"], response: "Na verdade, este é um dos melhores momentos para planejar. Antecipar essa definição permite acompanhar a obra corretamente, evitar imprevistos e garantir que tudo esteja pronto na fase certa da instalação.\n\nEsse planejamento reduz riscos, evita correria no final da obra e proporciona uma execução muito mais organizada." },
  { objection: "Ainda não tenho as medidas finais", keywords: ["medidas", "medição", "projeto", "conferir", "tamanho"], response: "Sem problemas. Podemos acompanhar sua obra e programar a medição no momento adequado.\n\nDessa forma, você garante o planejamento da compra sem correr o risco de perder prazo ou comprometer o cronograma da obra." },
  { objection: "Vou esperar a obra avançar mais", keywords: ["esperar", "mais para frente", "depois", "obra"], response: "Entendo. Mas justamente por acompanhar diversas obras, sabemos que deixar essa decisão para a última hora costuma gerar pressão, aumento de custos e menos opções disponíveis.\n\nAntecipando o planejamento, conseguimos acompanhar cada etapa e garantir uma entrega muito mais tranquila." },
  { objection: "Já tenho um fornecedor", keywords: ["fornecedor", "parceiro", "compro sempre", "já trabalho"], response: "Isso é ótimo, significa que você valoriza relacionamentos de confiança. A proposta da Pormade não é simplesmente substituir um fornecedor, mas apresentar uma solução que pode trazer mais produtividade, padronização, suporte técnico e redução de retrabalho para sua obra.\n\nVale a pena comparar o custo-benefício completo antes da decisão." },
  { objection: "Nunca trabalhei com a Pormade", keywords: ["nunca usei", "não conheço", "primeira compra", "empresa"], response: "É natural ter essa dúvida. Por isso acompanhamos todo o processo, desde a especificação até o pós-venda.\n\nNosso objetivo é proporcionar uma experiência segura, oferecendo suporte técnico, produtos padronizados e uma solução desenvolvida para facilitar a execução da obra." },
  { objection: "Tenho medo de atrasar a entrega", keywords: ["prazo", "atraso", "entrega", "cronograma"], response: "Essa preocupação faz todo sentido. Justamente por isso trabalhamos com planejamento da obra e acompanhamento do cronograma.\n\nNosso objetivo é alinhar produção, entrega e instalação para que tudo aconteça no momento correto, reduzindo riscos de atrasos." },
  { objection: "Não quero dor de cabeça com instalação", keywords: ["instalação", "mão de obra", "retrabalho", "problema"], response: "Esse é um dos principais diferenciais da Pormade. O Kit Porta Pronta foi desenvolvido para simplificar a instalação, reduzir retrabalho e entregar um acabamento muito mais preciso.\n\nAlém disso, você conta com orientação técnica durante todo o processo." },
  { objection: "Vou fazer orçamento com outras empresas primeiro", keywords: ["comparar", "orçamento", "concorrência", "cotação"], response: "Sem problemas, comparar faz parte de uma boa decisão. Só sugiro que, além do preço, você compare tudo o que está incluído: qualidade dos materiais, acabamento, garantia, suporte técnico, facilidade de instalação e o impacto que isso terá no andamento da obra.\n\nÉ nesse conjunto que a Pormade entrega seu verdadeiro diferencial." },
  { objection: "Não estava planejando esse investimento agora", keywords: ["orçamento apertado", "sem previsão", "depois", "investimento"], response: "Compreendo. Porém, planejar essa etapa agora pode evitar custos maiores no futuro.\n\nQuando a compra é organizada com antecedência, a obra ganha previsibilidade, reduz desperdícios e evita decisões tomadas às pressas." },
  { objection: "Tenho receio da qualidade", keywords: ["qualidade", "resistência", "durabilidade", "acabamento"], response: "É uma preocupação importante. A Pormade investe em processos industriais padronizados, controle de qualidade e soluções desenvolvidas para oferecer durabilidade, excelente acabamento e desempenho ao longo dos anos.\n\nNosso compromisso é entregar um produto que gere confiança desde a instalação até o uso diário." },
  { objection: "O concorrente entrega a mesma coisa", keywords: ["igual", "parecido", "mesma porta", "mesmo produto"], response: "Pode até parecer semelhante à primeira vista, mas existem diferenças importantes. A Pormade entrega uma solução completa, pensada para aumentar a produtividade da obra, reduzir retrabalho, facilitar a instalação e garantir um acabamento superior.\n\nQuando avaliamos todo o processo, e não apenas o produto isolado, a diferença fica evidente." },
  { objection: "Não tenho urgência", keywords: ["sem pressa", "depois vejo", "não é prioridade", "mais tarde"], response: "Perfeito. Justamente por não haver urgência, este é o momento ideal para planejar com calma.\n\nAssim conseguimos acompanhar sua obra, organizar todas as etapas e evitar qualquer imprevisto quando chegar o momento da instalação." },
  { objection: "Quero esperar uma promoção", keywords: ["promoção", "desconto", "oferta", "campanha"], response: "Entendo a expectativa. Porém, mais importante do que um desconto pontual é garantir uma solução que gere economia durante toda a obra.\n\nRedução de desperdícios, menor retrabalho, instalação mais rápida e suporte técnico costumam representar um ganho muito maior do que apenas uma diferença no preço de compra." },
  { objection: "Tenho medo do pós-venda", keywords: ["garantia", "assistência", "suporte", "pós-venda"], response: "Essa é uma preocupação muito válida. Um dos diferenciais da Pormade é justamente acompanhar o cliente antes, durante e depois da venda.\n\nNosso compromisso não termina na entrega; oferecemos suporte para que todo o processo aconteça da melhor forma possível, trazendo mais segurança para sua decisão." },
  { objection: "Não tenho instalador de confiança", keywords: ["instalador", "quem instala", "mão de obra", "não conheço instalador", "instalação"], response: "Essa é uma situação muito comum. Pensando nisso, a Pormade conta com a rede Mestres da Instalação, formada por profissionais capacitados e preparados para instalar nossos produtos seguindo os padrões da fábrica.\n\nAssim, você ganha mais segurança, qualidade na execução e evita problemas causados por instalações inadequadas." },
  { objection: "Meu pedreiro pode instalar", keywords: ["pedreiro", "qualquer um instala", "mão de obra", "instalar"], response: "Pode parecer uma instalação simples, mas o desempenho da porta depende diretamente da forma como ela é instalada. A Pormade recomenda profissionais especializados para garantir alinhamento, vedação, acabamento e funcionamento perfeito.\n\nCom os Mestres da Instalação, você reduz significativamente o risco de retrabalho e preserva toda a qualidade do produto." },
  { objection: "Tenho receio da instalação dar problema", keywords: ["problema", "instalação", "retrabalho", "erro", "preocupação"], response: "Essa preocupação é totalmente válida. Por isso a Pormade investe não apenas em produtos de alta qualidade, mas também em uma rede de instaladores especializados.\n\nOs Mestres da Instalação seguem procedimentos padronizados, proporcionando mais tranquilidade, rapidez e um acabamento que valoriza o investimento realizado." },
  { objection: "Já tenho um instalador", keywords: ["meu instalador", "instalador próprio", "equipe", "empreiteiro"], response: "Ótimo! Caso prefira, seu profissional pode realizar a instalação. Mas vale considerar que os Mestres da Instalação conhecem todos os detalhes técnicos dos produtos Pormade e seguem os padrões recomendados pela fábrica.\n\nIsso reduz imprevistos, evita adaptações desnecessárias e garante o melhor resultado possível." },
  { objection: "Não quero depender de terceiros para instalar", keywords: ["depender", "terceiros", "instalador", "agendamento"], response: "Entendo sua preocupação. Justamente por isso a rede Mestres da Instalação trabalha com planejamento e acompanhamento da obra.\n\nO objetivo é coordenar a instalação no momento correto, proporcionando uma experiência organizada e reduzindo atrasos ou conflitos no cronograma." },
  { objection: "A instalação vai demorar muito", keywords: ["demora", "tempo", "rápido", "instalação"], response: "Na verdade, um dos grandes diferenciais do Kit Porta Pronta é justamente reduzir o tempo de instalação. Como o produto já chega preparado, o processo é muito mais rápido do que sistemas convencionais.\n\nQuando executado pelos Mestres da Instalação, esse ganho de produtividade é ainda maior, reduzindo impactos no andamento da obra." },
  { objection: "Se der problema depois, quem resolve?", keywords: ["garantia", "assistência", "problema", "instalação", "pós-venda"], response: "Você não fica sozinho após a compra. A Pormade acompanha todo o processo e conta com suporte técnico para orientar sempre que necessário.\n\nAlém disso, quando a instalação é realizada pelos Mestres da Instalação, todo o processo segue os padrões recomendados pela fábrica, proporcionando ainda mais segurança e tranquilidade." },
  { objection: "Não quero correr risco de retrabalho", keywords: ["retrabalho", "erro", "refazer", "prejuízo"], response: "Esse é exatamente um dos motivos pelos quais a Pormade desenvolveu todo o seu sistema de instalação. O Kit Porta Pronta aliado aos Mestres da Instalação reduz erros, desperdícios e ajustes durante a obra.\n\nO resultado é mais produtividade, melhor acabamento e menos custos inesperados." },
  { objection: "Nunca ouvi falar dos Mestres da Instalação", keywords: ["mestres da instalação", "o que é", "como funciona", "instaladores"], response: "Os Mestres da Instalação são profissionais parceiros da Pormade, treinados e qualificados para instalar nossos produtos seguindo os padrões técnicos da fábrica.\n\nIsso garante mais qualidade, segurança, agilidade e uma experiência muito mais tranquila para o cliente durante toda a obra." },
  { objection: "A instalação especializada deve ser mais cara", keywords: ["instalação cara", "custo da instalação", "mão de obra cara", "valor da instalação"], response: "É comum pensar assim, mas uma instalação especializada costuma representar economia no resultado final. Um serviço bem executado evita retrabalho, desperdício de materiais, ajustes posteriores e possíveis danos ao produto.\n\nCom os Mestres da Instalação, você investe em qualidade desde o início e reduz custos que normalmente aparecem quando a instalação não é feita corretamente." }
];

/* ---------- Referências do Firestore ---------- */
const objecoesRef = db.collection("objecoes");
const imagensRef = db.collection("imagens");

/* ---------- Estado em memória (alimentado pelo Firestore em tempo real) ---------- */
let database = [];
let imagesDatabase = [];
let firstLoadDone = false;

/* ---------- Elementos ---------- */
const userQuestion = document.getElementById("userQuestion");
const answerBox = document.getElementById("answerBox");
const matchesBox = document.getElementById("matchesBox");
const databaseList = document.getElementById("databaseList");
const imagesSection = document.getElementById("imagesSection");
const imagesGrid = document.getElementById("imagesGrid");
const imagesEmptyMsg = document.getElementById("imagesEmptyMsg");
const imagesList = document.getElementById("imagesList");

/* ============================================================
   Busca da melhor resposta
   ============================================================ */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreQuestion(question, item) {
  const q = normalize(question);
  const objection = normalize(item.objection);
  const keywords = (item.keywords || []).map(normalize);
  let score = 0;

  if (q.includes(objection) || objection.includes(q)) score += 5;

  keywords.forEach(keyword => {
    if (q.includes(keyword)) score += 3;
    const words = keyword.split(" ");
    words.forEach(word => {
      if (word.length > 3 && q.includes(word)) score += 1;
    });
  });

  const questionWords = q.split(" ").filter(word => word.length > 3);
  questionWords.forEach(word => {
    if (objection.includes(word)) score += 1;
  });

  return score;
}

function findBestAnswers(question) {
  return database
    .map(item => ({ ...item, score: scoreQuestion(question, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/* ============================================================
   Casamento de imagens por palavra-chave
   Uma imagem "bate" com a objeção encontrada se qualquer uma das
   palavras-chave da imagem tiver relação (contém/está contida)
   com qualquer palavra-chave da objeção. Não precisa bater tudo,
   nem em ordem.
   ============================================================ */
function findMatchingImages(item) {
  if (!item || !item.keywords || !item.keywords.length) return [];
  const itemKeywords = item.keywords.map(normalize);

  return imagesDatabase.filter(img => {
    const imgKeywords = (img.keywords || []).map(normalize);
    return imgKeywords.some(imgWord =>
      itemKeywords.some(itemWord =>
        imgWord.includes(itemWord) || itemWord.includes(imgWord)
      )
    );
  });
}

function renderMatchingImages(item) {
  const matches = findMatchingImages(item);

  if (!matches.length) {
    imagesSection.classList.add("hidden");
    imagesGrid.innerHTML = "";
    return;
  }

  imagesSection.classList.remove("hidden");
  imagesSection.classList.remove("collapsed"); // abre automaticamente quando há resultado
  imagesGrid.innerHTML = matches.map(img => `
    <figure class="image-tile">
      <img src="images/${img.arquivo}" alt="${img.keywords.join(", ")}" loading="lazy"
           onerror="this.closest('.image-tile').classList.add('broken')" />
      <figcaption>${img.keywords.slice(0, 3).join(", ")}</figcaption>
      <a class="download-btn" href="images/${img.arquivo}" download="${img.arquivo}">Baixar</a>
    </figure>
  `).join("");
}

/* ============================================================
   Perguntar / Responder
   ============================================================ */
function ask() {
  const question = userQuestion.value.trim();
  if (!question) {
    answerBox.textContent = "Digite uma pergunta ou objeção para eu encontrar a melhor resposta.";
    answerBox.classList.add("muted");
    return;
  }

  const matches = findBestAnswers(question);
  const best = matches[0];

  if (!best || best.score <= 0) {
    answerBox.textContent = "Ainda não encontrei uma resposta ideal no banco. Cadastre essa objeção para melhorar o sistema.";
    answerBox.classList.add("muted");
    matchesBox.textContent = "";
    imagesSection.classList.add("hidden");
    return;
  }

  answerBox.textContent = best.response;
  answerBox.classList.remove("muted");
  matchesBox.innerHTML = matches
    .filter(item => item.score > 0)
    .map(item => `Possível correspondência: <strong>${item.objection}</strong> | Pontuação: ${item.score}`)
    .join("<br>");

  renderMatchingImages(best);
}

function newObjectionReset() {
  userQuestion.value = "";
  answerBox.textContent = "A resposta aparecerá aqui.";
  answerBox.classList.add("muted");
  matchesBox.innerHTML = "";
  imagesSection.classList.add("hidden");
  imagesGrid.innerHTML = "";
  userQuestion.focus();
}

/* ============================================================
   CRUD do banco de objeções (Firestore)
   ============================================================ */
async function addItem() {
  const objection = document.getElementById("objection").value.trim();
  const keywords = document.getElementById("keywords").value.split(",").map(k => k.trim()).filter(Boolean);
  const response = document.getElementById("response").value.trim();

  if (!objection || !keywords.length || !response) {
    alert("Preencha a objeção, as palavras-chave e a resposta.");
    return;
  }

  try {
    await objecoesRef.add({ objection, keywords, response });
    document.getElementById("objection").value = "";
    document.getElementById("keywords").value = "";
    document.getElementById("response").value = "";
  } catch (error) {
    alert("Não foi possível salvar no Firebase: " + error.message);
  }
}

async function deleteItem(id) {
  if (!confirm("Deseja remover esta resposta do banco?")) return;
  try {
    await objecoesRef.doc(id).delete();
  } catch (error) {
    alert("Não foi possível remover: " + error.message);
  }
}

function renderDatabase() {
  databaseList.innerHTML = database.map(item => `
    <article class="item">
      <h3>${item.objection}</h3>
      <p class="keywords"><strong>Palavras-chave:</strong> ${(item.keywords || []).join(", ")}</p>
      <p>${item.response}</p>
      <button class="danger" onclick="deleteItem('${item.id}')">Remover</button>
    </article>
  `).join("");
}

function exportDatabase() {
  const clean = database.map(({ id, score, ...rest }) => rest);
  const blob = new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "banco-de-objecoes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Formato inválido");
      await replaceCollection(objecoesRef, imported);
      alert("Banco importado com sucesso para o Firebase.");
    } catch (error) {
      alert("Não foi possível importar. Verifique se o arquivo está no formato correto.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

async function resetDatabase() {
  if (!confirm("Deseja restaurar o banco modelo? Isso substitui os dados salvos no Firebase.")) return;
  await replaceCollection(objecoesRef, defaultDatabase);
}

/* Apaga todos os documentos de uma coleção e recria com uma nova lista */
async function replaceCollection(ref, items) {
  const snapshot = await ref.get();
  const deleteBatch = db.batch();
  snapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();

  const addBatch = db.batch();
  items.forEach(item => {
    const docRef = ref.doc();
    addBatch.set(docRef, item);
  });
  await addBatch.commit();
}

/* ============================================================
   CRUD das imagens (Firestore)
   ============================================================ */
async function addImage() {
  const arquivo = document.getElementById("imageFile").value.trim();
  const keywords = document.getElementById("imageKeywords").value.split(",").map(k => k.trim()).filter(Boolean);

  if (!arquivo || !keywords.length) {
    alert("Informe o nome do arquivo (já enviado para a pasta /images no GitHub) e ao menos uma palavra-chave.");
    return;
  }

  try {
    await imagensRef.add({ arquivo, keywords });
    document.getElementById("imageFile").value = "";
    document.getElementById("imageKeywords").value = "";
  } catch (error) {
    alert("Não foi possível salvar a imagem: " + error.message);
  }
}

async function deleteImage(id) {
  if (!confirm("Remover este vínculo de imagem?")) return;
  try {
    await imagensRef.doc(id).delete();
  } catch (error) {
    alert("Não foi possível remover: " + error.message);
  }
}

function renderImagesList() {
  imagesList.innerHTML = imagesDatabase.map(img => `
    <article class="item image-item">
      <img src="images/${img.arquivo}" alt="${img.arquivo}" loading="lazy"
           onerror="this.style.display='none'" />
      <div>
        <h3>${img.arquivo}</h3>
        <p class="keywords"><strong>Palavras-chave:</strong> ${(img.keywords || []).join(", ")}</p>
        <button class="danger" onclick="deleteImage('${img.id}')">Remover</button>
      </div>
    </article>
  `).join("");
}

/* ============================================================
   Seções colapsáveis (Cadastrar, Banco de respostas, Imagens, Gerenciar imagens)
   ============================================================ */
function setupCollapsibles() {
  document.querySelectorAll("[data-collapse-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".card");
      card.classList.toggle("collapsed");
    });
  });
}

/* ============================================================
   Firestore: carregamento inicial + tempo real
   ============================================================ */
async function seedIfEmpty() {
  const snap = await objecoesRef.limit(1).get();
  if (snap.empty) {
    const batch = db.batch();
    defaultDatabase.forEach(item => {
      const ref = objecoesRef.doc();
      batch.set(ref, item);
    });
    await batch.commit();
  }
}

function listenDatabase() {
  objecoesRef.onSnapshot(
    snapshot => {
      database = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderDatabase();
    },
    error => {
      answerBox.textContent = "Não foi possível conectar ao Firebase. Verifique sua internet ou as regras do Firestore.";
      answerBox.classList.remove("muted");
      console.error(error);
    }
  );
}

function listenImages() {
  imagensRef.onSnapshot(
    snapshot => {
      imagesDatabase = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderImagesList();
    },
    error => console.error(error)
  );
}

async function init() {
  setupCollapsibles();
  await seedIfEmpty();
  listenDatabase();
  listenImages();

  document.getElementById("askBtn").addEventListener("click", ask);
  document.getElementById("newObjectionBtn").addEventListener("click", newObjectionReset);
  document.getElementById("saveBtn").addEventListener("click", addItem);
  document.getElementById("exportBtn").addEventListener("click", exportDatabase);
  document.getElementById("importFile").addEventListener("change", importDatabase);
  document.getElementById("resetBtn").addEventListener("click", resetDatabase);
  document.getElementById("saveImageBtn").addEventListener("click", addImage);

  userQuestion.addEventListener("keydown", event => {
    if (event.key === "Enter") ask();
  });
}

init();
