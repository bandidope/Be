import { xpRange } from '../lib/levelling.js';

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

// Tu logo de Vans
const imgMenu = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png';

// 1. AQUI PONES TU ORDEN - EL NOMBRE ES EL TAG DEL PLUGIN
const ORDEN_CATEGORIAS = [
  'main', // 1ro
  'info', // 2do
  'audio', // 3ro
  'descargas', // 4to
  'grupo' // 5to
  // Las que falten salen al final en orden alfabético
]

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const tag = `@${m.sender.split('@')[0]}`;
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || {};
    const { exp = 0, level = 1 } = user;
    const { min, xp } = xpRange(level, global.multiplier || 1);
    const totalreg = Object.keys(global.db.data.users || {}).length;
    const uptime = clockString(process.uptime() * 1000);

    // 2. CATEGORIZAR COMANDOS
    const categorizedCommands = {};
    for (const plugin of Object.values(global.plugins)) {
      if (plugin?.help &&!plugin.disabled) {
        const tags = Array.isArray(plugin.tags)? plugin.tags : [plugin.tags || 'otros'];
        const cmds = Array.isArray(plugin.help)? plugin.help : [plugin.help];
        const tagName = tags[0];
        if (!categorizedCommands[tagName]) categorizedCommands[tagName] = [];
        cmds.forEach(cmd => categorizedCommands[tagName].push(usedPrefix + cmd));
      }
    }

    // 3. HEADER
    let menu = `${saludo} ${tag} ✨\n\n`;
    menu += `︵᷼ ⿻ *For Three* ࣪ ࣭ ࣪ *Wa Bot* ࣭ 🌀 ࣪\n`;
    menu += `✿ *Hᴏʟᴀ ${tag}*\n*${saludo}*\n`;
    menu += `> ꒰꛱ ͜Desarrollado por *Whois Yallico* +51 936 994 155\n`;
    menu += `𓈒𓏸🌴 *Bot Name:* For Three Bot 🇵🇪\n`;
    menu += `𓈒𓏸🌵 *Nivel:* ${level} | *Exp:* ${exp - min}/${xp}\n`;
    menu += `𓈒𓏸🌵 *Activo:* ${uptime}\n`;
    menu += `𓈒𓏸🌵 *Comprar:*.precios\n`;
    menu += `𓈒𓏸🍃 *Usuarios:* ${totalreg}\n\n`;
    menu += `> 😸 Si encuentra un comando con errores no dudes en reportarlo con el Creador\n\n`;

    // 4. ORDENAR CATEGORIAS
    const categoriasOrdenadas = []

    // Primero las que pusiste en ORDEN_CATEGORIAS
    for (const cat of ORDEN_CATEGORIAS) {
      if (categorizedCommands[cat]) {
        categoriasOrdenadas.push([cat, categorizedCommands[cat]])
        delete categorizedCommands[cat] // las borro para no repetir
      }
    }

    // Luego las que faltaron, en orden A-Z
    const resto = Object.entries(categorizedCommands).sort((a, b) => a[0].localeCompare(b[0]))
    categoriasOrdenadas.push(...resto)

    // 5. IMPRIMIR MENU
    for (const [category, cmds] of categoriasOrdenadas) {
      if (cmds.length > 0) {
        menu += `𓈒𓏸❀ *${category.toUpperCase()}*\n`;
        menu += cmds.map(cmd => `│ ◦ ${cmd}`).join('\n') + '\n\n';
      }
    }

    await conn.sendMessage(m.chat, {
      image: { url: imgMenu },
      caption: menu,
      mentions: [m.sender]
    }, { quoted: m });

  } catch (e) {
    console.error('❌ Error en el menú:', e);
    await conn.reply(m.chat, `⚠️ Error al cargar el menú.`, m);
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'help', 'menú'];
export default handler;