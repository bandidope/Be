export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false; // [Solo pv]
  if (!m.message) return true;

  // [WHITELIST] Comandos permitidos al pv
  const allowed = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'jadibot', 'reglas', 'menu', 'bot'];
  if (allowed.some(word => m.text.toUpperCase().includes(word))) return true;

  const bot = global.db.data.settings[conn.user.jid] || {};
  const linkGrupo = 'https://chat.whatsapp.com/LjPhgjqCM934QEzYz3vrVk'; // [PON TU LINK AQUI]

  if (bot.antiPrivate && !isOwner && !isROwner) {
    
    // [MENSAJE CON BOTÓN - 100% V6]
    await conn.sendMessage(m.chat, {
      text: `🚩 *AVISO IMPORTANTE*\n\nSí, si quieres comprar *For Three* únete a este grupo 👇\n\n*Guerra avisada no mata gente.*`,
      footer: '© Whois Yallico',
      buttons: [
        {
          buttonId: '.precio', // [Si lo toca lo manda a .menu]
          buttonText: { displayText: '👉 Unirse al Grupo' },
          type: 1
        }
      ],
      headerType: 1,
      contextInfo: {
        externalAdReply: {
          title: 'Ford Tribute Oficial',
          body: 'Toca aquí para unirte',
          thumbnailUrl: 'https://telegra.ph/file/957fe4031132ef90b66ec.jpg', // [Pon una imagen pro]
          sourceUrl: linkGrupo, // [El botón te manda al link]
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }).catch(_ => null);
    
    await new Promise(r => setTimeout(r, 2500)); // [2.5s para que lea]

    // [BLOQUEO DIRECTO]
    await conn.updateBlockStatus(m.chat, 'block');
  }
  return false;
}