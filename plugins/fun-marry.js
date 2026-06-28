import fs from 'fs';
import path from 'path';

const marryFile = path.resolve('storage/databases/marry.json');
let marriages = loadMarry();
let proposals = {}; // { proposee: {proposer, timeout} }

function loadMarry() {
    try {
        return fs.existsSync(marryFile)? JSON.parse(fs.readFileSync(marryFile, 'utf8')) : {};
    } catch { return {} }
}

function saveMarry() {
    fs.writeFileSync(marryFile, JSON.stringify(marriages, null, 2));
}

const handler = async (m, { conn, command, usedPrefix }) => {
    const isMarry = /^marry$/i.test(command);
    const isDivorce = /^divorce$/i.test(command);
    const sender = m.sender;
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    const isMarried = (user) => marriages[user]!== undefined;

    try {
        if (isMarry) {
            if (!target) {
                if (isMarried(sender)) {
                    return await conn.reply(m.chat, `《✧》 Ya estás casado con *@${marriages[sender].split('@')[0]}*\n> Divórciate con: *${usedPrefix}divorce*`, m, { mentions: [marriages[sender]] });
                }
                throw new Error(`Debes mencionar a alguien.\n> Ejemplo » *${usedPrefix}marry @usuario*`);
            }
            if (sender === target) throw new Error('《✧》 No puedes casarte contigo mismo 😅');
            if (isMarried(sender)) throw new Error(`《✧》 Ya estás casado con *@${marriages[sender].split('@')[0]}*`, [marriages[sender]]);
            if (isMarried(target)) throw new Error(`《✧》 *@${target.split('@')[0]}* ya está casado con *@${marriages[target].split('@')[0]}*`, [target, marriages[target]]);
            if (proposals[target]) throw new Error(`《✧》 *@${target.split('@')[0]}* ya tiene una propuesta pendiente.`, [target]);

            proposals[target] = {
                proposer: sender,
                timeout: setTimeout(() => {
                    if (proposals[target]) {
                        conn.reply(m.chat, `*《✧》Se acabó el tiempo. @${sender.split('@')[0]} tu propuesta fue cancelada.*`, null, { mentions: [sender] });
                        delete proposals[target];
                    }
                }, 300000) // 5 MINUTOS AQUI 👈 300000ms
            };

            await conn.reply(m.chat, `♡ *@${sender.split('@')[0]}* te ha propuesto matrimonio. @${target.split('@')[0]} ¿aceptas? •(=^●ω●^=)•

*Responde en 5 minutos con:*
> *Si* » Aceptar
> *No* » Rechazar`, m, { mentions: [sender, target] });

        } else if (isDivorce) {
            if (!isMarried(sender)) throw new Error('《✧》 No estás casado con nadie.');
            const partner = marriages[sender];
            delete marriages[sender];
            delete marriages[partner];
            saveMarry();
            await conn.reply(m.chat, `✐ *@${sender.split('@')[0]}* y *@${partner.split('@')[0]}* se han divorciado 💔`, m, { mentions: [sender, partner] });
        }
    } catch (e) {
        await conn.reply(m.chat, `《✧》 ${e.message}`, m);
    }
}

handler.before = async (m, { conn }) => {
    if (m.isBaileys ||!m.text) return;
    const proposee = m.sender;
    if (!proposals[proposee]) return;

    const { proposer, timeout } = proposals[proposee];
    const txt = m.text.trim().toLowerCase();

    if (txt === 'no') {
        clearTimeout(timeout);
        delete proposals[proposee];
        return conn.reply(m.chat, `*《✧》 @${proposee.split('@')[0]} rechazó la propuesta de @${proposer.split('@')[0]} 💔`, m, { mentions: [proposee, proposer] });
    }

    if (txt === 'si') {
        if (marriages[proposer] || marriages[proposee]) {
            clearTimeout(timeout);
            delete proposals[proposee];
            return conn.reply(m.chat, `《✧》 Uno de los dos ya se casó con otra persona mientras esperaban.`, m);
        }

        clearTimeout(timeout);
        delete proposals[proposee];

        marriages[proposer] = proposee;
        marriages[proposee] = proposer;
        saveMarry();

        return conn.reply(m.chat, `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩
¡SE HAN CASADO! ฅ^•ﻌ•^ฅ*:･ﾟ✧

*•.¸♡ Esposo:* @${proposer.split('@')[0]}
*•.¸♡ Esposa:* @${proposee.split('@')[0]}

\`Disfruten su luna de miel\`
✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`, m, { mentions: [proposer, proposee] });
    }
};

handler.help = ['marry @tag', 'divorce'];
handler.tags = ['fun'];
handler.command = /^(marry|divorce|casar|divorciar)$/i;
handler.group = true;

export default handler;