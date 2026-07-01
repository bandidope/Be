const CHICAS = [
  "https://files.evogb.win/hbkzO5.mp4",
  "https://files.evogb.win/enz3dO.mp4",
  "https://files.evogb.win/EGI45I.mp4",
  "https://files.evogb.win/sDft7k.mp4",
  "https://files.evogb.win/vnERiq.mp4",
  "https://files.evogb.win/M3wCig.mp4",
  "https://files.evogb.win/knTQU7.mp4"
]

// EDITA TUS LINKS AQUÍ 👇
const LINKS = [
  { url: 'https://chat.whatsapp.com/TU_LINK', name: '📢 Canal Oficial' },
  { url: 'https://github.com/Elrebelde1/Nox-Bot-', name: '💻 GitHub Nox-Bot' },
  { url: 'https://instagram.com/tu_user', name: '📸 Instagram' }
]

let ultimo = -1

let handler = async (m, { conn, usedPrefix, command }) => {
    // Anti-repeat: que no mande el mismo 2 veces
    let random;
    do {
        random = Math.floor(Math.random() * CHICAS.length)
    } while (random === ultimo && CHICAS.length > 1)
    ultimo = random

    let videoUrl = CHICAS[random]

    // Caption con links
    let caption = `🔥 *𝗧𝗥𝗘𝗡𝗗 𝗗𝗘 𝗧𝗜𝗞 𝗧𝗢𝗞*\n_Video ${random + 1}/${CHICAS.length}_\n\n`

    if (LINKS.length) {
      caption += `╭─ 🔗 *Links Importantes* ─╮\n`
      LINKS.forEach(l => caption += `│ ${l.name}\n│ ${l.url}\n`)
      caption += `╰───────────────────────╯`
    }

    try {
        await m.react('🎥')
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption.trim(),
            mimetype: 'video/mp4',
            fileName: 'tiktok.mp4',
            buttons: [
                { buttonId: `${usedPrefix + command}`, buttonText: { displayText: '🔄 Otro' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m })
        await m.react('✅')
    } catch (e) {
        console.error('ERROR CHICAS:', e)
        await m.react('❌')
        m.reply(`❌ Evogb bloqueó el video. Intenta.chicas otra vez`)
    }
}

handler.help = ['chicas']
handler.tags = ['internet', 'random']
handler.command = /^(chicas)$/i
handler.limit = true // 15s cooldown
export default handler