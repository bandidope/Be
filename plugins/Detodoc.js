import fetch from 'node-fetch'

const EVOGb_KEY = 'evogb-KnbSAgv7' 

let handler = async (m, { conn, command }) => {
  let q = m.quoted ? m.quoted : m 
  let mime = (q.msg || q).mimetype || ''
  
  if (!mime) return m.reply('❌ Responde a una imagen, foto o sticker')

  await m.react('⏳')

  try {
    let media = await q.download()
    
    // 1. PASO 1: Subir a Catbox - NO pide key y acepta Buffer
    let form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', media, 'image.jpg')
    
    let resUp = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
    let imageUrl = await resUp.text()
    if (!imageUrl.startsWith('http')) throw new Error('Falló Catbox')
    
    // 2. PASO 2: Convertir con Evogb usando la URL
    let format = command === 'topdf' ? 'pdf' : 'docx'
    let resConvert = await fetch(`https://api.evogb.org/api/converter-img?url=${encodeURIComponent(imageUrl)}&format=${format}`, {
      headers: { 'apikey': EVOGb_KEY }
    })
    
    if (!resConvert.ok) throw new Error(`Evogb Error ${resConvert.status}: ${await resConvert.text()}`)
    
    let buffer = await resConvert.buffer()
    
    let ext = format
    let mimeOut = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    
    await conn.sendMessage(m.chat, {
      document: buffer,
      fileName: `convertido.${ext}`,
      mimetype: mimeOut,
      caption: `✅ *Convertido a ${ext.toUpperCase()}*\nImg: ${imageUrl}`
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