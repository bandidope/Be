let handler = async (m, { conn, usedPrefix }) => {
  // [1. TIRA EL DADO] Numero del 1 al 6
  let dado = Math.floor(Math.random() * 6) + 1

  // [2. STICKERS DE DADO] Links directos de stickers animados
  let stickers = {
    1: 'https://dl.stickers.sm/Dados/1.webp',
    2: 'https://dl.stickers.sm/Dados/2.webp',
    3: 'https://dl.stickers.sm/Dados/3.webp',
    4: 'https://dl.stickers.sm/Dados/4.webp',
    5: 'https://dl.stickers.sm/Dados/5.webp',
    6: 'https://dl.stickers.sm/Dados/6.webp',
  }

  let url = stickers[dado]

  // [3. MANDAR STICKER]
  await conn.sendMessage(m.chat, {
    sticker: { url },
    // [Texto que sale encima del sticker]
  }, { quoted: m })

  await m.reply(`🎲 Te salió: *${dado}*`)
}

handler.help = ['dado']
handler.tags = ['diversion']
handler.command = /^(dado|dice)$/i
export default handler