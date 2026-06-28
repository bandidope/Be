let handler = async (m, { conn, isOwner, usedPrefix }) => {
    if (!isOwner) throw '❌ *Solo el Owner del bot puede reiniciar*'
    
    const MARCA = 'For Three Bot 🌀'
    
    await m.reply(`🔄 *Reiniciando bot...*\nEspere 5 segundos\n${MARCA}`)
    
    process.send?.('reset') // Para pm2 o bash que tenga "restart"
    
    // Si usas node index.js normal, esto lo apaga y el bash lo levanta solo
    process.exit(1) 
}

handler.help = ['reiniciar']
handler.tags = ['owner']
handler.command = /^(reiniciar|restart|rb)$/i
handler.owner = true // Solo tu numero de owner en config.js

export default handler