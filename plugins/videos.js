const CHICAS = [
  "https://files.evogb.win/hbkzO5.mp4",
  "https://files.evogb.win/enz3dO.mp4",
  "https://files.evogb.win/EGI45I.mp4",
  "https://files.evogb.win/sDft7k.mp4"
]

let ultimo = -1

let handler = async (m, { conn, usedPrefix, command }) => {
    // Anti-repeat
    let random;
    do {
        random = Math.floor(Math.random() * CHICAS.length)
    } while (random === ultimo && CHICAS.length > 1)
    ultimo = random

    let videoUrl = CHICAS[random]

    try {
        await m.react('🎥')
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `🔥 *𝗧𝗥𝗘𝗡𝗗 𝗗𝗘 𝗧𝗜𝗞 𝗧𝗢𝗞*\n_Video ${random + 1}/${CHICAS.length}_`,
            mimetype: 'video/mp4',
            fileName: 'tiktok.mp4',
            // Botón pa mandar otro al toque
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
handler.limit = true
export default handler