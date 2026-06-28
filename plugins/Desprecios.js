import fs from 'fs'

const MARCA = 'For Three Bot 🌀'
const DB_PATH = './database/precios.json'
const IMG_DEFAULT = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'

let handler = async (m, { conn, command, text, isOwner, isAdmin, usedPrefix }) => {
    
    // COMANDO 1: .setprecios - Solo Admin/Owner
    if (command === 'setprecios' || command === 'setprice' || command === 'setprecio') {
        if (!isOwner && !isAdmin) return m.reply(`❌ *Solo Admins/Owners*\n${MARCA}`)

        if (!text) return m.reply(`❗ *Mete el texto de ventas* \n\n*Formato:*\n${usedPrefix}setprecios <texto> | <link imagen>`)

        if (!fs.existsSync('./database')) fs.mkdirSync('./database')

        const [texto, img] = text.split('|').map(v => v.trim())
        const data = {
            texto: texto.trim(),
            imagen: img || IMG_DEFAULT,
            setBy: m.sender,
            fecha: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
        }

        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
        return m.reply(`✅ *Precios + Banner actualizados*\n> Banner: ${img ? 'Personalizado' : 'Logo Default'}\n${MARCA}`)
    }

    // COMANDO 2: .delprecios - Solo Admin/Owner
    if (command === 'delprecios' || command === 'borrarprecios') {
        if (!isOwner && !isAdmin) return m.reply(`❌ *Solo Admins/Owners*\n${MARCA}`)
        
        if (!fs.existsSync(DB_PATH)) return m.reply(`❗ *No hay lista de precios para borrar*\n${MARCA}`)

        fs.unlinkSync(DB_PATH)
        return m.reply(`🗑️ *Lista de precios eliminada correctamente*\n> Ahora .precios no mostrará nada hasta que uses .setprecios\n${MARCA}`)
    }

    // COMANDO 3: .precios - Público
    if (command === 'precios' || command === 'price' || command === 'precio' || command === 'lista') {
        if (!fs.existsSync(DB_PATH)) {
            return m.reply(`❗ *Aún no hay precios configurados* \n> Un admin debe usar ${usedPrefix}setprecios\n${MARCA}`)
        }

        try {
            const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
            const caption = `*📦 LISTA DE PRECIOS*\n\n${data.texto}\n\n_Actualizado: ${data.fecha}_\n${MARCA}`
            
            await conn.sendMessage(m.chat, { 
                image: { url: data.imagen }, 
                caption: caption 
            }, { quoted: m })

        } catch (e) {
            m.reply(`❌ *Error cargando la imagen*\n${MARCA}`)
        }
    }
}

handler.command = ['setprecios', 'setprice', 'setprecio', 'delprecios', 'borrarprecios', 'precios', 'price', 'precio', 'lista']
handler.help = ['setprecios <texto> | <img>', 'delprecios', 'precios']
handler.tags = ['info']
export default handler