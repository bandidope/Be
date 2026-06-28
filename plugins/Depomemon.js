import fetch from 'node-fetch'

const timeout = 30000
const reward = 1000
const maxIntentos = 2
const sessions = new Map()
const EVOGb_KEY = 'evogb-KnbSAgv7' // [TU KEY YA PUESTA]

const isImageBuffer = (buf) => {
  if (!buf || buf.length < 100) return false
  const jpg = buf[0] === 0xFF && buf[1] === 0xD8
  const png = buf[0] === 0x89 && buf[1] === 0x50
  return jpg || png
}

const createBlackBox = async () => {
  const res = await fetch('https://placehold.co/512x512/000/000.png')
  return await res.buffer()
}

const getSilhouette = async (name, img) => {
  const apis = [
    // 1. EVOGb CON KEY - Prioridad 1
    () => fetch(`https://api.evogb.org/api/poke/silhouette?pokemon=${name}`, {
      headers: { 'apikey': EVOGb_KEY }
    }),
    // 2. ALYACORE - Backup 1
    () => fetch(`https://api.alyacore.xyz/api/poke/silhouette?pokemon=${name}`),
    // 3. DORRATZ - Backup 2
    () => fetch(`https://api.dorratz.com/pokesilhouette?url=${encodeURIComponent(img)}`),
    // 4. POPCAT - Backup 3
    () => fetch(`https://api.popcat.xyz/v2/pokemon?pokemon=${name}`).then(r => r.json()).then(j => fetch(j.image)),
  ]

  for (let i = 0; i < apis.length; i++) {
    try {
      const res = await apis[i]()
      if (!res.ok) throw new Error(`Status: ${res.status}`)
      const buffer = await res.buffer()
      if (isImageBuffer(buffer)) {
        console.log(`Silueta OK con API ${i+1}`)
        return buffer
      }
    } catch (e) {
      console.log(`API ${i+1} falló: ${e.message}`)
    }
  }
  throw new Error('Todas fallaron')
}

let handler = async (m, { conn, command }) => {
  let id = m.chat
  let user = global.db.data.users[m.sender]

  if (command === 'pokedex') {
    if (sessions.has(id)) return m.reply('⚠️ Ya hay un Pokémon en juego. Responde o usa.psalir')

    await conn.sendMessage(m.chat, { react: { text: '🎮', key: m.key } })

    let pokeId = Math.floor(Math.random() * 898) + 1
    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`)
    if (!res.ok) return m.reply('⚠️ Error PokéAPI')
    let json = await res.json()

    let name = json.name
    let img = json.sprites.other['official-artwork'].front_default
    let type = json.types.map(t => t.type.name).join(', ').toUpperCase()

    let siluetaBuffer;
    try {
      siluetaBuffer = await getSilhouette(name, img)
    } catch {
      console.log('Fallback: Cuadro negro')
      siluetaBuffer = await createBlackBox()
    }

    sessions.set(id, {
      name: name,
      img: img,
      type: type,
      intentos: 0,
      timeout: setTimeout(() => {
        m.reply(`⏰ *Tiempo agotado!* Era *${name.toUpperCase()}*`)
        sessions.delete(id)
      }, timeout)
    })

    await conn.sendMessage(m.chat, {
      image: siluetaBuffer,
      caption: `*¿QUIÉN ES ESE POKÉMON?* 🎮\n\nTienes *${maxIntentos} intentos* y *30s*.\n*Pista:* Tipo ${type}\n*Premio: $${reward} coins*\n\nEscribe solo el nombre en inglés.`
    }, { quoted: m })
  }

  if (command === 'psalir') {
    if (sessions.has(id)) {
      clearTimeout(sessions.get(id).timeout)
      sessions.delete(id)
      return m.reply('✅ Partida cancelada.')
    }
    return m.reply('❌ No hay partida activa.')
  }
}

handler.before = async (m) => {
  let id = m.chat
  if (!sessions.has(id) ||!m.text || m.isBaileys) return false

  let session = sessions.get(id)
  let user = global.db.data.users[m.sender]
  let answer = m.text.toLowerCase().trim()

  if (answer === session.name) {
    clearTimeout(session.timeout)
    sessions.delete(id)

    user.money += reward
    await conn.sendMessage(m.chat, {
      image: { url: session.img },
      caption: `🎉 *¡CORRECTO!*\n\nEra *${session.name.toUpperCase()}* ✅\n+ $${reward} coins`
    }, { quoted: m })
    return true
  } else {
    session.intentos += 1
    if (session.intentos >= maxIntentos) {
      clearTimeout(session.timeout)
      sessions.delete(id)
      await m.reply(`❌ *Fallaste los ${maxIntentos} intentos!*\nEra *${session.name.toUpperCase()}*\n\nPerdiste la partida.`)
    } else {
      let quedan = maxIntentos - session.intentos
      await m.reply(`❌ Incorrecto. Te quedan *${quedan} intento(s)*.\n*Pista:* Tipo ${session.type}`)
    }
    return true
  }
}

handler.help = ['pokedex', 'psalir']
handler.tags = ['game']
handler.command = /^(pokedex|psalir)$/i
export default handler