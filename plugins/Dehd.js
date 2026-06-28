import jimp from 'jimp'

let handler = async (m, { conn, args }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) return m.reply('📸 Responde a una imagen con.ehd')

  let media = await q.download()
  if (!media || media.length < 5000) return m.reply('⚠️ Imagen muy chica <300px.')

  let modoFull = args[0] === 'full' //.ehd full = sin compresión

  // [NUEVO] Mensaje de procesando
  let proses = await conn.sendMessage(m.chat, { text: '⏳ *Un momento, estoy procesando la imagen...*' }, { quoted: m })
  await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })

  try {
    let img = await jimp.read(media)
    let w = img.bitmap.width
    let h = img.bitmap.height

    img.resize(w * 4, h * 4, jimp.RESIZE_BICUBIC) // x4

    let buffer, caption, filename

    if(modoFull){
      buffer = await img.quality(100).getBufferAsync(jimp.MIME_JPEG)
      filename = `EHD_${w*4}x${h*4}_FULL.jpg`
      caption = `*ENHANCE HD x4 FULL* ✅\n${w}x${h} -> ${w*4}x${h*4}px\nPeso: ${(buffer.length/1024/1024).toFixed(2)}MB\n» 0 Compresión WA`
    } else {
      let targetSize = 950 * 1024
      let quality = 85
      buffer = await img.quality(quality).getBufferAsync(jimp.MIME_JPEG)

      while(buffer.length > targetSize && quality > 60){
        quality -= 3
        buffer = await img.quality(quality).getBufferAsync(jimp.MIME_JPEG)
      }
      filename = `EHD_${w*4}x${h*4}_LITE.jpg`
      caption = `*ENHANCE HD x4 LITE* ✅\n${w}x${h} -> ${w*4}x${h*4}px\nPeso: ${(buffer.length/1024/1024).toFixed(2)}MB\nCalidad: ${quality}%`
    }

    // Borra el mensaje de "procesando..."
    await conn.sendMessage(m.chat, { delete: proses.key })

    // Manda el resultado como Documento
    await conn.sendMessage(m.chat, {
      document: buffer,
      mimetype: 'image/jpeg',
      fileName: filename,
      caption: caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch(e) {
    console.log(e)
    // Si falla, también borra el "procesando"
    await conn.sendMessage(m.chat, { delete: proses.key })
    m.reply('⚠️ Falló. Formato no soportado.')
  }
}
handler.help = ['ehd [full]']
handler.tags = ['tools']
handler.command = /^(ehd|hd4k)$/i
export default handler