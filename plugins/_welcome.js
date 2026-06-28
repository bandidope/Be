import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn }) {
  try {
    if (!m.messageStubType ||!m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat ||!chat.bienvenida) return true; // [REVISAR ESTO].on welcome

    const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
    if (!groupMetadata) return true; // [FIX 1] Si no hay metadata, no hagas nada

    const defaultImageUrl = 'https://qu.ax/Ny958';
    const fkontak = { key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' }, message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${conn.user.jid.split('@')[0]}:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, participant: '0@s.whatsapp.net' };

    let userJid = m.messageStubParameters?.[0] || m.key?.participant; // [FIX 3]
    if (!userJid) return true;

    let ppUser;
    try { ppUser = await conn.profilePictureUrl(userJid, 'image'); }
    catch { ppUser = defaultImageUrl; }
    const imgBuffer = await fetch(ppUser).then(res => res.buffer());

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || '📜 Sin descripción disponible';
    const { customWelcome, customBye, customKick } = chat;

    let text, type = '';
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      type = 'Bienvenida';
      text = customWelcome? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) : `👋 *¡Bienvenido ${user}!*\n\n¡Ya estás en *${groupName}*!\n\n📜 *Sobre el grupo:*\n_${groupDesc}_\n\n*Pasa piola y lee las reglas 😎*`;
    }
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      type = 'Salida';
      text = customBye? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName) : `😭 *Se fue ${user}* \n\nGracias por estar en *${groupName}*. ¡Vuelve pronto!`;
    }
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      type = 'Kick';
      text = customKick? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName) : `❌ *${user} fue expulsado de ${groupName}*`;
    }
    if(!text) return true;

    console.log(`[WELCOME] Enviando ${type} a ${user}`) // [DEBUG]
    await conn.sendMessage(m.chat, { image: imgBuffer, caption: text, mentions: [userJid] }, { quoted: fkontak });

  } catch (error) {
    console.error('❌ Error en welcome:', error);
  }
}