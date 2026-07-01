let handler = async (m, { conn, mentionedJid }) => {
  if (!mentionedJid?.[0]) return m.reply('Taggea a tu víctima: `.adoptado @user`')

  let quien = mentionedJid[0]
  let numero = quien.split('@')[0]

  let texto = `*@+${numero}* *ES/IS* *%* *ADOPTADO*_\n_Sus padres se fueron x pañales 😞😂_`

  await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key }})
  await conn.reply(m.chat, texto, m, { mentions: [quien] })
}

handler.help = ['adoptado @tag']
handler.tags = ['diversion']
handler.command = /^adoptado$/i
export default handler