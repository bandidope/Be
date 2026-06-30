const delay = ms => new Promise(res => setTimeout(res, ms));

export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false; // [Solo pv]
  if (!m.message || !m.text) return true;

  // [WHITELIST] Si escribe esto, sí responde
  const allowed = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'jadibot', 'reglas', 'menu', 'bot', 'ford', 'info'];
  if (allowed.some(word => m.text.toLowerCase().includes(word))) return true;

  const bot = global.db.data.settings[conn.user.jid] || {};
  const linkGrupo = 'https://chat.whatsapp.com/LjPhgjqCM934QEzYz3vrVk';

  if (bot.antiPrivate && !isOwner && !isROwner) {
    await delay(3000 + Math.random()*4000); // [Delay humano 3s a 7s]
    
    await conn.sendMessage(m.sender, {
      text: `👋 *For Three Bot*\n\nSolo atiendo por el grupo oficial bro 👇\n${linkGrupo}\n\nAquí en pv no respondo. Gracias por entender 🙏`
    });
    return true; // [Corta ahí. NO BLOQUEA]
  }
  return true;
}