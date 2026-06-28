let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]

    // Inicializar si no existe
    if (!chat.vs4) chat.vs4 = {
        active: false,
        clan: '[RIVAL]',
        hora: '[HORA]',
        reglas: 'Sala, 4vs4, sin minas',
        titulares: ['', '', ''], // 4 titulares
        suplentes: ['', ''], // 2 suplentes
        admin: ''
    }

    let data = chat.vs4

    //.4vs4 = crear/reiniciar sala
    if (!args[0]) {
        data.active = true
        data.admin = m.sender
        data.titulares = ['', '', '']
        data.suplentes = ['', '']

        let { text, mentions } = await generarTexto(data)
        let menu = `${text}

*📝 PARA APUNTARTE COPIA Y PEGA:*
⚡ Titular 1: ${usedPrefix}apuntar 1
⚡ Titular 2: ${usedPrefix}apuntar 2
⚡ Titular 3: ${usedPrefix}apuntar 3
⚡ Titular 4: ${usedPrefix}apuntar 4
🐾 Suplente 1: ${usedPrefix}apuntar 5
🐾 Suplente 2: ${usedPrefix}apuntar 6
🔄 Salir: ${usedPrefix}salir

*⚙️ ADMIN:*
${usedPrefix}4vs4 edit [Hora] [Reglas]
${usedPrefix}4vs4 cerrar = Borrar sala`
        return conn.sendMessage(m.chat, { text: menu, mentions })
    }

    //.4vs4 edit Clan Hora Reglas
    if (args[0] === 'edit') {
        if (!data.active) return m.reply('❌ No hay sala activa. Usa `.4vs4` primero')
        if (data.admin!== m.sender &&!m.isAdmin) return m.reply('❌ Solo el admin de la sala o un admin del grupo.')

        let [clan, hora,...reglasArr] = args.slice(1)
        let reglas = reglasArr.join(' ')

        if (clan && clan!== '_') data.clan = clan
        if (hora && hora!== '_') data.hora = hora
        if (reglas) data.reglas = reglas

        let { text, mentions } = await generarTexto(data)
        return conn.sendMessage(m.chat, { text: text + '\n\n✅ Sala actualizada', mentions })
    }

    //.4vs4 cerrar = ELIMINAR LISTA
    if (args[0] === 'cerrar') {
        if (!data.active) return m.reply('❌ No hay sala activa')
        if (data.admin!== m.sender &&!m.isAdmin) return m.reply('❌ Solo el admin de la sala o un admin del grupo.')
        data.active = false
        data.titulares = ['', '', '']
        data.suplentes = ['', '']
        data.clan = '[RIVAL]'
        data.hora = '[HORA]'
        data.reglas = 'Sala, 4vs4, sin minas'
        data.admin = ''
        return m.reply('🗑️ Sala eliminada 100%. Usa `.4vs4` para crear otra')
    }
}
handler.help = ['4vs4', '4vs4 edit Clan Hora Reglas', '4vs4 cerrar']
handler.tags = ['ff']
handler.command = /^(4vs4)$/i
handler.group = true
export default handler

//.apuntar 1 al 6
let apuntar = async (m, { conn, args, usedPrefix }) => {
    let chat = global.db.data.chats[m.chat]
    let data = chat.vs4
    if (!data?.active) return m.reply('❌ No hay sala activa. Usa `.4vs4`')

    let pos = parseInt(args[0]) - 1
    let user = `@${m.sender.split('@')[0]}`

    if (isNaN(pos)) return m.reply(`❌ Usa un número del 1 al 6\nEj: ${usedPrefix}apuntar 1`)

    if ([...data.titulares,...data.suplentes].includes(user))
        return m.reply(`❌ Ya estás apuntado. Usa ${usedPrefix}salir primero`)

    if (pos >= 0 && pos < 4) {
        if (data.titulares[pos]) return m.reply(`❌ El puesto ${pos+1} ya está ocupado`)
        data.titulares[pos] = user
    } else if (pos >= 4 && pos < 6) {
        if (data.suplentes[pos - 4]) return m.reply(`❌ El puesto S${pos-3} ya está ocupado`)
        data.suplentes[pos - 4] = user
    } else return m.reply('❌ Solo del 1 al 6')

    let { text, mentions } = await generarTexto(data)
    conn.sendMessage(m.chat, { text, mentions })
}
apuntar.command = /^(apuntar)$/i
export { apuntar }

//.salir
let salir = async (m, { conn, usedPrefix }) => {
    let chat = global.db.data.chats[m.chat]
    let data = chat.vs4
    if (!data?.active) return m.reply('❌ No hay sala activa.')

    let user = `@${m.sender.split('@')[0]}`
    let idxTit = data.titulares.indexOf(user)
    let idxSup = data.suplentes.indexOf(user)

    if (idxTit!== -1) data.titulares[idxTit] = ''
    else if (idxSup!== -1) data.suplentes[idxSup] = ''
    else return m.reply('❌ No estás en la lista.')

    let { text, mentions } = await generarTexto(data)
    conn.sendMessage(m.chat, { text: text + '\n\n🔄 Saliste de la lista', mentions })
}
salir.command = /^(salir)$/i
export { salir }

// Función para generar el texto y menciones
async function generarTexto(data) {
    let mentions = [data.admin,...data.titulares.filter(Boolean),...data.suplentes.filter(Boolean)].filter(Boolean)
    mentions = [...new Set(mentions)]

    let texto = `╭───〔 🔥 4 VS 4 〕───╮
│
│ *VS:* ${data.clan}
│ *🕚 Hora:* ${data.hora}
│ *👑 Admin:* @${data.admin.split('@')[0]}
│ *📜 Reglas:* ${data.reglas}
│
├─ *TITULARES* [4/4]
│ ⚡ 1. ${data.titulares[0] || '_Vacío_'}
│ ⚡ 2. ${data.titulares[1] || '_Vacío_'}
│ ⚡ 3. ${data.titulares[2] || '_Vacío_'}
│ ⚡ 4. ${data.titulares[3] || '_Vacío_'}
│
├─ *SUPLENTES* [2/2]
│ 🐾 1. ${data.suplentes[0] || '_Vacío_'}
│ 🐾 2. ${data.suplentes[1] || '_Vacío_'}
│
╰────────────────────╯`
    return { text: texto, mentions: mentions }
}