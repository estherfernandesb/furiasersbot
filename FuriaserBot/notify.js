import { database } from './database.js';
import { bot } from './bot.js';


// Dados fictícios - pode ser subtituido por dados reais de um banco de dados ou API
export const PROXIMOS_JOGOS = [
  {
    id: "astana2025",
    adversario: "Time a definir",
    data: new Date("2025-06-15T19:00:00"), // Exemplo: de um possível jogo
    torneio: "PGL Astana 2025"
  }
];

export function verificarJogos() {
  const agora = new Date();
  
  PROXIMOS_JOGOS.forEach(jogo => {
    // Notificar 1 dia antes
    const umDiaAntes = new Date(jogo.data);
    umDiaAntes.setDate(umDiaAntes.getDate() - 1);
    
    if (agora >= umDiaAntes && agora <= jogo.data) {
      enviarNotificacao(jogo, "amanhã");
    }
    
    // Notificar no dia do jogo (3 horas antes)
    const tresHorasAntes = new Date(jogo.data);
    tresHorasAntes.setHours(tresHorasAntes.getHours() - 3);
    
    if (agora >= tresHorasAntes && agora <= jogo.data) {
      enviarNotificacao(jogo, "hoje");
    }
  });
}

function enviarNotificacao(jogo, quando) {
  const mensagem = `🎮 *Jogo da FURIA ${quando}!*\n\n` +
                   `🆚 vs ${jogo.adversario}\n` +
                   `⏰ ${jogo.data.toLocaleString('pt-BR')}\n` +
                   `🏆 ${jogo.torneio}\n\n` +
                   `📺 twitch.tv/furiagg`;
  
  database.notificados.forEach(userId => {
    bot.sendMessage(userId, mensagem, { parse_mode: 'Markdown' });
  });
}