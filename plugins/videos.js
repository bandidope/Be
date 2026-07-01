let handler = async (m, { conn }) => {
    const VIDEOS = [
        'https://files.evogb.win/hbkzO5.mp4',
        'https://files.evogb.win/enz3dO.mp4', 
        'https://files.evogb.win/EGI45I.mp4',
        'https://files.evogb.win/sDft7k.mp4'
    ]
    let video = VIDEOS[Math.floor(Math.random() * VIDEOS.length)]
    await m.reply(`🎥 Mandando video...`) // Test: si sale esto, el comando sí jala
    await conn.sendMessage(m.chat, { video: { url: video }, mimetype: 'video/mp4' }, { quoted: m })
}

handler.command = ['videos'] // Sin array extra, sin espacios
handler.help = ['videos']
handler.tags = ['random']
handler.register = false
module.exports = handler // <- ESTO ES CLAVE