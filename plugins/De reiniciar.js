const MARCA = 'For Three Bot 🌀'

let handler = async (m, { conn }) => {
    if (!process.send) throw `*『✦』Error:* Ejecuta el bot con *node start.js*\n${MARCA}`

    const { key } = await conn.sendMessage(m.chat, {text: `🗂️ Cargando...`}, {quoted: m})
    await delay(800)
    await conn.sendMessage(m.chat, {text: `📦 Cargando...`, edit: key})
    await delay(800)
    await conn.sendMessage(m.chat, {text: `♻️ Cargando...`, edit: key})
    await delay(500)
    await conn.sendMessage(m.chat, {text: `*『⛏️』Reinicio completo...*\n${MARCA}`, edit: key})

    process.exit(0) // Mata el proceso. start.js lo levanta solo
}

handler.help = ['restart', 'reiniciar']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar']
handler.rowner = true

export default handler
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))