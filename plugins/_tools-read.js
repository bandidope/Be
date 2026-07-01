// Código: Descargar ViewOnce | V4.5 2026
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    if (!m.quoted) throw '❌ Responde al ViewOnce que quieres robar.'
    
    let q = m.quoted
    if (!q.viewOnce && !q.vM?.viewOnce) throw '❌ Ese mensaje no es ViewOnce.'

    try {
        let msg = q.msg || q
        let mime = msg.mimetype || ''
        let buffer = await q.download()
        
        let type = 'document'
        let ext = 'bin'
        if (/image/.test(mime)) { type = 'image'; ext = 'jpg' }
        if (/video/.test(mime)) { type = 'video'; ext = 'mp4' }
        if (/audio/.test(mime)) { type = 'audio'; ext = 'mp3' }
        
        let caption = `*✅ ViewOnce Descargado*\n_Enviado por: @${m.sender.split('@')[0]}_`
        
        await conn.sendFile(m.chat, buffer, `viewonce.${ext}`, caption, m, { 
            mimetype: mime,
            ptt: type === 'audio' ? true : false 
        })

    } catch (e) {
        console.log(e)
        throw '❌ Falló. Posible razón: Ya viste el ViewOnce en tu cel principal o WA lo eliminó.'
    }
}

handler.help = ['rvo']
handler.tags = ['tools']
handler.command = ['readviewonce', 'readvo', 'rvo', 'veronce', 'ver']
handler.limit = false
handler.register = false

export default handler