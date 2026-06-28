import fetch from 'node-fetch'

const timeout = 30000 
const reward = 1000
const maxIntentos = 2
const sessions = new Map() 

let handler = async (m, { conn, command }) => {
  let id = m.chat
  let user = global.db.data.users[m.sender]
  
  if (command === 'pokedex') {
    if (sessions.has(id)) return m.reply('⚠️ Ya hay un Pokémon en juego. Responde o usa .psalir')

    await conn.sendMessage(m.chat, { react: { text: '🎮', key: m.key } })
    
    let pokeId = Math.floor(Math.random() * 898) + 1
    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`)
    if (!res.ok) return m.reply('⚠️ Error PokéAPI')
    let json = await res.json()
    
    let name = json.name
    let img = json.sprites.other['official-artwork'].front_default
    let type = json.types.map(t => t.type.name).join(', ').toUpperCase()

    // [FIX] Crear silueta con Fallback
    let siluetaBuffer;
    try {
      let siluetaUrl = `https://api.popcat.xyz/v2/pokemon?pokemon=${name}`
      let siluetaRes = await fetch(siluetaUrl)
      if (!siluetaRes.ok) throw new Error('Popcat down')
      let siluetaJson = await siluetaRes.json()
      
      if (!siluetaJson.image) throw new Error('Image undefined') // [CLAVE] Si viene vacío, forzamos error
      siluetaBuffer = await fetch(siluetaJson.image).then(res => res.buffer())
    } catch (e) {
      console.error('Error Popcat:', e)
      // [FALLBACK] Si Popcat falla, creamos un cuadro negro con el texto
      siluetaBuffer = await conn.resize(img, 512, 512) // Tomamos la HD
      // Lo pintamos negro a la mala: le bajamos brillo al 100%
      siluetaBuffer = await conn.edit(siluetaBuffer, 'brightness', -100) 
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
  if (!sessions.has(id) || !m.text || m.isBaileys) return false
  
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