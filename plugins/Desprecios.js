const MARCA = 'For Three Bot 🌀'
const OWNER_NUM = '51936994155'
const IMG_LOGO = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png' // <- FOTO GITHUB

// DATOS FIJOS
const CTA_YAPE = '+51 936 994 155' 
const NOMBRE = 'Cristhofer Yhair Rojas Huarcaya'
const CODIGO_PREX = '12249975' 
const LINK_GRUPO = 'https://chat.whatsapp.com/LjPhgjqCM934QEzYz3vrVk'

// TEXTO FIJO - YA EDITADO Y BONITO
const TEXTO_PRECIO = `︵᷼ ⿻ *For Three* ࣪ ࣭ ࣪ *Wa Bot* ࣭ 🌀 ࣪

✿ *Hᴏʟᴀ* 👋, ¿Quieres Saber Los Precios? ¿O Quieres Revender El Bot? 🥴

𓈒𓏸❀ *PRECIOS FOR THREE BOT* 🇵🇪

𓈒𓏸🌴 *GRUPO PERMANENTE:*
│ ◦ 🌀 Grupo X1 = 5 Soles
│ ◦ 🌀 Grupo X3 = 10 Soles
│ ◦ 🌀 Grupo X5 = 15 Soles

𓈒𓏸🌵 *BOT PERSONALIZADO:*
│ ◦ 🌀 Bot Personalizado ( Termux ) = 18 Soles
│ ◦ 🌀 Servidor Mensual : 10 Soles
│ ◦ 🌀 Archivos Premium Bot = 35 Soles
│ ◦ 🌀 Bot + Servidor = 25 Soles

> ꒰꛱ ͜ *Nota:* Al revender ganarás el 40% de lo que vendas. Menos el producto *Servidor*

> 😸 Creador: Whois Yallico +51 936 994 155

${LINK_GRUPO}`

let handler = async (m, { conn, command }) => {
    
    // 1. PRECIO PUBLICO CON IMAGEN
    if (['precio', 'precios', 'price', 'lista'].includes(command)) {
        const buttons = [
            { buttonId: '.yape', buttonText: { displayText: '💜 Pagar Yape' }, type: 1 },
            { buttonId: '.prex', buttonText: { displayText: '🟢 Pagar Prex' }, type: 1 }
        ]
        await conn.sendMessage(m.chat, { 
            image: { url: IMG_LOGO }, // <- AQUI VA LA FOTO
            caption: TEXTO_PRECIO, 
            footer: MARCA, 
            buttons, 
            headerType: 4 // <- 4 = imagen con botones
        }, { quoted: m })
    }

    // 2. YAPE FIJO
    if (command === 'yape') {
        await conn.sendMessage(m.chat, { text: `*💜 YAPE*\nNombre: ${NOMBRE}\nN°: ${CTA_YAPE}\n\n> Transfiere y manda comprobante al .owner\n${MARCA}` }, { quoted: m })
    }

    // 3. PREX FIJO
    if (command === 'prex') {
        await conn.sendMessage(m.chat, { text: `*🟢 PREX*\n\nCódigo: \`\`${CODIGO_PREX}\`\nNombre: ${NOMBRE}\n> Copia el código y paga. Manda captura al .owner\n${MARCA}` }, { quoted: m })
    }

    // 4. OWNER
    if (command === 'owner') {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Owner For Three Bot\nTEL;type=CELL;type=VOICE;waid=${OWNER_NUM}:${OWNER_NUM}\nEND:VCARD`
        await conn.sendMessage(m.chat, { contacts: { displayName: 'Owner For Three Bot', contacts: [{ vcard }] }, caption: `*💬 CONTACTO DIRECTO*\n${MARCA}` }, { quoted: m })
    }
}

handler.command = ['precio', 'precios', 'price', 'lista', 'yape', 'prex', 'owner']
handler.help = ['precio']
handler.tags = ['info']
export default handler