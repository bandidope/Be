let ruletaDB = global.db.data.ruleta || (global.db.data.ruleta = {})

const Emojis = ['🟥', '🟦', '🟩', '🟨', '🟪', '🟧', '🟫', '⬛']
const MARCA = 'For Three Bot 🌀' // <- TU MARCA

let handler = async (m, { conn, args, command, isAdmin }) => {
    if (!isAdmin) throw `❌ *Solo administradores del grupo*\n${MARCA}`

    let chatId = m.chat
    ruletaDB[chatId]??= []

    let texto = args.join(' ').trim()

    switch (command) {
        case 'addrl': {
            if (!texto) throw `ꕤ *Uso:* #addrl Nombre1 / Nombre2 / Nombre3\n${MARCA}`
            let nombres = [...new Set(texto.split('/').map(v => v.trim()).filter(v => v))]
            let agregados = []
            for (let name of nombres) {
                if (!ruletaDB[chatId].some(v => v.toLowerCase() === name.toLowerCase())) {
                    ruletaDB[chatId].push(name)
                    agregados.push(name)
                }
            }
            if (agregados.length === 0) throw `⚠️ Todos esos nombres ya estaban\n${MARCA}`
            let lista = ruletaDB[chatId].map((v,i) => `${Emojis[i % Emojis.length]} ${v}`).join('\n')
            m.reply(`✅ *Agregados:* ${agregados.join(', ')}\n\n╭━━〔 *🎡 RULETA* 〕━━┈⊷\n${lista}\n╰ *Total:* ${ruletaDB[chatId].length}\n\n${MARCA}`)
        }
        break

        case 'delusrl': {
            if (!texto) throw `ꕤ *Uso:* #delusrl Nombre\n${MARCA}`
            let antes = ruletaDB[chatId].length
            ruletaDB[chatId] = ruletaDB[chatId].filter(v => v.toLowerCase()!== texto.toLowerCase())
            if (ruletaDB[chatId].length === antes) throw `⚠️ ${texto} no está en la ruleta\n${MARCA}`
            m.reply(`🗑️ *Quitado:* ${texto}\n*Restantes:* ${ruletaDB[chatId].length}\n\n${MARCA}`)
        }
        break

        case 'listrl': {
            if (ruletaDB[chatId].length === 0) throw `🧹 La ruleta está vacía\n${MARCA}`
            let lista = ruletaDB[chatId].map((v,i) => `${Emojis[i % Emojis.length]} ${v}`).join('\n')
            m.reply(`╭━━〔 *🎡 PARTICIPANTES* 〕━━┈⊷\n${lista}\n╰ *Total:* ${ruletaDB[chatId].length}\n\n${MARCA}`)
        }
        break

        case 'spinrl': {
            if (ruletaDB[chatId].length < 2) throw `❌ *Mínimo 2 personas*\n${MARCA}`
            let ruletaVisual = ruletaDB[chatId].map((v,i) => `${Emojis[i % Emojis.length]} ${v}`).join('\n')
            await conn.reply(m.chat, `🎡 *Girando...*\n\n${ruletaVisual}\n\n${MARCA}`, m)
            await delay(2000 + Math.random() * 1500)
            let idx = Math.floor(Math.random() * ruletaDB[chatId].length)
            let ganador = ruletaDB[chatId].splice(idx, 1)[0]
            m.reply(`╭━━〔 *🎯 RESULTADO* 〕━━┈⊷\n┃\n┃ 🏆 *GANADOR:* *${ganador}*\n┃\n┃ Restantes: ${ruletaDB[chatId].length}\n╰━━━━━━━━━━┈⊷\n\n${MARCA}`)
        }
        break

        case 'clearrl': {
            ruletaDB[chatId] = []
            m.reply(`🧹 *Ruleta borrada.*\n\n${MARCA}`)
        }
        break
    }
}

handler.help = ['addrl', 'delusrl', 'spinrl', 'clearrl', 'listrl']
handler.tags = ['sorteos']
handler.command = /^(addrl|delusrl|spinrl|clearrl|listrl)$/i
handler.admin = true

export default handler
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))