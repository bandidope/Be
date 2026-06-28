import axios from "axios";
import fs from "fs";
import FormData from "form-data";

let handler = async (m, { conn, text, command, usedPrefix}) => {
  if (!m.quoted ||!/video/.test(m.quoted.mimetype)) {
    return m.reply("❗Reply al video que quieres convertir a HD");
}

  let [res, fpsText] = text?.trim().toLowerCase().split(" ");
  let fps = 60;

  if (fpsText && fpsText.endsWith("fps")) {
    fps = parseInt(fpsText.replace("fps", ""));
    if (isNaN(fps) || fps < 30 || fps> 240) {
      return m.reply("❗ FPS debe estar entre 30 y 240 (ejemplo: 60fps)");
}
}

  const resolutions = {
    "480": "480",
    "720": "720",
    "1080": "1080",
    "2k": "1440",
    "4k": "2160",
    "8k": "4320"
};

  if (!resolutions[res]) {
    return m.reply(`Ejemplo de uso:\n${usedPrefix + command} 720\n${usedPrefix + command} 1080 60fps`);
}

  const targetHeight = resolutions[res];
  const id = m.sender.split("@")[0];
  const inputFile = `input_${id}.mp4`;
  const outputFile = `hdvideo_${id}.mp4`;

  m.reply(`⏳ Procesando video a ${res.toUpperCase()} ${fps}FPS...`);

  try {
    const buffer = await conn.downloadMediaMessage(m.quoted);
    fs.writeFileSync(inputFile, buffer);

    const form = new FormData();
    form.append("video", fs.createReadStream(inputFile));
    form.append("resolution", targetHeight);
    form.append("fps", fps);

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
    const filePath = `./temp/${outputFile}`;

    const response = await axios.post("http://api.drizznesiasite.biz.id:4167/hdvideo", form, {
      headers: form.getHeaders(),
      responseType: "stream",
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
});

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      const finalBuffer = fs.readFileSync(filePath);
      await conn.sendMessage(m.chat, {
        video: finalBuffer,
        caption: `✅ Video convertido a ${res.toUpperCase()} ${fps}FPS`
}, { quoted: m});

      fs.unlinkSync(inputFile);
      fs.unlinkSync(filePath);
});

    writer.on("error", () => m.reply("❌ Error al guardar el video procesado"));
} catch (err) {
    console.error(err);
    m.reply("❌ Error al procesar el video");
}
};

handler.command = ["hdvideo"];
handler.tags = ["tools"];
handler.help = ["hdvideo <resolución> [fps]"];
handler.limit = true;

export default handler;