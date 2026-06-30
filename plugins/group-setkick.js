const handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
    if (!m.isGroup || (!isAdmin &&!isOwner)) {
        return m.reply('❌ ¡Solo los administradores o el dueño pueden usar estos comandos!');
    }

    let chat = global.db.data.chats[m.chat] || {};
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = chat;

    if (command === 'setkick') {
        if (!text) return m.reply('❌ Por favor, proporciona un mensaje. Placeholders: `@user`, `@group`, `@count`, `@desc`');
        chat.customKick = text.trim();

        await conn.sendMessage(m.chat, {
          text: `✅ *Kick personalizado establecido*\n\n\`\`${text.trim()}\`\``,
          footer: 'Toca el botón para volver al mensaje por defecto',
          buttons: [{buttonId: '.delkick', buttonText: {displayText: '🗑️ Quitar editada'}, type: 1}],
          headerType: 1
        }, { quoted: m });

    } else if (command === 'delkick') {
        if (!chat.customKick) return m.reply('⚠️ No tienes un kick editado.');
        delete chat.customKick;
        m.reply('✅ *Listo*\n\nSe eliminó el kick personalizado. Ahora se usa el de `welcome.js`.');
    }
};
handler.help = ['setkick <mensaje>', 'delkick'];
handler.tags = ['group', 'config'];
handler.command = ['setkick', 'delkick'];
handler.admin = true;
export default handler;