import { xpRange } from '../lib/levelling.js';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

const clockString = ms => {
  const h = isNaN(ms)? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const saludarSegunHora = () => {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return '🌞 ¡Buenos días!';
  if (hora >= 12 && hora < 19) return '☀️ ¡Buenas tardes!';
  return '🌙 ¡Buenas noches!';
};

const imgMenu = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png';
const ORDEN_CATEGORIAS = ['freefire','info','audio','descargas','grupo']

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const tag = `@${m.sender.split('@')[0]}`;
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || {};
    const { exp = 0, level = 1 } = user;
    const { min, xp } = xpRange(level, global.multiplier || 1);
    const totalreg = Object.keys(global.db.data.users || {}).length;
    const uptime = clockString(process.uptime() * 1000);

    const categorizedCommands = {};
    const plugins = Object.values(global.plugins || {})
    for (const plugin of plugins) {
      if (plugin?.help &&!plugin.disabled) {
        const tags = Array.isArray(plugin.tags)? plugin.tags : [plugin.tags || 'otros'];
        const cmds = Array.isArray(plugin.help)? plugin.help : [plugin.help];
        const tagName = tags[0];
        if (!categorizedCommands[tagName]) categorizedCommands[tagName] = [];
        cmds.forEach(cmd => categorizedCommands[tagName].push(usedPrefix + cmd));
      }
    }

    let menuText = `${saludo} ${tag} ✨\n\n`;
    menuText += `︵᷼ ⿻ *For Three* ࣪ ࣭ ࣪ *Wa Bot* ࣭ 🌀 ࣪\n`;
    menuText += `✿ *Hᴏʟᴀ ${tag}*\n*${saludo}*\n`;
    menuText += `> ꒰꛱ ͜Desarrollado por *Whois Yallico* +51 936 994 155\n`;
    menuText += `𓈒𓏸🌴 *Bot Name:* For Three Bot 🇵🇪\n`;
    menuText += `𓈒𓏸🌵 *Nivel:* ${level} | *Exp:* ${exp - min}/${xp}\n`;
    menuText += `𓈒𓏸🌵 *Activo:* ${uptime}\n`;
    menuText += `𓈒𓏸🌵 *Comprar:*.precios\n`;
    menuText += `𓈒𓏸🍃 *Usuarios:* ${totalreg}\n\n`;
    menuText += `> 😸 Reporta errores con el Creador\n💙 Selecciona una categoría:\n`;

    const categoriasOrdenadas = []
    for (const cat of ORDEN_CATEGORIAS) {
      if (categorizedCommands[cat]) {
        categoriasOrdenadas.push([cat, categorizedCommands[cat]])
        delete categorizedCommands[cat]
      }
    }
    const resto = Object.entries(categorizedCommands).sort((a, b) => a[0].localeCompare(b[0]))
    categoriasOrdenadas.push(...resto)

    const rows = categoriasOrdenadas.slice(0, 20).map(([category]) => ({
      id: `${usedPrefix}menu ${category}`,
      title: ` ${category.toUpperCase()}`
    }))

    // FIX PARA PANEL VIEJO: Descargamos el buffer nosotros
    const imgBuffer = await (await fetch(imgMenu)).buffer();

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: { message: { interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ text: menuText }),
        footer: proto.Message.InteractiveMessage.Footer.create({ text: 'For Three Bot 🇵🇪' }),
        header: proto.Message.InteractiveMessage.Header.create({
          hasMediaAttachment: true,
          imageMessage: await conn.uploadMessage(m.chat, { image: imgBuffer }, { type: 'imageMessage' }) // <- FIX AQUI
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [{
            name: "single_select",
            buttonParamsJson: JSON.stringify({ title: "📂 Abrir Categorías", sections: [{ title: "𓈒𓏸❀ MENÚ", rows }] })
          }]
        })
      })}}
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