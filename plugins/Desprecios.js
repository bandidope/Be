import fs from 'fs'

const MARCA = 'For Three Bot 🌀'
const DB_PATH = './database/precios.json'
const IMG_DEFAULT = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'
const OWNER_NUM = '51936994155' // TU NUMERO

// TUS DATOS DE PAGO
const CTA_YAPE = '+51 936 994 155' 
const NOMBRE = 'Cristhofer Yhair Rojas Huarcaya'
const CODIGO_PREX = '12249975' 

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

    // 3. PRECIOS
    if (['precios', 'price', 'precio', 'lista'].includes(command)) {
        if (!fs.existsSync(DB_PATH)) return m.reply(`❗ *Aún no hay precios*\n${MARCA}`)
        try {
            const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
            const buttons = [
                { buttonId: '.precios_ver', buttonText: { displayText: '📦 Ver Precios' }, type: 1 },
                { buttonId: '.owner', buttonText: { displayText: '💬 Contactar' }, type: 1 },
                { buttonId: '.help', buttonText: { displayText: '❓ Soporte' }, type: 1 }
            ]
            await conn.sendMessage(m.chat, { image: { url: data.imagen }, caption: `*🤖 FOR THREE BOT*\n\n_Toca un botón_\n${MARCA}`, footer: `Actualizado: ${data.fecha}`, buttons, headerType: 4 }, { quoted: m })
        } catch (e) { m.reply(`⚠️ *Usa:* ${usedPrefix}precios_ver\n${MARCA}`) }
    }

    // 4. VER PRECIOS
    if (command === 'precios_ver') {
        if (!fs.existsSync(DB_PATH)) return m.reply(`❗ *No hay precios*\n${MARCA}`)
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
        await conn.sendMessage(m.chat, { image: { url: data.imagen }, caption: `*📦 LISTA DE PRECIOS*\n\n${data.texto}\n\n_Actualizado: ${data.fecha}_\n${MARCA}` }, { quoted: m })
    }

    // 5. OWNER
    if (command === 'owner') {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Owner For Three Bot\nTEL;type=CELL;type=VOICE;waid=${OWNER_NUM}:${OWNER_NUM}\nEND:VCARD`
        await conn.sendMessage(m.chat, { contacts: { displayName: 'Owner For Three Bot', contacts: [{ vcard }] }, caption: `*💬 CONTACTO DIRECTO*\n${MARCA}` }, { quoted: m })
    }

    // 6. HELP CON BOTONES
    if (command === 'help') {
        const buttons = [
            { buttonId: '.menu', buttonText: { displayText: '📜 .menu' }, type: 1 },
            { buttonId: '.precios', buttonText: { displayText: '📦 .precios' }, type: 1 },
            { buttonId: '.pago', buttonText: { displayText: '💳 Pago' }, type: 1 }
        ]
        await conn.sendMessage(m.chat, { text: `*❓ CENTRO DE SOPORTE ${MARCA}*\n\n_Toca lo que necesitas:_`, footer: MARCA, buttons, headerType: 1 }, { quoted: m })
    }
    
    // 7. METODO DE PAGO - SOLO 2 BOTONES
    if (command === 'pago') {
        const buttons = [
            { buttonId: '.yape', buttonText: { displayText: '💜 Yape' }, type: 1 },
            { buttonId: '.prex', buttonText: { displayText: '🟢 Prex' }, type: 1 }
        ]
        await conn.sendMessage(m.chat, { text: `*💳 MÉTODOS DE PAGO ${MARCA}*\n\n_Elige tu método preferido_`, footer: 'Seguro y rápido', buttons, headerType: 1 }, { quoted: m })
    }
    
    // 8. YAPE SOLO TEXTO
    if (command === 'yape') {
        await conn.sendMessage(m.chat, { text: `*💜 YAPE*\nNombre: ${NOMBRE}\nN°: ${CTA_YAPE}\n\n> Transfiere y manda comprobante al .owner\n${MARCA}` }, { quoted: m })
    }

    // 9. PREX
    if (command === 'prex') {
        await conn.sendMessage(m.chat, { text: `*🟢 PREX*\n\nCódigo: \`\`${CODIGO_PREX}\`\nNombre: ${NOMBRE}\n> Copia el código y paga. Manda captura al .owner\n${MARCA}` }, { quoted: m })
    }
}

handler.command = ['setprecios', 'setprice', 'setprecio', 'delprecios', 'borrarprecios', 'precios', 'price', 'precio', 'lista', 'precios_ver', 'owner', 'help', 'pago', 'yape', 'prex']
handler.help = ['setprecios', 'delprecios', 'precios']
handler.tags = ['info']
export default handler