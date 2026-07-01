let handler = async (m, { conn, text, mentionedJid, quoted }) => {
  // [FIX] Detecta: 1.Mencion azul 2.Respuesta 3.Texto @numero
  let who = mentionedJid?.[0]
   ? mentionedJid[0]
    : quoted
   ? quoted.sender
    : text?.match(/@(\d+)/)?.[1] + '@s.whatsapp.net';

  if (!who) return m.reply(`*Taggea a tu víctima*\n\nEjemplo:.adoptado @user\nO responde a su msj +.adoptado`);

  let numero = who.split('@')[0];

  let texto = `@${numero} *ES/IS* *%* *ADOPTADO*\n_Sus padres se fueron x pañales 😞😂_`;

  await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key }});
  await conn.reply(m.chat, texto, m, { mentions: [who] });
}

handler.help = ['adoptado @tag'];
handler.tags = ['diversion'];
handler.command = /^adoptado$/i;
export default handler;