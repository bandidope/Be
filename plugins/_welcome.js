import { WAMessageStubType} from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata}) {
  try {
    if (!m.messageStubType ||!m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat ||!chat.bienvenida) return true;

    // --- ✅ Enlace de imagen solicitado por el usuario ---
    const defaultImageUrl = 'https://qu.ax/Ny958'; 

    // Función para obtener la imagen como buffer
    const get_default_image_buffer = async () => {
        return await fetch(defaultImageUrl).then(res => res.buffer());
    };
    // ----------------------------------------

    const fkontak = {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'Halo'
},
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${
            conn.user.jid.split('@')[0]
}:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
}
},
      participant: '0@s.whatsapp.net'
};

    let userJid;
    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        userJid = m.messageStubParameters?.[0];
        break;
      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
        userJid = m.key.participant;
        break;
      default:
        return true;
}

    if (!userJid) return true;

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || '📜 Sin descripción disponible';

    // *** Obtener el buffer de la imagen solicitada para todos los casos ***
    const imgBuffer = await get_default_image_buffer();
    // *************************************************************************

    const { customWelcome, customBye, customKick} = chat;

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = customWelcome
? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc)
: `🎅 *¡HO HO HOLA ${user}!* 🔔\n\n¡Bienvenido/a a *${groupName}*! Que la **magia de la Navidad** te acompañe.\n\n📚 *Sobre nosotros:*\n_${groupDesc}_\n\n🌟 ¡Felices fiestas!`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: welcomeText,
        mentions: [userJid]
}, { quoted: fkontak});
}

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const goodbyeText = customBye
? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName)
: `😭 *¡El Grinch se ha ido!* ☃️\n\nGracias por compartir la Navidad en *${groupName}*. ¡Vuelve pronto, ${user}!`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: goodbyeText,
        mentions: [userJid]
}, { quoted: fkontak});
}

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const kickText = customKick
? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName)
: `❌ *¡Elfo travieso expulsado!* 🧝🏻‍♂️\n\n*${user}* ha sido enviado de vuelta al Polo Norte. ¡Feliz Navidad!`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: kickText,
        mentions: [userJid]
}, { quoted: fkontak});
}
} catch (error) {
    console.error('❌ Error general en la función de bienvenida/despedida/expulsión:', error);
}
}
