import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync} from 'fs'
import path from 'path'

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata}) {
    if (!m.messageStubType ||!m.isGroup) return

    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "KingMenu"
},
        message: {
            locationMessage: {
                name: "*For Three Bot*",
                jpegThumbnail: await (await fetch('https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png')).buffer(),
                vcard:
                    "BEGIN:VCARD\n" +
                    "VERSION:3.0\n" +
                    "N:;For Three;;;\n" +
                    "FN:For Three Bot\n" +
                    "ORG: Whois Developers\n" +
                    "TITLE:\n" +
                    "item1.TEL;waid=51936994155:+51 936 994 155\n" +
                    "item1.X-ABLabel:King\n" +
                    "X-WA-BIZ-DESCRIPTION:👑 El sistema definitivo.\n" +
                    "X-WA-BIZ-NAME:The King's Bot\n" +
                    "END:VCARD"
}
},
        participant: "0@s.whatsapp.net"
}

    let chat = global.db.data.chats[m.chat]
    let usuario = `@${m.sender.split`@`[0]}`
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'

    let nombre = `> ✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters[0]}_`
    let foto = `> 📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`
    let edit = `> ⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *${m.messageStubParameters[0] == 'on'? 'solo los administradores': 'todos'}* pueden configurar el grupo.`
    let newlink = `> 🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: ${usuario}`
    let status = `> 🗣️ El grupo ha sido *${m.messageStubParameters[0] == 'on'? 'cerrado': 'abierto'}* por ${usuario}!\n\n> 💬 Ahora *${m.messageStubParameters[0] == 'on'? 'solo los administradores': 'todos'}* pueden enviar mensajes.`
    let admingp = `> 👑 @${m.messageStubParameters[0].split`@`[0]} *¡Ahora es administrador del grupo!* 👑\n\n> 💫 Acción realizada por: ${usuario}`
    let noadmingp = `🗑️ @${m.messageStubParameters[0].split`@`[0]} *ha dejado de ser administrador del grupo.* 🗑️\n\n> 💫 Acción realizada por: ${usuario}`

    if (chat.detect && m.messageStubType == 21) {
        await this.sendMessage(m.chat, { text: nombre, mentions: [m.sender]}, { quoted: fkontak})
} else if (chat.detect && m.messageStubType == 22) {
        await this.sendMessage(m.chat, { image: { url: pp}, caption: foto, mentions: [m.sender]}, { quoted: fkontak})
} else if (chat.detect && m.messageStubType == 23) {
        await this.sendMessage(m.chat, { text: newlink, mentions: [m.sender]}, { quoted: fkontak})
} else if (chat.detect && m.messageStubType == 25) {
        await this.sendMessage(m.chat, { text: edit, mentions: [m.sender]}, { quoted: fkontak})
} else if (chat.detect && m.messageStubType == 26) {
        await this.sendMessage(m.chat, { text: status, mentions: [m.sender]}, { quoted: fkontak})
} else if (chat.detect && m.messageStubType == 29) {
        await this.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`]}, { quoted: fkontak})
} else if (chat.detect && m.messageStubType == 30) {
await this.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`]}, { quoted: fkontak})
} else {
        console.log({
            messageStubType: m.messageStubType,
            messageStubParameters: m.messageStubParameters,
            type: WAMessageStubType[m.messageStubType],
})
}
}

export default handler
