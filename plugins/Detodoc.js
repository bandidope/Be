import fetch from 'node-fetch'
import FormData from 'form-data'

const EVOGb_KEY = 'evogb-KnbSAgv7' // [TU KEY]

let handler = async (m, { conn, command }) => {
  if (!m.quoted || !m.quoted.mimetype) 
    return m.reply('❌ Responde a una imagen con el comando')

  if (!/image\/(jpe?g|png)/.test(m.quoted.mimetype)) 
    return m.reply('❌ Solo JPG o PNG')

  await m.react('⏳')

  try {
    // 1. Descarga la imagen
    let media = await m.quoted.download()
    
    // 2. [FIX] FormData con Buffer + filename
    let form = new FormData()
    form.append('file', media, { filename: 'image.jpg', contentType: m.quoted.mimetype })
    form.append('format', command === 'topdf' ? 'pdf' : 'docx') 

    let res = await fetch(`https://api.evogb.org/api/converter-img`, {
      method: 'POST',
      headers: {
        'apikey': EVOGb_KEY,
        ...form.getHeaders() // [CLAVE] Para el boundary
      },
      body: form
    })

    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
    
    let buffer = await res.buffer()
    
    let ext = command === 'topdf' ? 'pdf' : 'docx'
    let mime = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    
    // 3. Envía el documento
    await conn.sendMessage(m.chat, {
      document: buffer,
      fileName: `convertido.${ext}`,
      mimetype: mime,
      caption: `✅ *Imagen convertida a ${ext.toUpperCase()}*\nPowered by Evogb`
    }, { quoted: m })
    
    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.react('❌')
    m.reply(`❌ Error al convertir: ${e.message}`)
  }
}

handler.help = ['todoc', 'topdf']
handler.tags = ['tools']
handler.command = /^(todoc|topdf)$/i 
export default handler