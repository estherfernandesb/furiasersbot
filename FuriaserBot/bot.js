import TelegramBot from 'node-telegram-bot-api';
import { palavrasChave } from './palavrasChaves.js';
import { database } from './database.js';
import { verificarJogos } from './notify.js';

const token = '#############'; // Substitua pelo seu token real
const bot = new TelegramBot(token, { polling: true });

// Banco de dados de palavras-chave e respostas
// Em bot.js
let palavrasAtivas = palavrasChave;
bot.onText(/\/recarregar/, async (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  
  try {
    const { palavrasChave: novasPalavras } = await import('./palavrasChave.js?update=' + Date.now());
    palavrasAtivas = novasPalavras;
    console.log(msg.chat.id, `✅ Palavras-chave recarregadas! (${Object.keys(novasPalavras).length} termos)`);
  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Erro ao recarregar: ${err.message}`);
  }
});
// Comando básico
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `🔥 Diga algo sobre a FURIA CS2 e eu te respondo!`);
});

// Analisa todas as mensagens
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const texto = msg.text.toLowerCase();
  let resposta = null;

  // Procura por palavras-chave
  for (const [palavra, dados] of Object.entries(palavrasChave)) {
    if (texto.includes(palavra)) {
      resposta = dados.resposta;
      break; // Para na primeira correspondência
    }
  }

  // Resposta padrão se não encontrar
  if (!resposta) {
    const termos = Object.keys(palavrasChave).join(", ");
    resposta = `Não entendi, mas você pode perguntar sobre outras coisas`;
  }

  bot.sendMessage(msg.chat.id, resposta, { parse_mode: 'Markdown' });
});

// Verificar jogos a cada 6 horas
setInterval(verificarJogos, 6 * 60 * 60 * 1000);

// Handler para respostas "sim" ou "não"
bot.on('message', (msg) => {
  const texto = msg.text.toLowerCase();
  const userId = msg.from.id;

  if (texto === 'sim') {
    database.notificados.add(userId);
    bot.sendMessage(msg.chat.id, "✅ Você receberá notificações dos jogos!");
  } 
  else if (texto === 'não' || texto === 'nao') {
    database.notificados.delete(userId);
    bot.sendMessage(msg.chat.id, "❌ Notificações desativadas.");
  }
});

console.log('Bot de CS2 com palavras-chave está rodando!');

export { bot };