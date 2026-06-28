import fetch from 'node-fetch'

const EVOGb_KEY = 'evogb-KnbSAgv7' // [TU KEY]

let handler = async (m, { conn, command }) => {
  if (!m.quoted || !m.quoted.mimetype) 
    return m.reply('❌ Responde a una imagen con el comando')

  if (!/image\/(jpe?g|png)/.test(m.quoted.mimetype)) 
    return m.reply('❌ Solo JPG o PNG')

  await m.react('⏳')

  try {
    // 1. Descarga la imagen del bot
    let media = await m.quoted.download()
    
    // 2. Envía a Evogb para convertir a DOCX
    let form = new FormData()
    form.append('file', media, 'image.jpg')
    form.append('format', 'docx') // docx, pdf, pptx

    let res = await fetch(`https://api.evogb.org/api/converter-img`, {
      method: 'POST',
      headers: {
        'apikey': EVOGb_KEY
      },
      body: form
    })

    if (!res.ok) throw new Error(`Error ${res.status}`)
    
    let buffer = await res.buffer()
    
    // 3. Envía el documento
    await conn.sendMessage(m.chat, {
      document: buffer,
      fileName: `convertido.docx`,
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      caption: `✅ *Imagen convertida a DOCX*\nPowered by Evogb`
    }, { quoted: m })
    
    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.react('❌')
    m.reply(`❌ Error al convertir: ${e.message}`)
  }
}

handler.help = ['todoc']
handler.tags = ['tools']
handler.command = /^(todoc|topdf)$/i 
export default handler