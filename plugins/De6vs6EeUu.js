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
  
  // [HORAS EEUU LATAM] FORMATO 12H AM/PM
  let horaEC = new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit', hour12: true })
  let horaMX = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: true })
  let horaVE = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas', hour: '2-digit', minute: '2-digit', hour12: true })

  let txt = `*Actividad ${now}*
╰› _6 VS 6 (S/R)_ ⋆⚔️° 
⊹ ࣪ ˖ *EEUU LATAM:*
🇪🇨 ${horaEC} | 🇲🇽 ${horaMX} | 🇻🇪 ${horaVE}
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
  
  return conn.sendFile(chatId, pp, '6vs6.jpg', txt, m, false, { mentions: [m.sender] })
}

handler.help = ['6vs6 ( eeuu )']
handler.tags = ['freefire']
handler.command = /^6vs6$/i
handler.group = true
export default handler