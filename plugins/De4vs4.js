import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let salas = global.salas4vs4 = global.salas4vs4 || {}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  let chatId = m.chat
  let user = m.sender

  // [SUBCOMANDOS:.apuntar y.salir]
  if (command === 'apuntar' || command === 'salir') {
    let sala = salas[chatId]
    if (!sala) return m.reply('❌ No hay sala activa')
    let num = parseInt(args[0])

    if (command === 'salir') {
      let idxT = sala.titulares.indexOf(user)
      let idxS = sala.suplentes.indexOf(user)
      if (idxT!== -1) sala.titulares = null
      if (idxS!== -1) sala.suplentes = null
      await m.react('✅')
      return conn.sendMessage(chatId, { text: `${usedPrefix}4vs4` })
    }

    if (!num || num < 1 || num > 6) return m.reply(`❌ Opción inválida`)
    if (sala.titulares.includes(user) || sala.suplentes.includes(user))
      return m.reply('❌ Ya estás apuntado. Toca 🔄 Salir primero')

    if (num >= 1 && num <= 4) {
      if (sala.titulares[num-1]) return m.reply(`❌ Titular ${num} ocupado`)
      sala.titulares[num-1] = user
    }
    if (num >= 5 && num <= 6) {
      if (sala.suplentes[num-5]) return m.reply(`❌ Suplente ${num-4} ocupado`)
      sala.suplentes[num-5] = user
    }
    await m.react('✅')
    return conn.sendMessage(chatId, { text: `${usedPrefix}4vs4` })
  }

  // [COMANDO PRINCIPAL:.4vs4]
  if (command === '4vs4') {
    if (!args[0]) {
      let sala = salas[chatId]
      if (!sala) return m.reply(`❌ No hay sala activa.\nCrea una con: ${usedPrefix}4vs4 crear [Hora] [Reglas] [VS]`)

      let txt = `╭───〔 🔥 4 VS 4 〕───╮\n`
      txt += `│\n│ *VS:* ${sala.vs}\n│ *🕚 Hora:* ${sala.hora}\n│ *👑 Admin:* @${sala.admin.split('@')[0]}\n│ *📜 Reglas:* ${sala.reglas}\n│\n`
      txt += `├─ *TITULARES* [${sala.titulares.filter(v => v).length}/4]\n`
      txt += sala.titulares.map((v, i) => `│ ⚡ ${i+1}. ${v? `@${v.split('@')[0]}` : '_Vacío_'}`).join('\n') + '\n│\n'
      txt += `├─ *SUPLENTES* [${sala.suplentes.filter(v => v).length}/2]\n`
      txt += sala.suplentes.map((v, i) => `│ 🐾 ${i+1}. ${v? `@${v.split('@')[0]}` : '_Vacío_'}`).join('\n') + '\n'
      txt += `╰────────────────────╯\n\n*👇 Toca el botón para apuntarte*`

      // [FIX] LISTMESSAGE NATIVO BAILEYS
      const listMessage = {
        title: 'Sala 4vs4',
        text: txt,
        footer: `Admin: @${sala.admin.split('@')[0]}`,
        buttonText: '📋 Apuntarse',
        sections: [
          { 
            title: "APUNTARSE", 
            rows: [
              { title: "⚡ Titular 1", description: "Slot 1", id: `${usedPrefix}apuntar 1` },
              { title: "⚡ Titular 2", description: "Slot 2", id: `${usedPrefix}apuntar 2` },
              { title: "⚡ Titular 3", description: "Slot 3", id: `${usedPrefix}apuntar 3` },
              { title: "⚡ Titular 4", description: "Slot 4", id: `${usedPrefix}apuntar 4` },
              { title: "🐾 Suplente 1", description: "Slot 5", id: `${usedPrefix}apuntar 5` },
              { title: "🐾 Suplente 2", description: "Slot 6", id: `${usedPrefix}apuntar 6` },
              { title: "🔄 Salir", description: "Salirse de la sala", id: `${usedPrefix}salir` },
            ]
          }
        ],
        mentions: [...sala.titulares,...sala.suplentes, sala.admin].filter(Boolean)
      }

      const msg = generateWAMessageFromContent(m.chat, {
        listMessage
      }, { quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return
    }

    let tipo = args[0].toLowerCase()
    if (tipo === 'crear') {
      if (salas[chatId]) return m.reply('❌ Ya hay una sala activa. Ciérrala con.4vs4 cerrar')
      let hora = args[1] || '5Pm'
      let reglas = args[2] || 'Apostado'
      let vs = args[3] || 'Tkm'
      salas[chatId] = { admin: user, vs, hora, reglas, titulares: [null, null, null, null], suplentes: [null, null] }
      return m.reply(`✅ Sala 4vs4 creada vs ${vs} a las ${hora}`)
    }
    if (tipo === 'edit') {
      let sala = salas[chatId]
      if (!sala || sala.admin!== user) return m.reply('❌ Solo el admin')
      sala.hora = args[1] || sala.hora
      sala.reglas = args[2] || sala.reglas
      sala.vs = args[3] || sala.vs
      return m.reply(`✅ Sala editada`)
    }
    if (tipo === 'cerrar') {
      let sala = salas[chatId]
      if (!sala || sala.admin!== user) return m.reply('❌ Solo el admin')
      delete salas[chatId]
      return m.reply('🗑️ Sala eliminada')
    }
  }
}

handler.help = ['4vs4', 'apuntar', 'salir']
handler.tags = ['freefire']
handler.command = /^(4vs4|apuntar|salir)$/i
handler.group = true
export default handler