import { xpRange } from '../lib/levelling.js';

console.log('[OK] PLUGIN MENU FOR THREE V6.4 CARGADO')

const clockString = ms => {
  const h = isNaN(ms)? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const imgMenu = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'; // TU LOGO

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const name = conn.getName(m.sender) || 'Usuario'
    const user = global.db.data.users[m.sender] || {};
    const { exp = 0, level = 1 } = user;
    const { min, xp } = xpRange(level, global.multiplier || 1);
    const totalreg = Object.keys(global.db.data.users || {}).length;
    const uptime = clockString(process.uptime() * 1000);

    // 1. HORA Y FECHA DE LIMA, PERU
    const fechaPeru = new Date().toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaPeru = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' });
    const hora = new Date(horaPeru).getHours();

    // 2. SALUDO SEGUN HORA
    let saludo = 'Hola'
    let emojiHora = '⚡'
    if (hora >= 5 && hora < 12) {
      saludo = 'Buenos dias'
      emojiHora = '☀️'
    } else if (hora >= 12 && hora < 18) {
      saludo = 'Buenas tardes'
      emojiHora = '🔥'
    } else {
      saludo = 'Buenas noches'
      emojiHora = '🌙'
    }

    // 3. AGRUPAR COMANDOS POR TAG REALES DEL BOT
    const categorizedCommands = {};
    for (const plugin of Object.values(global.plugins || {})) {
      if (plugin?.help &&!plugin.disabled) {
        const tags = Array.isArray(plugin.tags)? plugin.tags : [plugin.tags || 'misc'];
        const cmds = Array.isArray(plugin.help)? plugin.help : [plugin.help];
        const tagName = tags[0];
        if (!categorizedCommands[tagName]) categorizedCommands[tagName] = [];
        cmds.forEach(cmd => categorizedCommands[tagName].push(`${usedPrefix}${cmd}`));
      }
    }

    // 4. HEADER IGUAL KAWAIi PERO SIN EMOJIS FEMENINOS
    let menuText = `˚₊· ✧ Menu For Three Bot ˎˊ˗

♡ ${saludo} ${name} ⚡
✿-------------------------✿
✦ ₊˚ ${saludo} ${emojiHora}
✦ "Tu eres mi sol, mi luna y todas mis estrellas"

.｡*♡ Que tengas un buen dia!
📅 ${fechaPeru}

⊹───────────────⊹
       ˚⊱ ♡ Comandos ♡ ⊰˚
⊹───────────────⊹
`.trim() + '\n\n';

    // 5. EMOJIS NUEVOS - MAS RUDOS / ANIME [SOLO CAMBIÉ ESTO]
    const emojiMap = {
      'main': '⚡', 'menu': '⚡', 'info': '📡',
      'descargas': '📥', 'downloader': '📥', 'audio': '🎧',
      'grupo': '🛡️', 'group': '🛡️', 'herramientas': '🔧',
      'tools': '🔧', 'diversión': '🎮', 'fun': '🎮',
      'juegos': '🕹️', 'game': '🕹️', 'rpg': '🗡️',
      'ia': '🤖', 'ai': '🤖', 'freefire': '🎯', 'ff': '🎯',
      'frases': '💬', 'sticker': '🎴', 'stickers': '🎴',
      'converter': '🔄', 'converters': '🔄', 'logo': '🎨',
      'logos': '🎨', 'maker': '⚙️', 'nsfw': '🔞',
      'registro': '📝', 'reg': '📝', 'owner': '👑',
      'ventas': '💰', 'search': '🔍', 'ajustes': '⚙️',
      'config': '⚙️'
    }

    // 6. ORDEN DE CATEGORIAS - IGUAL QUE ANTES
    const ordenTags = ['menu', 'info', 'descargas', 'audio', 'grupo', 'herramientas', 'diversión', 'juegos', 'rpg', 'ia', 'freefire', 'frases', 'sticker', 'converter', 'logo', 'maker', 'registro', 'owner', 'ventas', 'search', 'ajustes', 'nsfw']

    const tagsOrdenados = [...ordenTags,...Object.keys(categorizedCommands).filter(t =>!ordenTags.includes(t))]

    for (const tag of tagsOrdenados) {
      if (categorizedCommands[tag] && categorizedCommands[tag].length > 0) {
        const emoji = emojiMap[tag] || '▸'
        const nombreTag = tag.charAt(0).toUpperCase() + tag.slice(1)
        menuText += `╭┈ ❥ 「 *${nombreTag}* ${emoji}」 ┈┈ ❥\n`
        for (const cmd of categorizedCommands[tag]) {
          menuText += `│${emoji} ${cmd}\n`
        }
        menuText += `╰┄┈┄❥┈\n\n`
      }
    }

    // 7. FOOTER 100% TUYO
    menuText += `> ⏤͟͞ For Three Bot by Whois Yallico ⚡\n`
    menuText += `> Contacto: +51 936 994 155`

    // 8. ENVIAR
    await conn.sendMessage(m.chat, {
      image: { url: imgMenu },
      caption: menuText,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error('[ERROR] MENU:', e);
    await conn.reply(m.chat, `Error: ${e.message}`, m);
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|menu|help|ayuda)$/i
export default handler;