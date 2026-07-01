let handler = async (m, { conn, mentionedJid, quoted }) => {
  // [FIX 1] Acepta tag, respuesta, o número
  let who = mentionedJid?.[0]? mentionedJid[0] : quoted? quoted.sender : null;

  if (!who) return m.reply(`*Taggea a tu víctima*\n\nEjemplo:.adoptado @user\nO responde a su msj +.adoptado`);

  let numero = who.split('@')[0];

  // [FIX 2] Cero _ pegados. Todo limpio con \n y espacios
  let texto = `@${numero} *ES/IS* *%* *ADOPTADO*\n` +
              `_Sus padres se fueron x pañales 😞😂_`;

  await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key }});
  await conn.reply(m.chat, texto, m, { mentions: [who] });
}

handler.help = ['adoptado @tag'];
handler.tags = ['diversion'];
handler.command = /^adoptado$/i;
export default handler;