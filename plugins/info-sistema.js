import os from 'os';
import { execSync } from 'child_process';

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' + sizes[i];
};

const getDiskSpace = () => {
    try {
        // FIX: Ahora agarra cualquier disco, no solo root/sda1
        const stdout = execSync('df -h --total | tail -n 1').toString();
        const [, size, used, available, usePercent ] = stdout.split(/\s+/);
        return { size, used, available, usePercent };
    } catch {
        return null; // Si falla, que no crashee
    }
};

const clockString = (ms) => {
    let h = isNaN(ms)? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

let handler = async (m, { conn }) => {
    const totalMem = os.totalmem();
    const freeMem = os.freem();
    const usedMem = totalMem - freeMem;
    const muptime = clockString(process.uptime() * 1000)
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const nodeUsage = process.memoryUsage();
    const diskSpace = getDiskSpace();

    let txt = `✅ *ESTADO DEL SISTEMA*

🚩 *Host:* ${hostname}
🏆 *Plataforma:* ${platform} ${arch}
🕒 *Uptime:* ${muptime}

💾 *RAM Servidor:*
→ Total: ${formatBytes(totalMem)}
→ Libre: ${formatBytes(freeMem)}
→ Usada: ${formatBytes(usedMem)}

🪴 *RAM NodeJS:*
→ Heap Usado: ${formatBytes(nodeUsage.heapUsed)} / ${formatBytes(nodeUsage.heapTotal)}
→ RSS: ${formatBytes(nodeUsage.rss)}`

    if (diskSpace) {
        txt += `

☁️ *Disco:*
→ Total: ${diskSpace.size} | Usado: ${diskSpace.used} | ${diskSpace.usePercent}`
    }

    await conn.reply(m.chat, txt, m) // <- FIX: Quité rcanal
};

handler.help = ['sistema'];
handler.tags = ['info'];
handler.command = ['system', 'sistema', 'ping', 'status'];
handler.register = false // <- FIX: Pa que no lo bloquee Be
handler.limit = false

export default handler