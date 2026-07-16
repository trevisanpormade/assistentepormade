# Assistente de Objeções — Pormade

## O que mudou nesta versão

- O banco de objeções (`objeção` / `palavras-chave` / `resposta`) agora vive no
  **Firestore** (projeto `assistente-pormade`), em vez do `localStorage`.
  Todo dispositivo que abrir o app vê o mesmo banco, em tempo real.
- Nova coleção **`imagens`** no Firestore: cada documento tem `arquivo`
  (o nome do arquivo dentro da pasta `/images` do repositório) e `keywords`
  (as palavras-chave que fazem essa imagem aparecer).
- Ao encontrar a melhor resposta, o app também procura, na coleção
  `imagens`, quais imagens têm alguma palavra-chave relacionada às
  palavras-chave da objeção encontrada — não precisa bater tudo nem em
  ordem, basta uma palavra em comum (ou uma conter a outra).
- Botões novos:
  - **Nova objeção**: limpa o campo de pergunta, a resposta e as imagens.
  - Em cada card (**Cadastrar nova objeção**, **Banco de respostas**,
    **Gerenciar imagens**, **Imagens relacionadas**): clique no título para
    expandir/recolher.
  - Em cada imagem exibida: botão **Baixar**.

## Como publicar gratuitamente (GitHub Pages)

1. Crie um repositório no GitHub e suba estes arquivos:
   `index.html`, `style.css`, `script.js`, `firebase-config.js` e a pasta
   `images/` (com as fotos que você quer usar).
2. No repositório, vá em **Settings → Pages**, selecione a branch
   (geralmente `main`) e a pasta raiz (`/`). O GitHub vai gerar uma URL do
   tipo `https://seu-usuario.github.io/seu-repositorio/`.
3. Pronto — o site já vai carregar o banco direto do Firestore.

## Como adicionar imagens

1. Coloque o arquivo de imagem dentro da pasta `images/` do repositório
   (ex.: `images/kit-porta-pronta.jpg`) e suba (`commit` + `push`) para o
   GitHub.
2. No app, abra o card **Gerenciar imagens**, informe o **nome exato do
   arquivo** (com extensão) e as **palavras-chave** que devem puxá-la
   (as mesmas que aparecem nas objeções, ou parecidas).
3. Salve. A partir daí, sempre que uma objeção compatível for encontrada,
   essa imagem aparece no card "Imagens relacionadas", com botão de
   download.

> O app só referencia o nome do arquivo — ele não faz upload de imagem
> para o Firebase. Quem hospeda a imagem é o próprio GitHub Pages, o que
> mantém tudo gratuito.

## Configurar as Regras de Segurança do Firestore

A `apiKey` do Firebase para apps web **não é secreta** (ela só identifica o
projeto); quem protege os dados de verdade são as **Regras de Segurança**.
Como este é um sistema interno de vendas, uma configuração simples e segura
o suficiente para começar é: leitura livre, escrita liberada (já que a
equipe usa o próprio app para cadastrar). No console do Firebase, em
**Firestore Database → Regras**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /objecoes/{doc} {
      allow read, write: if true;
    }
    match /imagens/{doc} {
      allow read, write: if true;
    }
  }
}
```

Se no futuro quiser restringir quem pode editar (só leitura pública, escrita
só por quem estiver logado), me avise que ajusto isso com autenticação do
Firebase.

## Primeira execução

Na primeira vez que o app abrir com o Firestore vazio, ele semeia
automaticamente a coleção `objecoes` com os dados que já estavam no
`banco-de-objecoes.json` / `script.js`. Depois disso, todo cadastro,
edição ou remoção feito pelo app grava direto no Firestore.
