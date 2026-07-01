const os = require('os');
const { execSync } = require('child_process');

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' + sizes[i];
};

let handler = async (m, { conn }) => {
    // Anti-crash: Si algo falla, el bot no se cae
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freem();
        const usedMem = totalMem - freeMem;
        const uptime = process.uptime() * 1000;
        const h = Math.floor(uptime / 3600000);
        const min = Math.floor(uptime / 60000) % 60;
        const sec = Math.floor(uptime / 1000) % 60;

        // FIX: df compatible con Termux + VPS + Linux
        let disk = 'N/A';
        try {
            const df = execSync('df -h / | tail -1').toString().trim().split(/\s+/);
            disk = `${df[1]} | Usado: ${df[2]} | ${df[4]}`;
        } catch {}

        const txt = `*✅ ESTADO DEL SISTEMA*

*🚩 Host:* ${os.hostname()}
*🏆 OS:* ${os.platform()} ${os.arch()}
*🕒 Uptime:* ${h}h ${min}m ${sec}s

*💾 RAM Servidor:*
> Total: ${formatBytes(totalMem)}
> Libre: ${formatBytes(freeMem)}
> Usada: ${formatBytes(usedMem)}

*🪴 RAM NodeJS:*
> Heap: ${formatBytes(process.memoryUsage().heapUsed)} / ${formatBytes(process.memoryUsage().heapTotal)}

*☁️ Disco:* ${disk}`;

        await m.reply(txt);

    } catch (e) {
        await m.reply('❌ Error al obtener datos: ' + e.message);
    }
};

handler.command = ['sistema', 'system', 'status', 'ping'];
handler.tags = ['info'];
handler.help = ['sistema'];
handler.register = false; // CLAVE PA BE
handler.limit = false;

module.exports = handler;