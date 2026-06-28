import sharp from 'sharp'

let handler = async (m, { conn }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) return m.reply('📸 Responde a una imagen con.ehd')

  let media = await q.download()
  if (media.length > 15 * 1024 * 1024) return m.reply('⚠️ Máximo 15MB.')

  await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
  m.reply('⏳ Escalando x4 local... 3s')

  try {
    // Sharp = Upscale x4 con algoritmo Lanczos. Es lo mejor sin IA
    let buffer = await sharp(media)
      .resize({ width: null, height: null, factor: 4, kernel: 'lanczos3' }) // x4
      .jpeg({ quality: 100 }) // Máxima calidad, 0 compresión
      .toBuffer()

    await conn.sendFile(m.chat, buffer, 'ehd.jpg', `*ENHANCE HD x4 LOCAL*\n» 0 API, 0 saturación\n» Algoritmo: Lanczos3 = lo más nítido sin IA\n» Tip: Manda como documento para 0 compresión de WA`, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch(e) {
    console.log(e)
    m.reply('⚠️ Falló. Tu imagen es muy chica <200px o está corrupta.')
  }
}
handler.help = ['ehd']
handler.tags = ['tools']
handler.command = /^(ehd|enhancehd)$/i
export default handler