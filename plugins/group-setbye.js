import { createHash } from 'crypto';  
import fetch from 'node-fetch';

/**
 * Este manejador de comandos permite a los administradores del grupo
 * establecer y borrar un mensaje de despedida personalizado.
 */
const handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
    // Si no es un grupo, o el usuario no es admin/dueño, no hagas nada.
    if (!m.isGroup || (!isAdmin && !isOwner)) {
        return m.reply('❌ ¡Solo los administradores o el dueño pueden usar estos comandos!');
    }

    // Asegurarse de que el chat tenga una entrada en la base de datos
    let chat = global.db.data.chats[m.chat] || {};
    if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = chat;
    }

    if (command === 'setbye') {
        if (!text) {
            return m.reply('❌ Por favor, proporciona un mensaje de despedida. Puedes usar los siguientes placeholders:\n`@user`, `@group`, `@count`');
        }

        // Guarda el mensaje personalizado en la base de datos del chat
        chat.customBye = text.trim();
        
        // [BOTÓN NUEVO] Para quitar la editada al toque
        let buttons = [
            {buttonId: '.delbye', buttonText: {displayText: '🗑️ Quitar editada'}, type: 1}
        ];
        
        await conn.sendButtonMessage(m.chat, {
            text: `✅ *El mensaje de despedida personalizado ha sido establecido con éxito.*\n\n\`\`${text.trim()}\`\``,
            footer: 'Toca el botón de abajo para volver al mensaje por defecto',
            buttons: buttons,
            headerType: 1
        }, { quoted: m });

    } else if (command === 'delbye') {
        if (!chat.customBye) return m.reply('⚠️ No tienes una despedida editada para quitar.');
        
        // Borra el mensaje personalizado
        delete chat.customBye; // [MEJOR QUE NULL]
        m.reply('✅ *Listo*\n\nEl mensaje de despedida personalizado ha sido eliminado.\nAhora se usará el mensaje predeterminado de tu `welcome.js`.');
    }
};

handler.help = ['setbye <mensaje>', 'delbye'];
handler.tags = ['group', 'config'];
handler.command = ['setbye', 'delbye'];
handler.owner = false;
handler.admin = true;

export default handler;