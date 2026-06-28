import fs from 'fs'

const MARCA = 'For Three Bot 🌀'
const DB_PATH = './database/precios.json'
const IMG_DEFAULT = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'
const OWNER_NUM = '51936994155' // <-- TU NUMERO

let handler = async (m, { conn, command, text, isOwner, isAdmin, usedPrefix }) => {
    
    // 1. SETPRECIOS
    if (['setprecios', 'setprice', 'setprecio'].includes(command)) {
        if (!isOwner && !isAdmin) return m.reply(`❌ *Solo Admins/Owners*\n${MARCA}`)
        if (!text) return m.reply(`❗ *Formato:*\n${usedPrefix}setprecios <texto> | <link imagen>`)

        if (!fs.existsSync('./database')) fs.mkdirSync('./database')
        const [texto, img] = text.split('|').map(v => v.trim())
        const data = { texto: texto.trim(), imagen: img || IMG_DEFAULT, fecha: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }) }
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
        return m.reply(`✅ *Precios actualizados*\n${MARCA}`)
    }

    // 2. DELPRECIOS
    if (['delprecios', 'borrarprecios'].includes(command)) {
        if (!isOwner && !isAdmin) return m.reply(`❌ *Solo Admins/Owners*\n${MARCA}`)
        if (!fs.existsSync(DB_PATH)) return m.reply(`❗ *No hay lista para borrar*\n${MARCA}`)
        fs.unlinkSync(DB_PATH)
        return m.reply(`🗑️ *Lista eliminada*\n${MARCA}`)
    }

    // 3. PRECIOS CON BOTONES
    if (['precios', 'price', 'precio', 'lista'].includes(command)) {
        if (!fs.existsSync(DB_PATH)) {
            return m.reply(`❗ *Aún no hay precios* \n> Un admin debe usar ${usedPrefix}setprecios\n${MARCA}`)
        }
        try {
            const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
            const buttons = [
                { buttonId: '.precios_ver', buttonText: { displayText: '📦 Ver Precios' }, type: 1 },
                { buttonId: '.owner', buttonText: { displayText: '💬 Contactar' }, type: 1 },
                { buttonId: '.help', buttonText: { displayText: '❓ Soporte' }, type: 1 }
            ]
            await conn.sendMessage(m.chat, {
                image: { url: data.imagen },
                caption: `*🤖 FOR THREE BOT*\n\n_Toca un botón para continuar_\n${MARCA}`,
                footer: `Actualizado: ${data.fecha}`,
                buttons: buttons, headerType: 4
            }, { quoted: m })
        } catch (e) {
            m.reply(`⚠️ *Tu WhatsApp no soporta botones. Usa:* ${usedPrefix}precios_ver\n${MARCA}`)
        }
    }

    // 4. VER PRECIOS
    if (command === 'precios_ver') {
        if (!fs.existsSync(DB_PATH)) return m.reply(`❗ *No hay precios*\n${MARCA}`)
        try {
            const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
            const caption = `*📦 LISTA DE PRECIOS*\n\n${data.texto}\n\n_Actualizado: ${data.fecha}_\n${MARCA}`
            await conn.sendMessage(m.chat, { image: { url: data.imagen }, caption }, { quoted: m })
        } catch (e) {
            m.reply(`❌ *Error cargando imagen*\n${MARCA}`)
        }
    }

    // 5. CONTACTAR - BOTON
    if (command === 'owner') {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Owner For Three Bot\nTEL;type=CELL;type=VOICE;waid=${OWNER_NUM}:${OWNER_NUM}\nEND:VCARD`
        await conn.sendMessage(m.chat, { 
            contacts: { displayName: 'Owner For Three Bot', contacts: [{ vcard }] },
            caption: `*💬 CONTACTO DIRECTO*\nEscríbeme para comprar o consultas\n${MARCA}`
        }, { quoted: m })
    }

    // 6. SOPORTE - BOTON 
    if (command === 'help') {
        const helpText = `*❓ CENTRO DE SOPORTE ${MARCA}*\n
*Comandos:*
> ${usedPrefix}precios - Ver catálogo
> ${usedPrefix}menu - Ver todos los comandos
> ${usedPrefix}owner - Hablar con el Owner

¿Duda? Toca Contactar 👆`
        m.reply(helpText)
    }
}

handler.command = ['setprecios', 'setprice', 'setprecio', 'delprecios', 'borrarprecios', 'precios', 'price', 'precio', 'lista', 'precios_ver', 'owner', 'help']
handler.help = ['setprecios <texto> | <img>', 'delprecios', 'precios']
handler.tags = ['info']
export default handler