let handler = async (m, { conn }) => {
  // [1. TIRA EL DADO]
  let numero = Math.floor(Math.random() * 6) + 1
  
  // [2. REACCIONA A TU MENSAJE CON EL DADO]
  await conn.sendMessage(m.chat, {
    react: { 
      text: '🎲', 
      key: m.key 
    }
  })

  // [3. MANDA EL TEXTO CON EL NUMERO]
  let texto = `🎲 *DADO* 🎲\n\nTe tocó el: *${numero}*`
  
  if (numero === 6) texto += '\n\n🔥 *CRÍTICO!*'
  if (numero === 1) texto += '\n\n💀 *F*'

  await conn.reply(m.chat, texto, m)
}

handler.help = ['dado']
handler.tags = ['diversion']
handler.command = /^(dado|dice|roll)$/i
export default handler