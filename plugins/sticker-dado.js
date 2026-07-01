let handler = async (m, { conn }) => {
  // [1. MANDA ENCUESTA PRIMERO]
  let encuesta = await conn.sendPoll(m.chat, 
    '🎲 *TIRANDO EL DADO...*\n¿Que número crees que saldrá?', 
    ['1', '2', '3', '4', '5', '6'], 
    { quoted: m, selectableCount: 1 }
  )

  await m.reply('⏳ Tienes 10 segundos para votar...')

  // [2. ESPERA 10 SEGUNDOS]
  await new Promise(resolve => setTimeout(resolve, 10000))

  // [3. TIRA EL DADO DE VERDAD]
  let numero = Math.floor(Math.random() * 6) + 1
  
  // [4. REACCIONA Y MANDA RESULTADO]
  await conn.sendMessage(m.chat, {
    react: { 
      text: '🎲', 
      key: m.key 
    }
  })

  let texto = `🎲 *RESULTADO* 🎲\n\nSalió el: *${numero}*`
  
  if (numero === 6) texto += '\n\n🔥 *CRÍTICO! Pura suerte*'
  if (numero === 1) texto += '\n\n💀 *F en el chat*'

  await conn.reply(m.chat, texto, m)
}

handler.help = ['dado']
handler.tags = ['diversion']
handler.command = /^(dado|dice|roll)$/i
export default handler