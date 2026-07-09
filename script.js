const defaultDatabase = [
  {
    objection: "Achei caro",
    keywords: ["caro", "preço", "valor", "orçamento", "mais barato", "desconto"],
    response: "Eu entendo perfeitamente. Quando o cliente olha só para o preço, realmente pode parecer uma decisão maior. Mas o valor do produto está ligado ao resultado que ele entrega: mais segurança na escolha, economia de tempo e uma solução pensada para evitar retrabalho.\n\nA ideia não é ser apenas mais uma compra, mas sim resolver um problema que poderia continuar custando tempo, energia e dinheiro se fosse deixado para depois."
  },
  {
    objection: "Preciso pensar melhor",
    keywords: ["pensar", "depois", "decidir", "ver com calma", "analisar", "vou ver"],
    response: "Claro, faz sentido querer pensar com calma. Só vale observar uma coisa: normalmente, quando a pessoa sente que precisa pensar, ainda existe alguma dúvida específica segurando a decisão.\n\nPosso te ajudar a entender exatamente o que ficou em aberto: é sobre o valor, o funcionamento, o resultado esperado ou a forma de pagamento? Assim você decide com muito mais segurança."
  },
  {
    objection: "Tenho medo de não funcionar para mim",
    keywords: ["funcionar", "medo", "resultado", "serve", "para mim", "garantia", "dúvida"],
    response: "Essa dúvida é super comum. O produto foi pensado justamente para ajudar pessoas que ainda não sabem exatamente por onde começar ou que já tentaram outras soluções antes.\n\nO diferencial está na forma como ele conduz o processo: ele não depende apenas de inspiração ou tentativa, mas de um método mais claro, com etapas que ajudam você a aplicar na prática e perceber evolução com mais segurança."
  },
  {
    objection: "Vou deixar para comprar depois",
    keywords: ["depois", "mais tarde", "outro dia", "futuro", "não agora", "próximo mês"],
    response: "Entendo. Só que muitas vezes deixar para depois mantém o mesmo problema acontecendo por mais tempo.\n\nSe isso já é algo que você percebe que precisa resolver, começar agora pode te poupar tempo e trazer resultado antes. A compra não precisa ser uma decisão impulsiva, mas pode ser uma decisão consciente para sair do mesmo lugar."
  },
  {
    objection: "Não conheço a empresa/produto",
    keywords: ["não conheço", "confiança", "seguro", "empresa", "produto", "golpe", "quem são"],
    response: "Faz total sentido querer confiar antes de comprar. Uma boa decisão começa pela segurança.\n\nVocê pode analisar os materiais, ver como o produto funciona, conferir depoimentos e tirar todas as dúvidas antes de seguir. O objetivo é que você compre entendendo exatamente o que está recebendo e por que isso pode fazer sentido para você."
  }
];

let database = JSON.parse(localStorage.getItem("objectionDatabase")) || defaultDatabase;

const userQuestion = document.getElementById("userQuestion");
const answerBox = document.getElementById("answerBox");
const matchesBox = document.getElementById("matchesBox");
const databaseList = document.getElementById("databaseList");

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
  const keywords = item.keywords.map(normalize);
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
    return;
  }

  answerBox.textContent = best.response;
  answerBox.classList.remove("muted");
  matchesBox.innerHTML = matches
    .filter(item => item.score > 0)
    .map(item => `Possível correspondência: <strong>${item.objection}</strong> | Pontuação: ${item.score}`)
    .join("<br>");
}

function saveDatabase() {
  localStorage.setItem("objectionDatabase", JSON.stringify(database));
  renderDatabase();
}

function addItem() {
  const objection = document.getElementById("objection").value.trim();
  const keywords = document.getElementById("keywords").value.split(",").map(k => k.trim()).filter(Boolean);
  const response = document.getElementById("response").value.trim();

  if (!objection || !keywords.length || !response) {
    alert("Preencha a objeção, as palavras-chave e a resposta.");
    return;
  }

  database.unshift({ objection, keywords, response });
  saveDatabase();

  document.getElementById("objection").value = "";
  document.getElementById("keywords").value = "";
  document.getElementById("response").value = "";
}

function deleteItem(index) {
  if (!confirm("Deseja remover esta resposta do banco?")) return;
  database.splice(index, 1);
  saveDatabase();
}

function renderDatabase() {
  databaseList.innerHTML = database.map((item, index) => `
    <article class="item">
      <h3>${item.objection}</h3>
      <p class="keywords"><strong>Palavras-chave:</strong> ${item.keywords.join(", ")}</p>
      <p>${item.response}</p>
      <button class="danger" onclick="deleteItem(${index})">Remover</button>
    </article>
  `).join("");
}

function exportDatabase() {
  const blob = new Blob([JSON.stringify(database, null, 2)], { type: "application/json" });
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
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Formato inválido");
      database = imported;
      saveDatabase();
      alert("Banco importado com sucesso.");
    } catch (error) {
      alert("Não foi possível importar. Verifique se o arquivo está no formato correto.");
    }
  };
  reader.readAsText(file);
}

function resetDatabase() {
  if (!confirm("Deseja restaurar o banco modelo? Isso substitui os dados salvos neste navegador.")) return;
  database = defaultDatabase;
  saveDatabase();
}

document.getElementById("askBtn").addEventListener("click", ask);
document.getElementById("saveBtn").addEventListener("click", addItem);
document.getElementById("exportBtn").addEventListener("click", exportDatabase);
document.getElementById("importFile").addEventListener("change", importDatabase);
document.getElementById("resetBtn").addEventListener("click", resetDatabase);
userQuestion.addEventListener("keydown", event => {
  if (event.key === "Enter") ask();
});

renderDatabase();
