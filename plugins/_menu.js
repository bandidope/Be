import { xpRange } from '../lib/levelling.js';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

console.log('[OK] PLUGIN MENU.JS CARGADO CORRECTAMENTE') // <-- Sin emoji

const clockString = ms => {
  const h = isNaN(ms)? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const imgMenu = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png';
const ORDEN_CATEGORIAS = ['freefire','info','audio','descargas','grupo']

const handler = async (m, { conn, usedPrefix, command }) => {
  console.log(`[CMD] Comando recibido: ${command} de ${m.sender}`) // <-- DEBUG

  try {
    const name = conn.getName(m.sender) || 'Usuario'
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

    // SIN EMOJIS EN EL TEXTO TAMPOCO
    let menuText = `
╭─ FORTHRE ─╮
│
│ Hola, ${name}
│ Nivel: ${level} | XP: ${exp - min}/${xp}
│ Activo: ${uptime} | Users: ${totalreg}
│
│ Creador: Whois Yallico
│ Contacto: +51 936 994 155
│ Bot: For Three Bot PE
│
╰─ Reporta bugs ─╯

> Elige tu categoria:
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
      title: `${category.toUpperCase()}`
    }))

    await conn.sendMessage(m.chat, { image: { url: imgMenu }, caption: menuText }, { quoted: m })

    const msg = generateWAMessageFromContent(m.chat, {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ text: '> Elige tu categoria:' }),
        footer: proto.Message.InteractiveMessage.Footer.create({ text: 'For Three Bot' }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [{
            name: "single_select",
            buttonParamsJson: JSON.stringify({ title: "Ver Categorias", sections: [{ title: "CATEGORIAS", rows }] })
          }]
        })
      })
    }, { userJid: conn.user.jid, quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    console.log('[OK] Enviado OK con boton')

  } catch (e) {
    console.error('[ERROR] ERROR CRITICO MENU:', e);
    // AQUI ESTABA EL EMOJI QUE ROMPIA TODO
    await conn.reply(m.chat, `Error: ${e.message}`, m); // <-- SIN EMOJI
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|menu|help|ayuda)$/i
export default handler;