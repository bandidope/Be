let handler = async (m, { conn }) => {
  let chatId = m.chat

  let txt = `╭───〔 🔥 4 VS 4 〕───╮
│
│ *VS:* 
│ *🕚 Hora:* 
│ *👑 Admin:* @${m.sender.split('@')[0]}
│ *📜 Reglas:* 
│
├─ *TITULARES* [0/4]
│ ⚡ 1. _Vacío_
│ ⚡ 2. _Vacío_
│ ⚡ 3. _Vacío_
│ ⚡ 4. _Vacío_
│
├─ *SUPLENTES* [0/2]
│ 🐾 1. _Vacío_
│ 🐾 2. _Vacío_
╰────────────────────╯`

  // [FOTO DEL GRUPO]
  let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://i.ibb.co/K0Wr1XJ/ff-logo.jpg') // Logo Free Fire por defecto
  
  return conn.sendFile(chatId, pp, 'vs4.jpg', txt, m, false, { mentions: [m.sender] })
}

handler.help = ['vs4']
handler.tags = ['freefire']
handler.command = /^vs4$/i
handler.group = true
export default handler