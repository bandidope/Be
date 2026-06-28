// Plugin: TagAll / Todos / Invocar by I'm Criss XYZ 
// V2 Optimizado | Anti-Spam | Anti-Crash Grupos +200
// Comandos: #todos #tagall #invocar

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  if (!(isAdmin || isOwner)) throw '❌ *Solo administradores*'

  const customEmoji = global.db.data.chats[m.chat]?.customEmoji || '🌀'
  m.react(customEmoji)

  const mensaje = text ? `*» INFO:* ${text}` : '*» INFO:* Atención a todos'
  const total = participants.length

  // Divide en bloques de 50 para evitar spam/ban de WhatsApp
  const chunks = []
  for (let i = 0; i < participants.length; i += 50) {
    chunks.push(participants.slice(i, i + 50))
  }

  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i]
    let teks = `*!  MENCION GENERAL  !*\n*PARA ${total} MIEMBROS* 🗣️\n\n${mensaje}\n\n╭  ┄ 𝅄 ۪꒰ \`⡞᪲=͟͞For Three 🌀 ≼᳞ׄ\` ꒱ ۟ 𝅄 ┄\n`
    
    for (const mem of chunk) {
      teks += `┊${customEmoji} @${mem.id.split('@')[0]}\n`
    }
    teks += `╰⸼ ┄ ─  ꒰  ׅ୭ *Powered By For Three* ୧ ׅ ꒱  ┄  ─ ┄ ⸼ ${i + 1}/${chunks.length}`

    await conn.sendMessage(m.chat, { text: teks, mentions: chunk.map(a => a.id) })
    if (i < chunks.length - 1) await delay(1500) // Pausa 1.5s solo si hay otro mensaje
  }
}

handler.help = ['todos <mensaje opcional>']
handler.tags = ['grupo']
handler.command = /^(todos|invocar|tagall)$/i
handler.admin = true
handler.group = true

export default handler

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))