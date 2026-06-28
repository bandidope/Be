import jimp from 'jimp'

let handler = async (m, { conn }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) return m.reply('📸 Responde a una imagen con.ehd')

  let media = await q.download()
  if (!media || media.length < 5000) return m.reply('⚠️ Imagen muy chica <300px.')

  await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })

  try {
    let img = await jimp.read(media)
    let w = img.bitmap.width
    let h = img.bitmap.height
    
    // x4 con resize bicubic = lo mejor de Jimp
    img.resize(w * 4, h * 4, jimp.RESIZE_BICUBIC)
    img.quality(100)

    let buffer = await img.getBufferAsync(jimp.MIME_JPEG)
    await conn.sendFile(m.chat, buffer, 'ehd.jpg', `*ENHANCE HD x4 JIMP* ✅\n${w}x${h} -> ${w*4}x${h*4}\n» 0 API, 0 saturación\n» Manda como documento para 0 compresión`, m)

  } catch(e) {
    console.log(e)
    m.reply('⚠️ Falló. Imagen corrupta o formato webp/sticker.')
  }
}
handler.command = /^(ehd)$/i
export default handler