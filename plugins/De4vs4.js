let salas = global.salas4vs4 = global.salas4vs4 || {}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  let chatId = m.chat
  let user = m.sender

  // [SUBCOMANDOS:.apuntar y.salir]
  if (command === 'apuntar' || command === 'salir') {
    let sala = salas[chatId]
    if (!sala) return m.reply('❌ No hay sala activa')

    let num = parseInt(args[0])

    // [SALIR] FIX: Ahora sí borra al usuario
    if (command === 'salir') {
      let idxT = sala.titulares.indexOf(user)
      let idxS = sala.suplentes.indexOf(user)
      if (idxT!== -1) sala.titulares[idxT] = null
      if (idxS!== -1) sala.suplentes[idxS] = null
      await m.react('✅')
      return conn.sendMessage(chatId, { text: `${usedPrefix}4vs4` }) // [REFRESH]
    }

    if (!num || num < 1 || num > 6) return m.reply(`❌ Usa: ${usedPrefix}apuntar [1-6]\n1-4 = Titular | 5-6 = Suplente`)

    // [EVITAR DOBLE]
    if (sala.titulares.includes(user) || sala.suplentes.includes(user))
      return m.reply('❌ Ya estás apuntado. Toca 🔄 Salir primero')

    // [APUNTAR]
    if (num >= 1 && num <= 4) {
      if (sala.titulares[num-1]) return m.reply(`❌ Titular ${num} ya está ocupado`)
      sala.titulares[num-1] = user
    }
    if (num >= 5 && num <= 6) {
      if (sala.suplentes[num-5]) return m.reply(`❌ Suplente ${num-4} ya está ocupado`)
      sala.suplentes[num-5] = user
    }
    await m.react('✅')
    return conn.sendMessage(chatId, { text: `${usedPrefix}4vs4` }) // [REFRESH]
  }

  // [COMANDO PRINCIPAL:.4vs4]
  if (command === '4vs4') {
    if (!args[0]) {
      // [MOSTRAR SALA]
      let sala = salas[chatId]
      if (!sala) return m.reply(`❌ No hay sala activa.\nCrea una con: ${usedPrefix}4vs4 crear [Hora] [Reglas] [VS]`)

      let txt = `╭───〔 🔥 4 VS 4 〕───╮\n`
      txt += `│\n│ *VS:* ${sala.vs}\n│ *🕚 Hora:* ${sala.hora}\n│ *👑 Admin:* @${sala.admin.split('@')[0]}\n│ *📜 Reglas:* ${sala.reglas}\n│\n`
      txt += `├─ *TITULARES* [${sala.titulares.filter(v => v).length}/4]\n`
      txt += sala.titulares.map((v, i) => `│ ⚡ ${i+1}. ${v? `@${v.split('@')[0]}` : '_Vacío_'}`).join('\n') + '\n│\n'
      txt += `├─ *SUPLENTES* [${sala.suplentes.filter(v => v).length}/2]\n`
      txt += sala.suplentes.map((v, i) => `│ 🐾 ${i+1}. ${v? `@${v.split('@')[0]}` : '_Vacío_'}`).join('\n') + '\n'
      txt += `╰────────────────────╯\n\n*👇 Toca para apuntarte*`

      // [BOTONES FIX] Compatible Baileys v6+
      let buttons1 = [
        { buttonId: `${usedPrefix}apuntar 1`, buttonText: { displayText: '⚡ T1' }, type: 1 },
        { buttonId: `${usedPrefix}apuntar 2`, buttonText: { displayText: '⚡ T2' }, type: 1 },
        { buttonId: `${usedPrefix}apuntar 3`, buttonText: { displayText: '⚡ T3' }, type: 1 },
      ]
      let buttons2 = [
        { buttonId: `${usedPrefix}apuntar 4`, buttonText: { displayText: '⚡ T4' }, type: 1 },
        { buttonId: `${usedPrefix}apuntar 5`, buttonText: { displayText: '🐾 S1' }, type: 1 },
        { buttonId: `${usedPrefix}apuntar 6`, buttonText: { displayText: '🐾 S2' }, type: 1 },
      ]
      let buttons3 = [
        { buttonId: `${usedPrefix}salir`, buttonText: { displayText: '🔄 Salir' }, type: 1 },
        { buttonId: `${usedPrefix}4vs4`, buttonText: { displayText: '🔄 Refresh' }, type: 1 },
      ]

      await conn.sendMessage(chatId, {
        text: txt,
        footer: `Admin: @${sala.admin.split('@')[0]}`,
        buttons: buttons1,
        headerType: 1,
        mentions: [...sala.titulares,...sala.suplentes, sala.admin].filter(Boolean)
      }, { quoted: m })

      await conn.sendMessage(chatId, { text: ' ', footer: ' ', buttons: buttons2, headerType: 1 })
      await conn.sendMessage(chatId, { text: ' ', footer: ' ', buttons: buttons3, headerType: 1 })
      return
    }

    let tipo = args[0].toLowerCase()

    // [CREAR SALA]
    if (tipo === 'crear') {
      if (salas[chatId]) return m.reply('❌ Ya hay una sala activa. Ciérrala con.4vs4 cerrar')
      let hora = args[1] || '5Pm'
      let reglas = args[2] || 'Apostado'
      let vs = args[3] || 'Tkm'
      salas[chatId] = {
        admin: user,
        vs: vs,
        hora: hora,
        reglas: reglas,
        titulares: [null, null, null, null],
        suplentes: [null, null]
      }
      return m.reply(`✅ Sala 4vs4 creada vs ${vs} a las ${hora}\nUsa.4vs4 para ver la sala con botones`)
    }

    // [EDITAR SALA]
    if (tipo === 'edit') {
      let sala = salas[chatId]
      if (!sala) return m.reply('❌ No hay sala')
      if (sala.admin!== user) return m.reply('❌ Solo el admin')
      sala.hora = args[1] || sala.hora
      sala.reglas = args[2] || sala.reglas
      sala.vs = args[3] || sala.vs
      return m.reply(`✅ Sala editada\nVS: ${sala.vs}\nHora: ${sala.hora}\nReglas: ${sala.reglas}`)
    }

    // [CERRAR SALA]
    if (tipo === 'cerrar') {
      let sala = salas[chatId]
      if (!sala) return m.reply('❌ No hay sala')
      if (sala.admin!== user) return m.reply('❌ Solo el admin')
      delete salas[chatId]
      return m.reply('🗑️ Sala 4vs4 eliminada')
    }
  }
}

handler.help = ['4vs4', 'apuntar', 'salir']
handler.tags = ['freefire']
handler.command = /^(4vs4|apuntar|salir)$/i
handler.group = true
export default handler