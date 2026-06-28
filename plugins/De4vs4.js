let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]

    // Inicializar si no existe
    if (!chat.vs4) chat.vs4 = {
        active: false,
        clan: '[RIVAL]',
        hora: '[HORA]',
        reglas: 'Sala, 4vs4, sin minas',
        titulares: ['', '', ''],
        suplentes: ['', ''],
        admin: ''
    }

    let data = chat.vs4

    //.4vs4 = crear/reiniciar sala
    if (!args[0]) {
        data.active = true
        data.admin = m.sender
        data.titulares = ['', '', '']
        data.suplentes = ['', '']

        let buttons = [
            ['⚡ T1', `${usedPrefix}apuntar 1`],
            ['⚡ T2', `${usedPrefix}apuntar 2`],
            ['⚡ T3', `${usedPrefix}apuntar 3`],
            ['⚡ T4', `${usedPrefix}apuntar 4`],
            ['🐾 S1', `${usedPrefix}apuntar 5`],
            ['🐾 S2', `${usedPrefix}apuntar 6`],
            ['🔄 SALIR', `${usedPrefix}salir`]
        ]

        let { text, mentions } = await generarTexto(data)
        return conn.sendButton(m.chat, text, 'Click para apuntarte 👇', null, buttons, m, { mentions })
    }

    //.4vs4 edit Clan Hora Reglas
    if (args[0] === 'edit') {
        if (!data.active) return m.reply('❌ No hay sala activa. Usa `.4vs4` primero')
        if (data.admin!== m.sender) return m.reply('❌ Solo el admin de la sala.')

        let [clan, hora,...reglasArr] = args.slice(1)
        let reglas = reglasArr.join(' ')

        if (clan && clan!== '_') data.clan = clan
        if (hora && hora!== '_') data.hora = hora
        if (reglas) data.reglas = reglas

        let buttons = [['⚡ T1', `${usedPrefix}apuntar 1`],['⚡ T2', `${usedPrefix}apuntar 2`],['⚡ T3', `${usedPrefix}apuntar 3`],['⚡ T4', `${usedPrefix}apuntar 4`],['🐾 S1', `${usedPrefix}apuntar 5`],['🐾 S2', `${usedPrefix}apuntar 6`],['🔄 SALIR', `${usedPrefix}salir`]]
        let { text, mentions } = await generarTexto(data)
        return conn.sendButton(m.chat, text, 'Sala actualizada ✅', null, buttons, m, { mentions })
    }
}
handler.help = ['4vs4', '4vs4 edit Clan Hora Reglas']
handler.tags = ['ff']
handler.command = /^(4vs4)$/i
handler.group = true
export default handler

//.apuntar
let apuntar = async (m, { conn, args, usedPrefix }) => {
    let chat = global.db.data.chats[m.chat]
    let data = chat.vs4
    if (!data?.active) return m.reply('❌ No hay sala activa. Usa `.4vs4`')

    let pos = parseInt(args[0]) - 1
    let user = `@${m.sender.split('@')[0]}`

    if ([...data.titulares,...data.suplentes].includes(user))
        return m.reply('❌ Ya estás apuntado. Usa 🔄 SALIR primero')

    if (pos >= 0 && pos < 4) data.titulares[pos] = user
    else if (pos >= 4 && pos < 6) data.suplentes[pos - 4] = user
    else return m.reply('❌ Posición inválida')

    let buttons = [['⚡ T1', `${usedPrefix}apuntar 1`],['⚡ T2', `${usedPrefix}apuntar 2`],['⚡ T3', `${usedPrefix}apuntar 3`],['⚡ T4', `${usedPrefix}apuntar 4`],['🐾 S1', `${usedPrefix}apuntar 5`],['🐾 S2', `${usedPrefix}apuntar 6`],['🔄 SALIR', `${usedPrefix}salir`]]
    let { text, mentions } = await generarTexto(data)
    conn.sendButton(m.chat, text, 'Listo ✅', null, buttons, m, { mentions })
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

    let buttons = [['⚡ T1', `${usedPrefix}apuntar 1`],['⚡ T2', `${usedPrefix}apuntar 2`],['⚡ T3', `${usedPrefix}apuntar 3`],['⚡ T4', `${usedPrefix}apuntar 4`],['🐾 S1', `${usedPrefix}apuntar 5`],['🐾 S2', `${usedPrefix}apuntar 6`],['🔄 SALIR', `${usedPrefix}salir`]]
    let { text, mentions } = await generarTexto(data)
    conn.sendButton(m.chat, text, 'Saliste de la lista 🔄', null, buttons, m, { mentions })
}
salir.command = /^(salir)$/i
export { salir }

// Función para generar el texto y menciones
async function generarTexto(data) {
    let mentions = [data.admin,...data.titulares.filter(Boolean),...data.suplentes.filter(Boolean)].filter(Boolean)
    mentions = [...new Set(mentions)]

    let texto = `
╰› *4 VS 4* Ი𐑼 VS *${data.clan}*
⊹ ࣪ ˖🕚 *Hora:* ${data.hora} 🇵🇪 | 🇦🇷 | 🇨🇱
૮🩹ა *Encargad@:* @${data.admin.split('@')[0]}
˚꒰🏡୭ *Reglas:* ${data.reglas}
˚꒰🆚୭ *Rival:* ${data.clan}

𓍼 ׅ *TITULARES:*
⚡| 1. ${data.titulares[0] || '_Vacío_'}
⚡| 2. ${data.titulares[1] || '_Vacío_'}
⚡| 3. ${data.titulares[2] || '_Vacío_'}
⚡| 4. ${data.titulares[3] || '_Vacío_'}

𓍼 ִ *SUPLENTES:*
🐾𑁤 1. ${data.suplentes[0] || '_Vacío_'}
🐾𑁤 2. ${data.suplentes[1] || '_Vacío_'}
`
    return { text: texto, mentions: mentions }
}