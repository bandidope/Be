let handler = async (m, { conn }) => {
  // [1. MANDA ENCUESTA PRIMERO]
  await conn.sendPoll(m.chat, 
    '🎲 *TIRANDO EL DADO...*\n¿Que número crees que saldrá?', 
    ['1', '2', '3', '4', '5', '6'], 
    { quoted: m, selectableCount: 1 }
  )

  await m.reply('⏳ Tienen *2 minutos* para votar...')

  // [2. AVISO A LOS 1 MINUTO]
  setTimeout(async () => {
    await conn.reply(m.chat, '⏳ *Queda 1 minuto* para votar rápido! 🎲', m)
  }, 60000) // 60000ms = 1 minuto

  // [3. ESPERA LOS 2 MINUTOS TOTALES]
  await new Promise(resolve => setTimeout(resolve, 120000))

  // [4. TIRA EL DADO DE VERDAD]
  let numero = Math.floor(Math.random() * 6) + 1
  
  // [5. REACCIONA Y MANDA RESULTADO]
  await conn.sendMessage(m.chat, {
    react: { 
      text: '🎲', 
      key: m.key 
    }
  })

  let texto = `🎲 *RESULTADO* 🎲\n\nSalió el: *${numero}*`
  
  if (numero === 6) texto += '\n\n🔥 *CRÍTICO!*'
  if (numero === 1) texto += '\n\n💀 *F*'

  await conn.reply(m.chat, texto, m)
}

handler.help = ['dado']
handler.tags = ['diversion']
handler.command = /^(dado|dice|roll)$/i
export default handler