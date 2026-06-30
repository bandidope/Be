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

    let userJid = m.messageStubParameters?.[0] || m.key?.participant;
    if (!userJid) return true; 

    // [FIX @lid -> @numero para que no salga @undefined]
    let userName = userJid.split('@')[0];
    if (userJid.endsWith('@lid')) {
      try {
        let info = await conn.onWhatsApp(userJid);
        userName = info[0]?.jid?.split('@')[0] || userName;
      } catch(e){}
    }
    const user = `@${userName}`;

    const imgBuffer = await fetch(fixedImageUrl).then(res => res.buffer()).catch(_ => null);
    if (!imgBuffer) return true;

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

    // 1. IMAGEN
    await conn.sendMessage(m.chat, { image: imgBuffer, caption: text, mentions: [userJid] });

    // 2. AUDIO QUE SÍ FUNCIONA
    const audioPath = path.resolve(audioFile);
    if (fs.existsSync(audioPath)) {
      await new Promise(r => setTimeout(r, 1500)); // Delay para que no se junte
      const audioBuffer = fs.readFileSync(audioPath);
      await conn.sendMessage(m.chat, {
        audio: audioBuffer, // [AUDIO NORMAL]
        mimetype: 'audio/mpeg', // [MP3]
        ptt: false // [BARRA + TRANSCRIBIR]
      });
      console.log(`[WELCOME] ✅ Audio enviado y funcional: ${audioFile}`)
    } else {
      console.log(`[WELCOME] ❌ NO EXISTE EL AUDIO: ${audioPath}`)
    }
  } catch (error) {
    console.error('❌ Error en welcome:', error);
  }
}