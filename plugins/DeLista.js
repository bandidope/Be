import fs from 'fs'
import path from 'path'

const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'extra']
const diasBorrar = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] // <- Solo Lunes-Sab
const emojiDia = '-' // <- CAMBIO: Era '🌀', ahora es '-'
const IMAGEN_FALLBACK = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'
const MARCA = 'For Three Bot' // <- CAMBIO: Era 'For Three Bot 🌀'
const TZ = 'America/Lima'

const getDB = () => {
  global.db.data.sorteo??= {lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], extra:[]}
  return global.db.data.sorteo
}

const getHoy = () => {
  let dia = new Date().toLocaleString('en-US', { timeZone: TZ, weekday: 'long' }).toLowerCase()
  return { diaReal: dia, diaDB: dia === 'domingo'? 'extra' : dia, esDomingo: dia === 'domingo' }
}

let handler = async (m, { conn, text, args, isAdmin, isOwner }) => {
  await conn.sendMessage(m.chat, { react: { text: '•', key: m.key } }).catch(_=>{}) // <- CAMBIO: Era '🌀'

  let db = getDB()
  let sub = args[0]?.toLowerCase()
  let { diaReal, diaDB, esDomingo } = getHoy()

  if(sub === 'ver' || sub === 'lista'){
    let txt = `GANADORES\n»————————> • <————————«\n` // <- CAMBIO: Era '🌀 GANADORES 🌀'
    for(let dia of diasValidos){
      txt += `\n${emojiDia} ${dia.charAt(0).toUpperCase() + dia.slice(1)}:\n` // <- Ahora sale '- Lunes:'
      if(db[dia]?.length > 0){
        txt += db[dia].map((v,i)=> {
          let emojiFinal = v.tipo === 'domingo'? '🛒' : v.tipo === 'manual'? '📦' : '' // <- Se queda
          return `# ${v.nombre} / ${v.numero} / ${v.premio} ${emojiFinal}`.trim()
        }).join('\n')
      } else {
        txt += `# (${MARCA})`
      }
    }
    try {
      return await conn.sendMessage(m.chat, { image: { url: IMAGEN_FALLBACK }, caption: txt.trim() }, { quoted: m }) // <- Ojo: aquí aún tienes tu GitHub fijo
    } catch(e) {
      return m.reply(`⚠️ Falló la imagen. Te mando solo texto:\n\n${txt.trim()}`) // <- Se queda
    }
  }

  //.lista eliminar extras
  if(sub === 'eliminar' && args[1] === 'extras'){
    if(!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.') // <- Se queda
    if(!isAdmin &&!isOwner) return m.reply('⚠️ Solo los *admins* del grupo pueden borrar.') // <- Se queda
    db.extra = [] // <- Solo EXTRA
    await global.db.write()
    return m.reply('🗑️ *EXTRA ELIMINADO*\nLista de EXTRA limpiada a 0.') // <- Se queda
  }

  //.lista eliminar = Solo borra Lunes-Sab
  if(sub === 'eliminar'){
    if(!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.') // <- Se queda
    if(!isAdmin &&!isOwner) return m.reply('⚠️ Solo los *admins* del grupo pueden borrar toda la lista.') // <- Se queda
    if(args[1]!== 'si') return m.reply(`⚠️ *PELIGRO*\nEsto borrará Lunes a Sábado.\n*EXTRA se queda intacto.*\n\nEscribe:.lista eliminar si\npara confirmar.`) // <- Se queda
    for(let dia of diasBorrar){ db[dia] = [] }
    await global.db.write()
    return m.reply('🗑️ *Lista Lunes-Sábado eliminada.*\n*EXTRA se mantuvo.*') // <- Se queda
  }

  if (!text.includes('/')) return m.reply(`🎯 *LISTA GRUPO SIN LÍMITE* // <- Se queda
.lista Nombre / Numero / Premio
.lista Nombre / Numero / Premio / extra
*Auto: ${diaDB.toUpperCase()}*
.lista ver |.lista eliminar si |.lista eliminar extras`)

  let partes = text.split('/').map(v => v.trim())
  let [nombre, numero, premio, diaForzado] = partes
  let dia = diaForzado?.toLowerCase() === 'extra'? 'extra' : diaDB
  let tipo = dia === 'extra'? (esDomingo? 'domingo' : 'manual') : ''

  if (!nombre ||!numero ||!premio) {
    return m.reply(`Formato mal.\nUsa:.lista Nombre / Numero / Premio`)
  }

  numero = numero.replace(/\s/g, '')

  db[dia]??= []
  db[dia].push({nombre, premio, numero, tipo})
  await global.db.write()

  let emojiTag = dia === 'extra'? (esDomingo? '🛒' : '📦') : '✅' // <- Se queda
  let msg = `${emojiTag} *Anotado en ${dia.toUpperCase()}*\n# ${nombre} / ${numero} / ${premio}`

  m.reply(msg)
}

handler.help = ['lista']
handler.tags = ['main']
handler.command = /^lista$/i
handler.group = true
export default handler