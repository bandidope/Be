import fetch from "node-fetch"
import yts from 'yt-search'

const MARCA = 'For Three Bot 🌀' // <- TU MARCA

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*Ingrese nombre o link*\n\n*Ejemplo:* ${usedPrefix}${command} Yan Block 444\n${MARCA}`, m)

    const isVideo = command === 'play2'
    await m.react(isVideo? '🎥' : '🎧')

    try {
        let videoUrl = text
        let title = ''
        let author = ''
        let image = ''
        let duration = ''

        if (!text.match(/youtu/gi)) {
            const search = await yts(text)
            if (!search.all.length) {
                await m.react('❌')
                return m.reply(`❌ Sin resultados\n${MARCA}`)
            }
            videoUrl = search.videos[0].url
            title = search.videos[0].title
            author = search.videos[0].author.name
            image = search.videos[0].thumbnail
            duration = search.videos[0].timestamp
        } else {
            const search = await yts({videoId: text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/)[1]})
            title = search.title
            author = search.author.name
            image = search.thumbnail
            duration = search.timestamp
        }

        await m.reply(`⏳ *Buscando...*\n📌 ${title}\n${MARCA}`)

        const endpoint = isVideo? 'ytmp4' : 'ytmp3'
        // API VREDEN - SI JALA 2026
        const apiUrl = `https://api.vreden.my.id/api/${endpoint}?url=${encodeURIComponent(videoUrl)}`

        const res = await fetch(apiUrl)
        const json = await res.json()

        if (json.status!== 200 ||!json.result.download.url) {
            await m.react('❌')
            return m.reply(`⚠️ Error API. Intenta luego\n${MARCA}`)
        }

        const download = json.result.download.url

        let info = `📌 *${title}*\n👤 *${author}*\n⏱️ *${duration}*\n📦 *${isVideo? 'MP4 360p' : 'MP3 128kbps'}*\n\n${MARCA}`

        if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: download },
                caption: info,
                mimetype: 'video/mp4'
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { image: { url: image }, caption: info }, { quoted: m })
            await conn.sendMessage(m.chat, {
                audio: { url: download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        conn.reply(m.chat, `🛑 Error al descargar. Link muy pesado o API caída\n${MARCA}`, m)
    }
}

handler.help = ['play', 'play2']
handler.tags = ['descargas']
handler.command = ['play', 'play2'] // play = mp3, play2 = mp4
export default handler