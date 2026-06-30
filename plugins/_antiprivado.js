export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false; // [Solo pv]
  if (!m.message || !m.text) return true;

  // [WHITELIST] Comandos permitidos al pv sin baneo
  const allowed = ['PIEDRA'];
  if (allowed.some(word => m.text.toUpperCase().includes(word))) return true;

  const bot = global.db.data.settings[conn.user.jid] || {};
  const linkGrupo = 'https://chat.whatsapp.com/LjPhgjqCM934QEzYz3vrVk'; // [TU LINK]
  const imgUrl = 'https://files.evogb.win/FXbFDD.jpg'; // [TU FOTO]

  if (bot.antiPrivate && !isOwner && !isROwner) {
    console.log('[ANTI-PRIVADO] Bloqueando a:', m.sender);
    
    // [AVISO CON IMAGEN + LINK CLICKEABLE]
    await conn.sendMessage(m.sender, {
      image: { url: imgUrl },
      caption: `🚩 *AVISO IMPORTANTE*\n\nSí, si quieres comprar *For Three* únete a este grupo 👇\n${linkGrupo}\n\nNo sigas intentando porque te va a bloquear.\n\n*Guerra avisada no mata gente.*`,
    }).catch(_ => console.log('No se pudo enviar aviso'));
    
    await new Promise(r => setTimeout(r, 2000)); // [2s para que lea]

    // [BLOQUEO DIRECTO]
    await conn.updateBlockStatus(m.sender, 'block'); 
    console.log('[ANTI-PRIVADO] Bloqueado:', m.sender);
  }
  return false;
}