let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command);
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};
  let type = (args[0] || '').toLowerCase();
  let isAll = false, isUser = false;

  switch (type) {
    case 'welcome':
    case 'bv':
    case 'bienvenida':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      chat.bienvenida = isEnable;
      break;

    case 'antiprivado2':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      chat.antiPrivate2 = isEnable;
      break;

    case 'antilag':
      chat.antiLag = isEnable;
      break;

    case 'autoread':
    case 'autoleer':
      isAll = true;
      if (!isROwner) return global.dfail('rowner', m, conn);
      global.opts['autoread'] = isEnable;
      break;

    case 'antispam':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn);
      bot.antiSpam = isEnable;
      break;

    case 'antinopor':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn);
      chat.antiLinkxxx = isEnable;
      break;

    case 'audios':
    case 'audiosbot':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.audios = isEnable;
      break;

    case 'detect':
    case 'avisos':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.detect = isEnable;
      break;

    case 'jadibotmd':
    case 'serbot':
    case 'subbots':
      isAll = true;
      if (!isOwner) return global.dfail('rowner', m, conn);
      bot.jadibotmd = isEnable;
      break;

    case 'restrict':
    case 'restringir':
      isAll = true;
      if (!isOwner) return global.dfail('rowner', m, conn);
      bot.restrict = isEnable;
      break;

    case 'document':
      isUser = true;
      user.useDocument = isEnable;
      break;

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.antiLink = isEnable;
      break;

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.antiBot = isEnable;
      break;

    case 'modoadmin':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.modoadmin = isEnable;
      break;

    case 'antiprivado':
      isAll = true;
      bot.antiPrivate = isEnable;
      break;

    case 'nsfw':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.nsfw = isEnable;
      break;

    case 'antiarabes':
    case 'antifakes':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.onlyLatinos = isEnable;
      break;

    default:
      if (!/[01]/.test(command)) return m.reply(`
╭━━〔 *ＴＨＥ ＫＩＮＧＳ ＢＯＴ* 〕━━┈⊷
┃ ⚙️ *PANEL DE CONTROL*
┃
┃ ➲ *welcome* (Bienvenida)
┃ ➲ *nsfw* (Comandos +18)
┃ ➲ *antilag* (Limpieza de chat)
┃ ➲ *antilink* (Anti-Enlaces)
┃ ➲ *antiarabes* (Filtro de prefijos)
┃ ➲ *autoleer* (Visto automático)
┃ ➲ *restrict* (Restricciones)
┃ ➲ *document* (Enviar como doc)
┃ ➲ *modoadmin* (Solo admins)
┃ ➲ *audios* (Efectos/Notas)
┃ ➲ *subbots* (Función JadiBot)
┃
┃ 💡 *Uso:* ${usedPrefix + command} [opción]
╰━━━━━━━━━━━━━━━━━━┈⊷`.trim())
      throw false
  }

  let statusIcon = isEnable ? '『 ACTIVADO ✅ 』' : '『 DESACTIVADO ❌ 』';
  let scopeIcon = isAll ? '🌐 Global' : isUser ? '👤 Usuario' : '🏘️ Chat Actual';

  let confirm = `
👑 *ＴＨＥ   ＫＩＮＧＳ   ＢＯＴ* 👑
   ━━━━━━━━━━━━━━━━━
   
   🛡️ **ESTADO ACTUALIZADO**
   
   ✨ *Ajuste:* \`${type}\`
   📊 *Estado:* ${statusIcon}
   📍 *Ámbito:* ${scopeIcon}

   *Sistema de gestión inteligente*`.trim()

  m.reply(confirm)
}

handler.help = ['enable', 'disable', 'on', 'off']
handler.tags = ['nable']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler
