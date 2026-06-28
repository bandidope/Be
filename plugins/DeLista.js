import fs from 'fs'
import path from 'path'

const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'extra']
const diasBorrar = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const IMAGEN_FALLBACK = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'
const MARCA = 'For Three Bot'
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
  await conn.sendMessage(m.chat, { react: { text: '•', key: m.key } }).catch(_=>{})

  let db = getDB()
  let sub = args[0]?.toLowerCase()
  let { diaReal, diaDB, esDomingo } = getHoy()

  if(sub === 'ver' || sub === 'lista'){
    let txt = `*LISTA DE GANADORES*\n>> ================================== <<\n`
    for(let dia of diasValidos){
      txt += `\n>> *${dia.charAt(0).toUpperCase() + dia.slice(1)}* <<\n`
      if(db[dia]?.length > 0){
        txt += db[dia].map((v,i)=> {
          let tagFinal = v.tipo === 'domingo'? '[DOMINGO]' : v.tipo === 'manual'? '[EXTRA]' : '[OK]'
          return ` • ${v.nombre} | ${v.numero} | ${v.premio} ${tagFinal}`.trim()
        }).join('\n')
      } else {
        txt += ` • --- SIN REGISTROS ---`
      }
    }

    // Foto del grupo o fallback GitHub
    let imgGrupo = null
    try {
      imgGrupo = await conn.profilePictureUrl(m.chat, 'image')
    } catch(e) {
      imgGrupo = IMAGEN_FALLBACK
    }

    try {
      return await conn.sendMessage(m.chat, { image: { url: imgGrupo }, caption: txt.trim() }, { quoted: m })
    } catch(e) {
      return m.reply(`ERROR AL CARGAR IMAGEN.\n\n${txt.trim()}`)
    }
  }

  //.lista eliminar extras
  if(sub === 'eliminar' && args[1] === 'extras'){
    if(!m.isGroup) return m.reply('ERROR: Solo grupos.')
    if(!isAdmin &&!isOwner) return m.reply('ERROR: Solo admins.')
    db.extra = []
    await global.db.write()
    return m.reply('*EXTRA ELIMINADO*\n> Lista de EXTRA limpiada a 0.')
  }

  //.lista eliminar = Solo borra Lunes-Sab
  if(sub === 'eliminar'){
    if(!m.isGroup) return m.reply('ERROR: Solo grupos.')
    if(!isAdmin &&!isOwner) return m.reply('ERROR: Solo admins.')
    if(args[1]!== 'si') return m.reply(`*AVISO IMPORTANTE*\n> Esto borrara Lunes a Sabado. EXTRA se queda intacto.\n\n> Escribe:.lista eliminar si\n> para confirmar.`)
    for(let dia of diasBorrar){ db[dia] = [] }
    await global.db.write()
    return m.reply('*LISTA LUNES-SABADO ELIMINADA*\n> EXTRA se mantuvo.')
  }

  if (!text.includes('/')) return m.reply(`*LISTA GRUPO SIN LIMITE*\n>> ================================== <<\n
>.lista Nombre / Numero / Premio
>.lista Nombre / Numero / Premio / extra
> Auto: *${diaDB.toUpperCase()}*
\n>.lista ver |.lista eliminar si |.lista eliminar extras`)

  let partes = text.split('/').map(v => v.trim())
  let [nombre, numero, premio, diaForzado] = partes
  let dia = diaForzado?.toLowerCase() === 'extra'? 'extra' : diaDB
  let tipo = dia === 'extra'? (esDomingo? 'domingo' : 'manual') : ''

  if (!nombre ||!numero ||!premio) {
    return m.reply(`*FORMATO INCORRECTO*\n> Usa:.lista Nombre / Numero / Premio`)
  }

  numero = numero.replace(/\s/g, '')

  db[dia]??= []
  db[dia].push({nombre, premio, numero, tipo})
  await global.db.write()

  let tag = dia === 'extra'? (esDomingo? '[DOMINGO]' : '[EXTRA]') : '[OK]'
  let msg = `*REGISTRO EXITOSO* ${tag}\n> Dia: ${dia.toUpperCase()}\n> • ${nombre} | ${numero} | ${premio}`

  m.reply(msg)
}

handler.help = ['lista']
handler.tags = ['main']
handler.command = /^lista$/i
handler.group = true
export default handler