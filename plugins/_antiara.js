let handler = async (m, { text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de la cancion>\n📍 *Ejemplo:* ${usedPrefix + command} Feel Special`);
  }

  await m.react("🎵");

  try {
    // API Delirius sí jala 2026
    const url = `https://api.delirius.store/search/lyrics?query=${encodeURIComponent(text.trim())}`;
    const res = await fetch(url, { timeout: 15000 }); // Be ya tiene fetch global
    const json = await res.json();

    if (!json.status ||!json.data ||!json.data.lyrics) {
      return m.reply("❌ No se encontró la letra de esa canción.");
    }

    const { title, artists, album, lyrics } = json.data;

    // FIX: Cortar letra si es muy larga, WA tiene límite 4096 chars
    let cap = `🎶 *${title}* — *${artists}*\n💿 *Álbum:* ${album || 'N/A'}\n\n📝 *Letra:*\n`;
    let fullText = cap + lyrics;
    if (fullText.length > 4000) {
      fullText = fullText.slice(0, 4000) + `\n\n..._Letra recortada por limite de WhatsApp_`;
    }

    await m.reply(fullText);
    await m.react("✅");
  } catch (error) {
    console.error("❌ Error Letra:", error.message);
    m.reply("⚠️ *Ocurrió un error al obtener la letra. La API cayó o no existe.*");
  }
};

handler.help = ["letra <nombre>", "lyrics <nombre>"];
handler.tags = ["musica"];
handler.command = ["letra", "lyrics"];
handler.register = false;
handler.limit = true; // pa que no spameen la api
module.exports = handler; // <- FIX CLAVE