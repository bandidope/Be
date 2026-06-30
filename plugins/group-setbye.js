const handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
    if (!m.isGroup || (!isAdmin &&!isOwner)) {
        return m.reply('❌ ¡Solo los administradores o el dueño pueden usar estos comandos!');
    }

    let chat = global.db.data.chats[m.chat] || {};
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = chat;

    if (command === 'setbye') {
        if (!text) return m.reply('❌ Por favor, proporciona un mensaje. Placeholders: `@user`, `@group`, `@count`, `@desc`');
        chat.customBye = text.trim();

        await conn.sendMessage(m.chat, {
          text: `✅ *Despedida personalizada establecida*\n\n\`\`${text.trim()}\`\``,
          footer: 'Toca el botón para volver al mensaje por defecto',
          buttons: [{buttonId: '.delbye', buttonText: {displayText: '🗑️ Quitar editada'}, type: 1}],
          headerType: 1
        }, { quoted: m });

    } else if (command === 'delbye') {
        if (!chat.customBye) return m.reply('⚠️ No tienes una despedida editada.');
        delete chat.customBye;
        m.reply('✅ *Listo*\n\nSe eliminó la despedida personalizada. Ahora se usa la de `welcome.js`.');
    }
};
handler.help = ['setbye <mensaje>', 'delbye'];
handler.tags = ['group', 'config'];
handler.command = ['setbye', 'delbye'];
handler.admin = true;
export default handler;