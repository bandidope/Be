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

    const fixedImageUrl = 'https://files.evogb.win/FXbFDD.jpg'; // [LOGO PARA IMAGEN]
    const thumbUrl = 'https://files.evogb.win/FXbFDD.jpg'; // [LOGO PARA EL AUDIO] Usa la misma

    let userJid = m.messageStubParameters?.[0] || m.key?.participant;
    if (!userJid) return true;

    const imgBuffer = await fetch(fixedImageUrl).then(res => res.buffer()).catch(_ => null);
    const thumbBuffer = await fetch(thumbUrl).then(res => res.buffer()).catch(_ => null); // [THUMB]
    if (!imgBuffer) return true;

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || '📜 Sin descripción disponible';
    const { customWelcome, customBye, customKick } = chat;

    let text = '', audioFile = '', emoji = '';
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      emoji = '👋';
      text = customWelcome? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) : `${emoji} ${user} fue agregado a ${groupName}`;
      audioFile = './bienvenida.mp3';
    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      emoji = '😭';
      text = customBye? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName) : `${emoji} ${user} salió de ${groupName}`;
      audioFile = './despedida.mp3';
    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      emoji = '❌';
      text = customKick? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName) : `${emoji} ${user} fue expulsado de ${groupName}`;
      audioFile = './kick.mp3';
    } else return true;

    // 1. MENSAJE 1: IMAGEN + TEXTO
    await conn.sendMessage(m.chat, { 
      image: imgBuffer, 
      caption: text, 
      mentions: [userJid] 
    });

    // 2. MENSAJE 2: DOCUMENTO AUDIO ESTILO STORM [CLAVE]
    const audioPath = path.resolve(audioFile);
    if (fs.existsSync(audioPath)) {
      await new Promise(r => setTimeout(r, 1500));
      const audioBuffer = fs.readFileSync(audioPath);
      await conn.sendMessage(m.chat, {
        document: audioBuffer, // [FIX 1] Se manda como documento
        mimetype: 'audio/mpeg', // [FIX 2] Pero es MP3
        fileName: `${emoji} ${type}.mp3`, // [FIX 3] Nombre que sale arriba
        jpegThumbnail: thumbBuffer, // [FIX 4] Logo azul que sale a la derecha
        caption: `By: Whois Yallico ⚡` // [TEXTO ABAJO DEL AUDIO]
      });
      console.log(`[WELCOME] ✅ Documento Audio enviado: ${audioFile}`)
    }
  } catch (error) {
    console.error('❌ Error en welcome:', error);
  }
}