let handler = async (m, { conn, mentionedJid }) => {
  if (!mentionedJid?.[0]) return m.reply('Taggea a tu víctima: `.adoptado @user`')

  let quien = mentionedJid[0] // ej: 254417471316137@s.whatsapp.net
  let numero = quien.split('@')[0] // ej: 254417471316137

  // ARREGLO: El @ va pegado al numero SIN el +
  let texto = `@${numero} *ES/IS* *%* *ADOPTADO*\n_Sus padres se fueron x pañales 😞😂_`

  await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key }})
  // ARREGLO: Pasamos el JID completo en mentions para que se pinte azul
  await conn.reply(m.chat, texto, m, { mentions: [quien] })
}

handler.help = ['adoptada @tag']
handler.tags = ['diversion']
handler.command = /^adoptada$/i
export default handler