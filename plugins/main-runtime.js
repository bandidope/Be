const MARCA = 'For Three Bot 🌀'

let handler = async (m, { conn }) => {
    let uptime = process.uptime() * 1000 // Uptime de Node.js en ms
    let muptime = clockString(uptime)
    m.reply(`*» Bot activo durante* : ${muptime}\n${MARCA}`) 
}

handler.help = ['runtime', 'uptime']
handler.tags = ['main']
handler.command = ['runtime', 'uptime']
export default handler

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, 'd ', h, 'h ', m, 'm ', s, 's '].map(v => v.toString().padStart(2, 0)).join('')
}