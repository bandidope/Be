const handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
    if (!m.isGroup || (!isAdmin &&!isOwner)) {
        return m.reply('❌ ¡Solo los administradores o el dueño pueden usar estos comandos!');
    }

    let chat = global.db.data.chats[m.chat] || {};
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = chat;

    if (command === 'setwelcome') {
        if (!text) return m.reply('❌ Por favor, proporciona un mensaje. Placeholders: `@user`, `@group`, `@count`, `@desc`');
        chat.customWelcome = text.trim();

        await conn.sendMessage(m.chat, {
          text: `✅ *Bienvenida personalizada establecida*\n\n\`\`${text.trim()}\`\``,
          footer: 'Toca el botón para volver al mensaje por defecto',
          buttons: [{buttonId: '.delwelcome', buttonText: {displayText: '🗑️ Quitar editada'}, type: 1}],
          headerType: 1
        }, { quoted: m });

    } else if (command === 'delwelcome') {
        if (!chat.customWelcome) return m.reply('⚠️ No tienes una bienvenida editada.');
        delete chat.customWelcome;
        m.reply('✅ *Listo*\n\nSe eliminó la bienvenida personalizada. Ahora se usa la de `welcome.js`.');
    }
};
handler.help = ['setwelcome <mensaje>', 'delwelcome'];
handler.tags = ['group', 'config'];
handler.command = ['setwelcome', 'delwelcome'];
handler.admin = true;
export default handler;