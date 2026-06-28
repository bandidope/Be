import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { randomBytes } from "crypto";

const MARCA = 'For Three Bot 🌀'
const TEMP_DIR = './temp'
const MAX_SIZE = 100 * 1024 * 1024 // 100MB max

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!m.quoted ||!/video|document/.test(m.quoted.mimetype || '')) {
    return m.reply(`❗ *Reply al video* que quieres convertir a HD\n${MARCA}`);
  }

  // Evitar crash si text es undefined
  let [res, fpsText] = (text?.trim().toLowerCase() || '').split(/\s+/);
  let fps = 60;

  if (fpsText && fpsText.endsWith("fps")) {
    fps = parseInt(fpsText.replace("fps", ""));
    if (isNaN(fps) || fps < 30 || fps > 240) {
      return m.reply(`❗ *FPS debe estar entre 30 y 240* (ej: 60fps)\n${MARCA}`);
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
    return m.reply(`*Ejemplo de uso:*\n${usedPrefix + command} 720\n${usedPrefix + command} 1080 60fps\n${MARCA}`);
  }

  const targetHeight = resolutions[res];

  // ID único para evitar que se pisen archivos si 2 usan el comando a la vez
  const uniqueId = `${m.sender.split("@")[0]}_${Date.now()}_${randomBytes(4).toString('hex')}`
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const inputFile = path.join(TEMP_DIR, `input_${uniqueId}.mp4`);
  const outputFile = path.join(TEMP_DIR, `hdvideo_${uniqueId}.mp4`);

  let buffer;
  try {
    m.reply(`⏳ *Descargando video...*`);

    buffer = await conn.downloadMediaMessage(m.quoted);
    if (buffer.length > MAX_SIZE) {
      return m.reply(`❗ *Video muy pesado.* Máximo 100MB\n${MARCA}`);
    }
    fs.writeFileSync(inputFile, buffer);

    m.reply(`⏳ *Procesando a ${res.toUpperCase()} ${fps}FPS... Esto puede tardar*`);

    const form = new FormData();
    form.append("video", fs.createReadStream(inputFile));
    form.append("resolution", targetHeight);
    form.append("fps", fps);

    const response = await axios.post("http://api.drizznesiasite.biz.id:4167/hdvideo", form, {
      headers: form.getHeaders(),
      responseType: "stream",
      timeout: 300000, // 5 min max
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: s => s >= 200 && s < 300 // Solo acepta 2xx
    });

    const writer = fs.createWriteStream(outputFile);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const finalBuffer = fs.readFileSync(outputFile);
    await conn.sendMessage(m.chat, {
      video: finalBuffer,
      caption: `✅ *Video convertido a ${res.toUpperCase()} ${fps}FPS*\n${MARCA}`
    }, { quoted: m });

  } catch (err) {
    console.error('HDVIDEO ERROR:', err.message);
    m.reply(`❌ *Error al procesar el video:* ${err.response?.status || err.message}\n${MARCA}`);
  } finally {
    // Siempre limpia, falle o no
    try { if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile) } catch {}
    try { if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile) } catch {}
  }
};

handler.command = ["hdvideo"];
handler.tags = ["tools"];
handler.help = ["hdvideo <resolución> [fps]"];
handler.limit = true;

export default handler;