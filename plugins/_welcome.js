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

    // 1. CONFIG FALLBACK Y AUDIOS
    const fallbackImageUrl = 'https://files.evogb.win/FXbFDD.jpg'; // [TU FOTO SI NO TIENE]
    const fkontak = { key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' }, message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${conn.user.jid.split('@')[0]}:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, participant: '0@s.whatsapp.net' };

    let userJid = m.messageStubParameters?.[0] || m.key?.participant;
    if (!userJid) return true;

    // 2. FOTO DE PERFIL O FALLBACK
    let ppUser;
    try {
      ppUser = await conn.profilePictureUrl(userJid, 'image');
    } catch {
      ppUser = fallbackImageUrl; // [FIX] Usa tu imagen si no tiene foto
      console.log(`[WELCOME] Sin foto, usando fallback`)
    }
    const imgBuffer = await fetch(ppUser).then(res => res.buffer()).catch(_ => null);
    if (!imgBuffer) return true;

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || '📜 Sin descripción disponible';
    const { customWelcome, customBye, customKick } = chat;

    let text, type = '', audioFile = '';
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      type = 'Bienvenida';
      audioFile = './bienvenida.mp3'; // [RAIZ]
      text = customWelcome? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) : `👋 *¡Bienvenido ${user}!*\n\n¡Ya estás en *${groupName}*!\n\n📜 *Sobre el grupo:*\n_${groupDesc}_\n\n*Pasa piola y lee las reglas 😎*`;
    }
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      type = 'Salida';
      audioFile = './despedida.mp3'; // [RAIZ]
      text = customBye? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName) : `😭 *Se fue ${user}* \n\nGracias por estar en *${groupName}*. ¡Vuelve pronto!`;
    }
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      type = 'Kick';
      audioFile = './kick.mp3'; // [RAIZ]
      text = customKick? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName) : `❌ *${user} fue expulsado de ${groupName}*`;
    }
    if(!text) return true;

    console.log(`[WELCOME] Enviando ${type} a ${user}`)

    // 3. MANDAR IMAGEN + TEXTO PRIMERO
    await conn.sendMessage(m.chat, { image: imgBuffer, caption: text, mentions: [userJid] }, { quoted: fkontak });

    // 4. MANDAR AUDIO PTT DESPUES [SI EXISTE]
    const audioPath = path.resolve(audioFile);
    if (fs.existsSync(audioPath)) {
      await new Promise(r => setTimeout(r, 1200)); // Delay 1.2s para separar mensajes
      const audioBuffer = fs.readFileSync(audioPath);
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: true // Nota de voz azul
      }, { quoted: fkontak });
      console.log(`[WELCOME] Audio enviado: ${audioFile}`)
    } else {
      console.log(`[WELCOME] No existe el audio: ${audioFile}`)
    }

  } catch (error) {
    console.error('❌ Error en welcome:', error);
  }
}