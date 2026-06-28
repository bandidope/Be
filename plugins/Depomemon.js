import fetch from 'node-fetch'

const timeout = 30000 // 30 segundos
const reward = 1000 // Coins por ganar
const maxIntentos = 2 // [NUEVO] 2 vidas
const sessions = new Map() 

let handler = async (m, { conn, command, usedPrefix }) => {
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
    let type = json.types.map(t => t.type.name).join(', ') // [PISTA] Tipo

    sessions.set(id, {
      name: name,
      img: img,
      intentos: 0,
      timeout: setTimeout(() => {
        m.reply(`⏰ *Tiempo agotado!* Era *${name.toUpperCase()}*`)
        sessions.delete(id)
      }, timeout)
    })

    await conn.sendMessage(m.chat, { 
      image: { url: img }, 
      caption: `*¿QUIÉN ES ESE POKÉMON?* 🎮\n\nTienes *${maxIntentos} intentos* y *30s*.\n*Pista:* Tipo ${type.toUpperCase()}\n*Premio: $${reward} coins*\n\nEscribe solo el nombre en inglés.`
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

// Handler para las respuestas
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
    // [NUEVO] Manda la imagen del Pokémon adivinado
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
      await m.reply(`❌ Incorrecto. Te quedan *${quedan} intento(s)*.\nPista: Tipo ${session.name}`) // Aquí solo decimos que falló
    }
    return true
  }
}

handler.help = ['pokedex', 'psalir']
handler.tags = ['game']
handler.command = /^(pokedex|psalir)$/i
export default handler