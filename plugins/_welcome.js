import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export async function before(m, { conn }) {
  try {
    if (!m.messageStubType ||!m.isGroup) return true;
    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat ||!chat.bienvenida) return true;
    const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
    if (!groupMetadata) return true;

    const fixedImageUrl = 'https://files.evogb.win/FXbFDD.jpg';
    const thumbUrl = 'https://files.evogb.win/FXbFDD.jpg';

    let userJid = m.messageStubParameters?.[0] || m.key?.participant;
    if (!userJid) return true;

    const imgBuffer = await fetch(fixedImageUrl).then(res => res.buffer()).catch(_ => null);
    const thumbBuffer = await fetch(thumbUrl).then(res => res.buffer()).catch(_ => null);
    if (!imgBuffer) return true;

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || '📜 Sin descripción disponible';
    const { customWelcome, customBye, customKick } = chat;

    let text = '', audioFile = '', emoji = '', type = '';
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      emoji = '👋'; type = 'bienvenida';
      text = customWelcome? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) : `${emoji} ${user} fue agregado a ${groupName}`;
      audioFile = './bienvenida.mp3'; // [FIX: MINUSCULA]
    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      emoji = '😭'; type = 'despedida';
      text = customBye? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName) : `${emoji} ${user} salió de ${groupName}`;
      audioFile = './despedida.mp3'; // [FIX: MINUSCULA]
    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      emoji = '❌'; type = 'kick';
      text = customKick? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName) : `${emoji} ${user} fue expulsado de ${groupName}`;
      audioFile = './kick.mp3'; // [FIX: MINUSCULA]
    } else return true;

    // 1. IMAGEN
    await conn.sendMessage(m.chat, { image: imgBuffer, caption: text, mentions: [userJid] });

    // 2. AUDIO DOCUMENTO ESTILO STORM
    const audioPath = path.resolve(audioFile);
    console.log(`[WELCOME] Buscando: ${audioPath}`);

    if (fs.existsSync(audioPath)) {
      await new Promise(r => setTimeout(r, 2000));
      const audioBuffer = fs.readFileSync(audioPath);
      await conn.sendMessage(m.chat, {
        document: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${emoji} ${type}.mp3`, // [Sale: ❌ kick.mp3]
        jpegThumbnail: thumbBuffer,
        caption: `By: Storm Bot ⚡`
      });
      console.log(`[WELCOME] ✅ Enviado: ${audioFile}`)
    } else {
      console.log(`[WELCOME] ❌ NO EXISTE: ${audioPath}`)
    }
  } catch (error) {
    console.error('❌ Error en welcome:', error);
  }
}