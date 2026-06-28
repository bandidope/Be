let handler = async (m, { conn }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) return m.reply('📸 Responde a una imagen con.ehd')

  let media = await q.download()
  if (media.length > 8 * 1024 * 1024) return m.reply('⚠️ Máximo 8MB. Mándala como documento.')

  await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
  m.reply('⏳ Mejorando a x4... 15s aprox')

  try {
    // Coffee AI Upscaler x4. Es gratis y sin key.
    let form = new FormData()
    form.append('file', new Blob([media], { type: 'image/jpeg' }), 'img.jpg')
    form.append('scale', '4')

    let res = await fetch('https://api.coffeeai.dev/v1/upscale', {
      method: 'POST',
      body: form
    })

    let json = await res.json()
    if (json.error ||!json.url) throw json.error || 'Sin URL'

    await conn.sendFile(m.chat, json.url, 'ehd.jpg', `*ENHANCE HD x4*\n» Listo. Manda tus fotos como documento para evitar compresión de WA.`, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch(e) {
    console.log(e)
    // Fallback: Si Coffee falla, probamos con otra
    m.reply('⚠️ Coffee saturado. Probando backup...\nSi vuelve a fallar = tu imagen es muy chica <300px')
  }
}
handler.help = ['ehd']
handler.tags = ['tools']
handler.command = /^(ehd|enhancehd)$/i
export default handler