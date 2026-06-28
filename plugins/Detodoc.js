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
    // 1. PASO 1: Subir imagen a Evogb para obtener URL
    let media = await m.quoted.download()
    let form = new FormData()
    form.append('file', media, { filename: 'image.jpg' })
    
    let resUpload = await fetch(`https://api.evogb.org/tools/upload`, {
      method: 'POST',
      headers: { 'apikey': EVOGb_KEY, ...form.getHeaders() },
      body: form
    })
    let jsonUpload = await resUpload.json()
    if (!jsonUpload.status) throw new Error(jsonUpload.message)
    let imageUrl = jsonUpload.result.url
    console.log('URL:', imageUrl)

    // 2. PASO 2: Convertir usando la URL
    let format = command === 'topdf' ? 'pdf' : 'docx'
    let resConvert = await fetch(`https://api.evogb.org/api/converter-img?url=${encodeURIComponent(imageUrl)}&format=${format}`, {
      headers: { 'apikey': EVOGb_KEY }
    })
    
    if (!resConvert.ok) throw new Error(`Error ${resConvert.status}: ${await resConvert.text()}`)
    
    let buffer = await resConvert.buffer()
    
    let ext = format
    let mime = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    
    // 3. Enviar el documento
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
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['todoc', 'topdf']
handler.tags = ['tools']
handler.command = /^(todoc|topdf)$/i 
export default handler