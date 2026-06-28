import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

const MARCA = 'For Three Bot 🌀'
const TEMP_DIR = './temp'
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

let handler = async (m, { conn, text, command, usedPrefix }) => {
  // 1. Verificar que ffmpeg exista
  try {
    await execAsync('ffmpeg -version')
  } catch {
    return m.reply(`❌ *ffmpeg no está instalado* \n> Instálalo con: pkg install ffmpeg\n${MARCA}`)
  }

  if (!m.quoted ||!/video|document/.test(m.quoted.mimetype || '')) {
    return m.reply(`❗ *Reply al video* que quieres convertir a HD\n${MARCA}`);
  }

  let [res, fpsText] = (text?.trim().toLowerCase() || '').split(/\s+/);
  let fps = 60;
  if (fpsText && fpsText.endsWith("fps")) {
    fps = parseInt(fpsText.replace("fps", ""));
    if (isNaN(fps) || fps < 30 || fps > 240) return m.reply(`❗ *FPS debe estar entre 30 y 240*\n${MARCA}`);
  }

  const resolutions = { "480": "480", "720": "720", "1080": "1080", "2k": "1440", "4k": "2160", "8k": "4320" };
  if (!resolutions[res]) return m.reply(`*Ejemplo:* ${usedPrefix + command} 720\n${MARCA}`);

  const height = resolutions[res];
  const uniqueId = `${m.sender.split("@")[0]}_${Date.now()}_${randomBytes(4).toString('hex')}`
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const inputFile = path.join(TEMP_DIR, `input_${uniqueId}.mp4`);
  const outputFile = path.join(TEMP_DIR, `hdvideo_${uniqueId}.mp4`);

  try {
    m.reply(`⏳ *Descargando video...*`);

    const type = m.quoted.mimetype.includes('document')? 'document' : 'video'
    const stream = await downloadContentFromMessage(m.quoted, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    if (buffer.length > MAX_SIZE) return m.reply(`❗ *Video muy pesado.* Máximo 100MB\n${MARCA}`);
    fs.writeFileSync(inputFile, buffer);

    m.reply(`⏳ *Renderizando a ${res.toUpperCase()} ${fps}FPS... Puede tardar 1-3 min*`);

    // Comando ffmpeg: upscale + fps + nitidez
    const cmd = `ffmpeg -y -i "${inputFile}" -vf "scale=-2:${height}:flags=lanczos,unsharp=5:5:1.0" -r ${fps} -c:v libx264 -preset veryfast -crf 18 -c:a copy "${outputFile}"`;

    await execAsync(cmd, { timeout: 300000 }); // 5 min timeout

    if (!fs.existsSync(outputFile)) throw new Error('ffmpeg no generó el archivo');

    const finalBuffer = fs.readFileSync(outputFile);
    await conn.sendMessage(m.chat, {
      video: finalBuffer,
      caption: `✅ *Video renderizado a ${res.toUpperCase()} ${fps}FPS*\n> HD Local sin API\n${MARCA}`
    }, { quoted: m });

  } catch (err) {
    console.error('HDVIDEO FFMPEG ERROR:', err.message);
    m.reply(`❌ *Error en ffmpeg:* ${err.message.includes('timeout')? 'Tardó demasiado' : 'Fallo el render'}\n${MARCA}`);
  } finally {
    try { if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile) } catch {}
    try { if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile) } catch {}
  }
};

handler.command = ["hdvideo"];
handler.tags = ["tools"];
handler.help = ["hdvideo <resolución> [fps]"];
handler.limit = true;
export default handler;