// Pack Zonexa/Evogb - 4 videos
const VIDEOS = [
    'https://files.evogb.win/hbkzO5.mp4',
    'https://files.evogb.win/enz3dO.mp4',
    'https://files.evogb.win/EGI45I.mp4',
    'https://files.evogb.win/sDft7k.mp4'
]

let handler = async (m, { conn }) => {
    // Elige 1 random cada vez que uses el comando
    let videoUrl = VIDEOS[Math.floor(Math.random() * VIDEOS.length)]

    try {
        m.react('🎬')
        await conn.sendFile(m.chat, videoUrl, 'video.mp4', `🎥 *Video Random Zonexa*\n_1 de ${VIDEOS.length} disponibles_`, m)
        m.react('✅')
    } catch (e) {
        console.log(e)
        m.react('❌')
        m.reply('❌ Ese video cayó. Intenta con .videos otra vez')
    }
}

handler.help = ['videos']
handler.tags = ['random', 'diversion']
handler.command = ['videos', 'video']
handler.register = false
handler.limit = true // 15s cooldown. Pa que no spameen evogb
module.exports = handler