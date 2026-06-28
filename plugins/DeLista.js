import fs from 'fs'
import path from 'path'

const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'extra']
const diasBorrar = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const emojiDia = '-'
const IMAGEN_FALLBACK = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'
const MARCA = 'For Three Bot'
const TZ = 'America/Lima'

const getDB = () => {
  global.db.data.sorteo??= {lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], extra:[]}
  return global.db.data.sorteo
}

const getHoy = () => {
  let diaES = new Date().toLocaleString('es-PE', { timeZone: TZ, weekday: 'long' }).toLowerCase()
  diaES = diaES.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return {
    diaReal: diaES,
    diaDB: diaES === 'domingo'? 'extra' : diaES,
    esDomingo: diaES === 'domingo'
  }
}

let handler = async (m, { conn, text, args, isAdmin, isOwner }) => {
  await conn.sendMessage(m.chat, { react: { text: '•', key: m.key } }).catch(_=>{})

  let db = getDB()
  let sub = args[0]?.toLowerCase()
  let { diaReal, diaDB, esDomingo } = getHoy()

  if(sub === 'ver' || sub === 'lista'){
    let txt = `GANADORES\n»————————> • <————————«\n`
    for(let dia of diasValidos){
      txt += `\n${emojiDia} ${dia.charAt(0).toUpperCase() + dia.slice(1)}:\n`
      if(db[dia]?.length > 0){
        txt += db[dia].map((v,i)=> {
          let emojiFinal = ''
          if(v.tipo === 'domingo') emojiFinal = '🛒' // Domingo auto
          if(v.tipo === 'manual') emojiFinal = '📦' // EXTRA manual
          return `# ${v.nombre} / ${v.numero} / ${v.premio} ${emojiFinal}`.trim()
        }).join('\n')
      } else {
        txt += `# (${MARCA})`
      }
    }
    let imgGrupo = null
    try { imgGrupo = await conn.profilePictureUrl(m.chat, 'image') } catch(e) { imgGrupo = IMAGEN_FALLBACK }
    try { return await conn.sendMessage(m.chat, { image: { url: imgGrupo }, caption: txt.trim() }, { quoted: m }) }
    catch(e) { return m.reply(`⚠️ Falló la imagen. Te mando solo texto:\n\n${txt.trim()}`) }
  }

  if(sub === 'eliminar' && args[1] === 'extras'){
    if(!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.')
    if(!isAdmin &&!isOwner) return m.reply('⚠️ Solo los *admins* del grupo pueden borrar.')
    db.extra = []
    await global.db.write()
    return m.reply('🗑️ *EXTRA ELIMINADO*\nLista de EXTRA limpiada a 0.')
  }

  if(sub === 'eliminar'){
    if(!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.')
    if(!isAdmin &&!isOwner) return m.reply('⚠️ Solo los *admins* del grupo pueden borrar toda la lista.')
    if(args[1]!== 'si') return m.reply(`⚠️ *PELIGRO*\nEsto borrará Lunes a Sábado.\n*EXTRA se queda intacto.*\n\nEscribe:.lista eliminar si\npara confirmar.`)
    for(let dia of diasBorrar){ db[dia] = [] }
    await global.db.write()
    return m.reply('🗑️ *Lista Lunes-Sábado eliminada.*\n*EXTRA se mantuvo.*')
  }

  if (!text.includes('/')) return m.reply(`🎯 *LISTA GRUPO SIN LÍMITE*
.lista Nombre / Numero / Premio
.lista Nombre / Numero / Premio / extra
*Auto: ${diaDB.toUpperCase()}*
.lista ver |.lista eliminar si |.lista eliminar extras`)

  let partes = text.split('/').map(v => v.trim())
  let [nombre, numero, premio, diaForzado] = partes
  let dia = diaForzado?.toLowerCase() === 'extra'? 'extra' : diaDB

  // [UPDATE] UPDATE: Si pones /extra manda manual siempre, aunque sea domingo
  let tipo = dia === 'extra'? 'manual' : ''

  if (!nombre ||!numero ||!premio) {
    return m.reply(`Formato mal.\nUsa:.lista Nombre / Numero / Premio`)
  }

  numero = numero.replace(/\s/g, '')

  db[dia]??= []
  db[dia].push({nombre, premio, numero, tipo})
  await global.db.write()

  let emojiTag = dia === 'extra'? (tipo === 'manual'? '📦' : '🛒') : '✅'
  let msg = `${emojiTag} *Anotado en ${dia.toUpperCase()}*\n# ${nombre} / ${numero} / ${premio}`

  m.reply(msg)
}

handler.help = ['lista']
handler.tags = ['main']
handler.command = /^lista$/i
handler.group = true
export default handler