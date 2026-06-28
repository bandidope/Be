import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType ||!m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat ||!chat.bienvenida) return true;

    // Imagen por defecto si el user no tiene foto
    const defaultImageUrl = 'https://qu.ax/Ny958';

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

    // *** NUEVO: Agarrar la foto del que entra/sale ***
    let ppUser;
    try {
      ppUser = await conn.profilePictureUrl(userJid, 'image');
    } catch {
      ppUser = defaultImageUrl; // Si no tiene foto, usa la tuya
    }
    const imgBuffer = await fetch(ppUser).then(res => res.buffer());
    // *************************************************

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || '📜 Sin descripción disponible';
    const { customWelcome, customBye, customKick } = chat;

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = customWelcome
       ? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc)
        : `👋 *¡Bienvenido ${user}!*\n\n¡Ya estás en *${groupName}*!\n\n📜 *Sobre el grupo:*\n_${groupDesc}_\n\n*Pasa piola y lee las reglas 😎*`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer, // <- Ahora es su foto
        caption: welcomeText,
        mentions: [userJid]
      }, { quoted: fkontak });
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const goodbyeText = customBye
       ? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName)
        : `😭 *Se fue ${user}* \n\nGracias por estar en *${groupName}*. ¡Vuelve pronto!`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer, // <- Su foto
        caption: goodbyeText,
        mentions: [userJid]
      }, { quoted: fkontak });
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const kickText = customKick
       ? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName)
        : `❌ *${user} fue expulsado de ${groupName}*`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer, // <- Su foto
        caption: kickText,
        mentions: [userJid]
      }, { quoted: fkontak });
    }
  } catch (error) {
    console.error('❌ Error en welcome:', error);
  }
}