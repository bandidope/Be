
/*
- 💙 Setbanner por WillZek>> https://github.com/WillZek
- 🪐 CDN SUNFLARE por WillZek y el equipo de SunFlare
- 📍 CDN RUSSELLXZ por Russel.xyz
*/

// Dejar créditos por si llego a poner la base pública.

import fs from 'fs';
import path from 'path';
import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob} from "formdata-node";
import { fileTypeFromBuffer} from "file-type";
import axios from "axios";

global.emoji = '🍮';
global.emoji2 = '🍮';

let handler = async (m, { conn, isRowner}) => {
  if (!m.quoted ||!/image/.test(m.quoted.mimetype)) {
    return m.reply(`${emoji} Por favor, responde a una imagen con el comando *setbanner* para actualizar la foto del menú.`);
}

  try {
    const media = await m.quoted.download();

    /*
    if (!isImageValid(media)) {
      return m.reply(`${emoji2} El archivo enviado no es una imagen válida.`);
}
    */

    const filetype = await fileTypeFromBuffer(media);
    if (!filetype ||!filetype.mime.startsWith('image/')) {
      return m.reply(`${emoji2} El archivo enviado no es una imagen válida.`);
}

    let url;
    try {
      const sunflare = await uploadToSunflare(media);
      url = sunflare.url;
} catch (e) {
      const russell = await uploadToRussellXZ(media);
      url = russell.url;
}

    let botData = global.db.data.settings[conn.user.jid] || {};
    botData.banner = url;
    global.db.data.settings[conn.user.jid] = botData;

    await conn.sendFile(m.chat, media, 'banner.jpg', `${emoji} Banner actualizado correctamente.`, m);

} catch (e) {
    m.reply(`🪐 Error: ${e.message}`);
}
};

const isImageValid = (buffer) => {
  const magicBytes = buffer.slice(0, 4).toString('hex');
  return ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', '89504e47', '47494638'].includes(magicBytes);
};

handler.help = ['setbanner'];
handler.tags = ['herramientas'];
handler.command = ['setbanner'];
handler.rowner = false;

export default handler;

async function uploadToSunflare(buffer) {
  const { ext, mime} = await fileTypeFromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream'};
  const blob = new Blob([buffer], { type: mime});
  const nombreAleatorio = crypto.randomBytes(5).toString('hex') + '.' + ext;

  let carpeta = 'files';
  if (mime.startsWith('image/')) carpeta = 'images';
  else if (mime.startsWith('video/')) carpeta = 'videos';

  const arrayBuffer = await blob.arrayBuffer();
  const contenidoBase64 = Buffer.from(arrayBuffer).toString('base64');

  const resp = await fetch('https://cdn-sunflareteam.vercel.app/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      folder: carpeta,
      filename: nombreAleatorio,
      base64Content: contenidoBase64
})
});

  const result = await resp.json();

  if (resp.ok && result?.url) {
    return { url: result.url, name: nombreAleatorio};
} else {
    throw new Error(result?.error || 'Error en cdn.sunflare');
}
}

async function uploadToRussellXZ(buffer) {
  const form = new FormData();
  form.set("file", new Blob([buffer], { type: 'image/jpeg'}), "imagen.jpg");

  const resp = await fetch("https://cdn.russellxz.click/upload.php", {
    method: "POST",
    body: form
});

  const result = await resp.json();

  if (resp.ok && result?.url) {
    return { url: result.url};
} else {
    throw new Error(result?.error || 'Error en cdn.russellxz');
}
}