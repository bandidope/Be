let handler = async (m, { conn }) => {
  let chatId = m.chat
  
  // [FECHA PERÚ] Lunes a Domingo
  let now = new Date().toLocaleString('es-PE', { 
    timeZone: 'America/Lima', 
    weekday: 'long',
    day: '2-digit', 
    month: '2-digit'
  })
  now = now.charAt(0).toUpperCase() + now.slice(1)
  
  // [HORAS CONO SUR] FORMATO 12H AM/PM
  let horaPE = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: true })
  let horaBO = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit', hour12: true })
  let horaCL = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: true })
  let horaAR = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: true })

  let txt = `*Actividad ${now}*
╰› _6 VS 6 (S/R)_ ⋆⚔️° 
⊹ ࣪ ˖ *CONO SUR:*
🇵🇪 ${horaPE} | 🇧🇴 ${horaBO} | 🇨🇱 ${horaCL} | 🇦🇷 ${horaAR}
🫆 𝖠𝖽𝗆𝗂𝗇: @${m.sender.split('@')[0]}
𝖬𝗈𝖽𝖺𝗅𝗂𝖽𝖺𝖽: 
𝖱𝗂𝗏𝖺𝗅: 

𓍼 ׅ ⬞ ִ ᥱsᥴᥙᥲძrᥲ 𝗍і𝗍ᥙᥣᥲr
🔥𑁤 
🔥𑁤 
🔥𑁤 
🔥𑁤  
🔥𑁤 
🔥𑁤  

𓍼 ׅ ⬞ ִ sᥘ⍴ᥣᥱᥒ𝗍ᥱs
💀𑁤 
💀𑁤 `

  // [FOTO DEL GRUPO]
  let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.ibb.co/K0Wr1XJ/ff-logo.jpg')
  
  return conn.sendFile(chatId, pp, 'vs6.jpg', txt, m, false, { mentions: [m.sender] })
}

handler.help = ['vs6 ( sur )']
handler.tags = ['freefire']
handler.command = /^vs6$/i
handler.group = true
export default handler