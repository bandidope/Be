import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export async function before(m, { conn }) {
  try {
    if (!m.messageStubType ||!m.isGroup) return true;
    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || chat.bienvenida === false) return true;

    const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null);
    if (!groupMetadata) return true;

    let userJid = m.messageStubParameters?.[0];
    if (!userJid) return true;

    // [FIX @lid -> @numero]
    let userName = userJid.split('@')[0];
    if (userJid.endsWith('@lid')) {
      try {
        let info = await conn.onWhatsApp(userJid);
        userName = info[0]?.jid?.split('@')[0] || userName;
      } catch(e){}
    }
    const user = `@${userName}`;

    // [DATOS DEL GRUPO]
    const groupName = groupMetadata.subject || 'Mi Grupo';
    const groupDesc = groupMetadata.desc?.toString() || '📜 No hay descripción';
    const groupMembers = groupMetadata.participants.length;

    const fixedImageUrl = 'https://files.evogb.win/FXbFDD.jpg'; // [TU LOGO SOLO SI NO TIENE FOTO]

    // [FIX] 1. INTENTA AGARRAR LA FOTO DEL USER PRIMERO
    let imgBuffer = null;
    try {
      let ppUrl = await conn.profilePictureUrl(userJid, 'image').catch(_ => null);
      if (ppUrl) {
        imgBuffer = await fetch(ppUrl).then(res => res.buffer()).catch(_ => null); // [SI TIENE FOTO = USA SU FOTO]
      }
    } catch(e){}

    // [FIX] 2. SI NO TIENE FOTO O FALLÓ, USA TU LOGO
    if (!imgBuffer) {
      imgBuffer = await fetch(fixedImageUrl).then(res => res.buffer()).catch(_ => null); // [SI NO TIENE = TU LOGO]
    }

    let text = '', audioFile = '';

    // [SWITCH PARA LOS 3 CASOS CON CUSTOM]
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      audioFile = './bienvenida.mp3';
      text = chat.customWelcome
     ? chat.customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@count/gi, groupMembers).replace(/@desc/gi, groupDesc)
        : `
╭───────────────────╮
│ 👋 *BIENVENIDO(A)* 👋 │
╰───────────────────╯

${user} acabas de entrar a:

🎮 *Grupo:* ${groupName}
👥 *Miembros:* ${groupMembers} integrantes
📜 *Descripción:* ${groupDesc}

✨ *Pásala bien, lee las reglas y diviértete* ✨
`.trim();

    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      audioFile = './despedida.mp3';
      text = chat.customBye
     ? chat.customBye.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@count/gi, groupMembers).replace(/@desc/gi, groupDesc)
        : `
╭───────────────────╮
│ 😭 *SE FUE* 😭 │
╰───────────────────╯

${user} salió de:

🎮 *Grupo:* ${groupName}
👥 *Quedamos:* ${groupMembers} integrantes
📜 *Motivo:* Salió por su cuenta

🕊️ *Que te vaya bien donde estés* 🕊️
`.trim();

    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      audioFile = './kick.mp3';
      text = chat.customKick
     ? chat.customKick.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@count/gi, groupMembers).replace(/@desc/gi, groupDesc)
        : `
╭───────────────────╮
│ ❌ *EXPULSADO* ❌ │
╰───────────────────╯

${user} fue expulsado de:

🎮 *Grupo:* ${groupName}
👥 *Quedamos:* ${groupMembers} integrantes
📜 *Motivo:* Incumplió las reglas

🚫 *No se toleran faltas de respeto* 🚫
`.trim();
    } else return true;

    // 1. MENSAJE 1: IMAGEN + TEXTO PRO
    if(imgBuffer){
      await conn.sendMessage(m.chat, { image: imgBuffer, caption: text, mentions: [userJid] });
    } else {
      await conn.sendMessage(m.chat, { text: text, mentions: [userJid] });
    }

    // 2. MENSAJE 2: AUDIO CON BARRA
    const audioPath = path.resolve(audioFile);
    if (fs.existsSync(audioPath)) {
      await new Promise(r => setTimeout(r, 1500)); // Delay para que no se pegue
      const audioBuffer = fs.readFileSync(audioPath);
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false // [AUDIO CON BARRA + TRANSCRIBIR]
      });
      console.log(`[WELCOME] ✅ Enviado: ${audioFile}`);
    } else {
      console.log(`[WELCOME] ❌ No existe: ${audioPath}`);
    }

  } catch (error) {
    console.error('❌ Error en welcome:', error);
  }
}

export const disabled = false;