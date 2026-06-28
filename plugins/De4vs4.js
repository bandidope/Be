let salas = global.salas4vs4 = global.salas4vs4 || {}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  let chatId = m.chat
  let user = m.sender

  // [SUBCOMANDOS]
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
      return conn.reply(chatId, `${usedPrefix}4vs4`, m)
    }
    if (!num || num < 1 || num > 6) return m.reply(`❌ Usa 1-6`)
    if (sala.titulares.includes(user) || sala.suplentes.includes(user))
      return m.reply('❌ Ya estás. Toca Salir primero')
    if (num <= 4) {
      if (sala.titulares[num-1]) return m.reply(`❌ T${num} ocupado`)
      sala.titulares[num-1] = user
    } else {
      if (sala.suplentes[num-5]) return m.reply(`❌ S${num-4} ocupado`)
      sala.suplentes[num-5] = user
    }
    await m.react('✅')
    return conn.reply(chatId, `${usedPrefix}4vs4`, m)
  }

  // [COMANDO PRINCIPAL]
  if (command === '4vs4') {
    if (!args[0]) {
      let sala = salas[chatId]
      if (!sala) return m.reply(`❌ No hay sala.\nCrea: ${usedPrefix}4vs4 crear [Hora] [Reglas] [VS]`)

      let txt = `╭───〔 🔥 4 VS 4 〕───╮\n`
      txt += `│ *VS:* ${sala.vs} | *🕚* ${sala.hora}\n│ *👑* @${sala.admin.split('@')[0]} | *📜* ${sala.reglas}\n├─ *TITULARES* [${sala.titulares.filter(v => v).length}/4]\n`
      txt += sala.titulares.map((v, i) => `│ ⚡ ${i+1}. ${v? `@${v.split('@')[0]}` : '_Vacío_'}`).join('\n') + '\n├─ *SUPLENTES* [${sala.suplentes.filter(v => v).length}/2]\n'
      txt += sala.suplentes.map((v, i) => `│ 🐾 ${i+1}. ${v? `@${v.split('@')[0]}` : '_Vacío_'}`).join('\n') + '\n╰────────────────────╯'

      // [FIX IPHONE] sendHydrated del De. 4 botones máx
      let buttons = [
        { id: `${usedPrefix}apuntar 1`, text: '⚡ T1' },
        { id: `${usedPrefix}apuntar 2`, text: '⚡ T2' },
        { id: `${usedPrefix}apuntar 3`, text: '⚡ T3' },
        { id: `${usedPrefix}apuntar 4`, text: '⚡ T4' },
      ]
      let buttons2 = [
        { id: `${usedPrefix}apuntar 5`, text: '🐾 S1' },
        { id: `${usedPrefix}apuntar 6`, text: '🐾 S2' },
        { id: `${usedPrefix}salir`, text: '🔄 Salir' },
        { id: `${usedPrefix}4vs4`, text: '🔄 Refresh' },
      ]

      await conn.sendHydrated(chatId, txt, `Admin: @${sala.admin.split('@')[0]}`, null, null, null, null, null, buttons, m, { mentions: [...sala.titulares,...sala.suplentes, sala.admin].filter(Boolean) })
      await conn.sendHydrated(chatId, ' ', ' ', null, null, null, null, null, buttons2, m) // 2do mensaje con el resto
      return
    }

    let tipo = args[0].toLowerCase()
    if (tipo === 'crear') {
      if (salas[chatId]) return m.reply('❌ Ya hay sala..4vs4 cerrar')
      salas[chatId] = { admin: user, vs: args[3] || 'Tkm', hora: args[1] || '5Pm', reglas: args[2] || 'Apostado', titulares: [null, null, null, null], suplentes: [null, null] }
      return m.reply(`✅ Sala vs ${args[3] || 'Tkm'} a las ${args[1] || '5Pm'}`)
    }
    if (tipo === 'edit' && salas[chatId]?.admin === user) {
      salas[chatId].hora = args[1] || salas[chatId].hora
      salas[chatId].reglas = args[2] || salas[chatId].reglas
      salas[chatId].vs = args[3] || salas[chatId].vs
      return m.reply(`✅ Editado`)
    }
    if (tipo === 'cerrar' && salas[chatId]?.admin === user) {
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