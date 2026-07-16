// firebase-config.js
// Configuração do projeto Firebase (assistente-pormade)
// A apiKey de apps web do Firebase não é secreta — ela apenas identifica o
// projeto. Quem protege os dados são as Regras de Segurança do Firestore
// (veja README.md). Ainda assim, mantenha este arquivo fora de repositórios
// muito sensíveis se preferir usar variáveis de ambiente no futuro.

const firebaseConfig = {
  apiKey: "AIzaSyCJefVl93b6cuR5JhBmyIGPBa1-Ve5ikDw",
  authDomain: "assistente-pormade.firebaseapp.com",
  projectId: "assistente-pormade",
  storageBucket: "assistente-pormade.firebasestorage.app",
  messagingSenderId: "288765517143",
  appId: "1:288765517143:web:ac849c8e5ba9cc3b3a3212"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
