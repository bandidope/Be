import { xpRange } from '../lib/levelling.js';

console.log('[OK] PLUGIN MENU V4 CARGADO')

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

    // 1. JUNTAR TODOS LOS COMANDOS EN 1 SOLA LISTA
    const allCommands = [];
    for (const plugin of Object.values(global.plugins || {})) {
      if (plugin?.help &&!plugin.disabled) {
        const cmds = Array.isArray(plugin.help)? plugin.help : [plugin.help];
        cmds.forEach(cmd => allCommands.push(usedPrefix + cmd));
      }
    }
    allCommands.sort(); // Orden alfabético

    // 2. NUEVO DISEÑO - TIPO "TERMINAL HACKER" - 100% DIFERENTE
    let menuText = `
[=================================================]
||                                               ||
||  >> FOR_THREE_OS v4.0 // ONLINE              ||
||                                               ||
||  [USER]    > ${name}                          ||
||  [LEVEL]   > ${level} [${exp - min}/${xp}]    ||
||  [UPTIME]  > ${uptime}                        ||
||  [USERS]   > ${totalreg}                      ||
||                                               ||
||  [DEV]     > Whois Yallico                    ||
||  [PHONE]   > +51 936 994 155                  ||
||  [BOT]     > For Three Bot PE                 ||
||                                               ||
[=================================================]

>> LISTA DE COMANDOS ACTIVOS [${allCommands.length}] <<

${allCommands.map((v, i) => `${String(i+1).padStart(2, '0')}. ${v}`).join('\n')}

[=================================================]
>> Reporta bugs al DEV <<
[=================================================]
`.trim();

    // 3. MANDAR SOLO 1 MENSAJE: IMAGEN + CAPTION GIGANTE
    await conn.sendMessage(m.chat, { 
      image: { url: imgMenu }, 
      caption: menuText,
      mentions: [m.sender]
    }, { quoted: m })

    console.log(`[OK] Menu enviado con ${allCommands.length} comandos`)

  } catch (e) {
    console.error('[ERROR] MENU:', e);
    await conn.reply(m.chat, `Error: ${e.message}`, m);
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|menu|help|ayuda)$/i
export default handler;