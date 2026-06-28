let handler = async (m, { conn }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) return m.reply('📸 Responde a una imagen con.ehd')

  let media = await q.download()
  if (media.length > 10 * 1024 * 1024) return m.reply('⚠️ La imagen pesa más de 10MB. Mándala como documento.')

  await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
  m.reply('⏳ Mejorando a x4 con IA... Esto tarda 10-20s')

  try {
    // API de Replicate Real-ESRGAN x4. Key gratis: https://replicate.com
    // Si no tienes key, usa 'quickstart' de DeepAI que tiene límite.
    const form = new FormData()
    form.append('image', new Blob([media], { type: 'image/jpeg' }))
    form.append('scale', '4') // <- x4 = Full HD a 4K

    let res = await fetch('https://api.deepai.org/api/torch-srgan', { // Gratis sin key
      method: 'POST',
      headers: { 'api-key': 'quickstart' },
      body: form
    })

    let json = await res.json()
    if (!json.output_url) throw json

    await conn.sendFile(m.chat, json.output_url, 'ehd.jpg', `*ENHANCE HD x4*\n» Escalado con IA Real-ESRGAN\n» No es 4K real, pero es lo más nítido posible.\n» Manda como documento para 0 compresión.`, m)

  } catch(e) {
    console.log(e)
    m.reply('⚠️ Falló. La API está saturada o la imagen es muy chica. Intenta con otra.')
  }
}
handler.help = ['ehd']
handler.tags = ['tools']
handler.command = /^(ehd|enhancehd)$/i
export default handler