import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definiciones de contexto (si existen en el entorno global)
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})

    // Obtener la consulta desde el texto o el mensaje citado
    const query = text || (m.quoted && m.quoted.text);

    if (!query) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❓', // Nuevo emoji para indicar falta de pregunta
                key: m.key
            }
        });
        // Mensaje de advertencia actualizado
        return conn.reply(m.chat, `🤖 **¡Hola! Por favor, hazme una pregunta.**\n\nEjemplo: ${usedPrefix}${command} ¿Qué es la inteligencia artificial?`, m, ctxWarn);
    }

    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '✨', // Emoji para indicar que está procesando
                key: m.key
            }
        });

        // --- ATENCIÓN: La URL y la configuración interna siguen apuntando a Venice/otro servicio ---
        // Si bien hemos cambiado los textos, la llamada real a la API debe ser ajustada si quieres usar la API real de Gemini.
        // MANTENGO LA ESTRUCTURA ORIGINAL DE LA LLAMADA AXIOS, SOLO CAMBIANDO LOS NOMBRES EN EL TEXTO DEL BOT.

        const { data } = await axios.request({
            method: "POST",
            url: "https://outerface.venice.ai/api/inference/chat", // URL original (NO ES GEMINI)
            headers: {
                accept: "*/*",
                "content-type": "application/json",
                origin: "https://venice.ai",
                referer: "https://venice.ai/",
                "user-agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
                "x-venice-version": "interface@20250523.214528+393d253",
            },
            data: JSON.stringify({
                requestId: "mifinfinity",
                modelId: "dolphin-3.0-mistral-24b",
                prompt: [{ content: query, role: "user" }],
                systemPrompt: "",
                conversationType: "text",
                temperature: 0.8,
                webEnabled: true,
                topP: 0.9,
                isCharacter: false,
                clientProcessingTime: 15,
            }),
        });

        const chunks = data
            .split("\n")
            .filter((chunk) => chunk.trim() !== "")
            .map((chunk) => JSON.parse(chunk));

        const result = chunks.map((chunk) => chunk.content).join("");

        if (!result) {
            // Error personalizado para el no resultado, mencionando Gémini
            throw new Error("Gémini no pudo generar una respuesta clara.");
        }

        // Respuesta final, mostrando "Gémini AI"
        await conn.reply(m.chat, `✨ *Respuesta de Gémini AI:*\n\n${result}`, m, ctxOk);

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅', // Emoji de éxito
                key: m.key
            }
        });

    } catch (err) {
        console.error("Error Gémini:", err.message); // Consola ajustada

        await conn.sendMessage(m.chat, {
            react: {
                text: '💥', // Emoji de error
                key: m.key
            }
        });

        // Mensaje de error ajustado
        await conn.reply(m.chat, `⚠️ **¡Ups! Ha ocurrido un fallo en Gémini.**\n\nDetalles: *${err.message}*`, m, ctxErr);
    }
};

// Nombres de ayuda, etiquetas y comandos ajustados
handler.help = ['gemini'];
handler.tags = ['ia', 'gemini'];
handler.command = ['gemini', 'geminiai'];
handler.group = true;

export default handler;
