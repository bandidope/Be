import { xpRange } from '../lib/levelling.js';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const clockString = ms => {
  const h = isNaN(ms)? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const imgMenu = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'; // TU LOGO
const ORDEN_CATEGORIAS = ['freefire','info','audio','descargas','grupo'] // TU ORDEN

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const name = conn.getName(m.sender)
    const user = global.db.data.users[m.sender] || {};
    const { exp = 0, level = 1 } = user;
    const { min, xp } = xpRange(level, global.multiplier || 1);
    const totalreg = Object.keys(global.db.data.users || {}).length;
    const uptime = clockString(process.uptime() * 1000);

    const categorizedCommands = {};
    for (const plugin of Object.values(global.plugins || {})) {
      if (plugin?.help &&!plugin.disabled) {
        const tags = Array.isArray(plugin.tags)? plugin.tags : [plugin.tags || 'misc'];
        const cmds = Array.isArray(plugin.help)? plugin.help : [plugin.help];
        const tagName = tags[0];
        if (!categorizedCommands[tagName]) categorizedCommands[tagName] = [];
        cmds.forEach(cmd => categorizedCommands[tagName].push(usedPrefix + cmd));
      }
    }

    // DISEÑO ANIME VTUBER - TUS DATOS IGUALES
    let menuText = `
╭─ ࣪ ִֶָ𐀔 *F O R T H R E* 𐀔 ִֶָ ࣪ ─╮
│
│ ⪩ *Hᴏʟᴀ, ${name} -chan* ⪨
│ ✧˖°. *Nivel:* ${level} ⋆ *XP:* ${exp - min}/${xp}
│ ✧˖°. *Activo:* ${uptime} ⋆ *Users:* ${totalreg}
│
│ 𓆩💙𓆪 *Creador:* Whois Yallico
│ 𓆩📞𓆪 *Contacto:* +51 936 994 155
│ 𓆩🤖𓆪 *Bot:* For Three Bot 🇵🇪
│
╰─ ࣪ ִֶָ✧ Si hay bugs, repórtalo ✧ ִֶָ ࣪ ─╯

> ✧･ﾟ: *Elige tu categoría* :･ﾟ✧
`.trim();

    const categoriasOrdenadas = []
    for (const cat of ORDEN_CATEGORIAS) {
      if (categorizedCommands[cat]) {
        categoriasOrdenadas.push([cat])
        delete categorizedCommands[cat]
      }
    }
    const resto = Object.keys(categorizedCommands).sort()
    resto.forEach(cat => categoriasOrdenadas.push([cat]))

    const rows = categoriasOrdenadas.slice(0, 20).map(([category]) => ({
      id: `${usedPrefix}menu ${category}`,
      title: `🌸 ${category.toUpperCase()} ฅ^•ﻌ•^ฅ`,
      description: `${categorizedCommands[category]?.length || 0} cmds disponibles`
    }))

    // MANDAR IMAGEN + BOTON LISTA - METODO PANEL
    await conn.sendMessage(m.chat, { image: { url: imgMenu }, caption: ` }, { quoted: m })

    const msg = generateWAMessageFromContent(m.chat, {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ text: menuText }),
        footer: proto.Message.InteractiveMessage.Footer.create({ text: 'For Three Bot | Powered by Yallico' }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [{
            name: "single_select",
            buttonParamsJson: JSON.stringify({ title: "🎀 Ver Categorías", sections: [{ title: "✧ C A T E G O R I A S ✧", rows }] })
          }]
        })
      })
    }, { userJid: conn.user.jid, quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error('❌ Error en el menú:', e);
    await conn.reply(m.chat, `⚠️ Error: ${e.message}`, m);
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'help', 'menú'];
export default handler;