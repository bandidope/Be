import fs from 'fs'
import path from 'path'

const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'extra']
const diasBorrar = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const IMAGEN_FALLBACK = 'https://raw.githubusercontent.com/bandidope/Fotos/refs/heads/master/fotos/logo.png'
const MARCA = 'For Three Bot'
const TZ = 'America/Lima'

const NOMBRES_ES = {lunes:'LUNES', martes:'MARTES', miercoles:'MIERCOLES', jueves:'JUEVES', viernes:'VIERNES', sabado:'SABADO', extra:'EXTRA'}

const getDB = () => {
  global.db.data.sorteo??= {lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], extra:[]}
  return global.db.data.sorteo
}

const getHoy = () => {
  let dia = new Date().toLocaleString('en-US', { timeZone: TZ, weekday: 'long' }).toLowerCase()
  let diaDB = dia === 'domingo'? 'extra' : dia
  return { diaReal: dia, diaDB: diaDB, esDomingo: dia === 'domingo' }
}

let handler = async (m, { conn, text, args, isAdmin, isOwner, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '•', key: m.key } }).catch(_=>{})

  let db = getDB()
  let sub = args[0]?.toLowerCase()
  let { diaReal, diaDB, esDomingo } = getHoy()

  // 1. BLOQUE 1: VER/LISTA - RETURN SIEMPRE
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
    let imgGrupo = null
    try { imgGrupo = await conn.profilePictureUrl(m.chat, 'image') } catch(e) { imgGrupo = IMAGEN_FALLBACK }
    try { return await conn.sendMessage(m.chat, { image: { url: imgGrupo }, caption: txt.trim() }, { quoted: m }) }
    catch(e) { return m.reply(`ERROR AL CARGAR IMAGEN.\n\n${txt.trim()}`) }
  }

  // 2. BLOQUE 2: ELIMINAR EXTRAS - RETURN SIEMPRE
  if(sub === 'eliminar' && args[1] === 'extras'){
    if(!m.isGroup) return m.reply('ERROR: Solo grupos.')
    if(!isAdmin &&!isOwner) return m.reply('ERROR: Solo admins.')
    db.extra = []
    await global.db.write()
    return m.reply('*EXTRA ELIMINADO*\n> Lista de EXTRA limpiada a 0.')
  }

  // 3. BLOQUE 3: ELIMINAR TODO - RETURN SIEMPRE
  if(sub === 'eliminar'){
    if(!m.isGroup) return m.reply('ERROR: Solo grupos.')
    if(!isAdmin &&!isOwner) return m.reply('ERROR: Solo admins.')
    if(args[1]!== 'si') return m.reply(`*AVISO IMPORTANTE*\n> Esto borrara Lunes a Sabado. EXTRA se queda intacto.\n\n> Escribe:${usedPrefix + command} eliminar si\n> para confirmar.`)
    for(let dia of diasBorrar){ db[dia] = [] }
    await global.db.write()
    return m.reply('*LISTA LUNES-SABADO ELIMINADA*\n> EXTRA se mantuvo.')
  }

  // 4. BLOQUE 4: AGREGAR - SOLO SI TIENE /
  if (text.includes('/')) {
    let partes = text.split('/').map(v => v.trim())
    let [nombre][numero][premio][diaForzado] = partes
    let dia = diaForzado?.toLowerCase() === 'extra'? 'extra' : diaDB
    let tipo = dia === 'extra'? (esDomingo? 'domingo' : 'manual') : ''
    if (!nombre ||!numero ||!premio) {
      return m.reply(`*FORMATO INCORRECTO*\n> Usa:${usedPrefix + command} Nombre / Numero / Premio`)
    }
    numero = numero.replace(/\s/g, '')
    db[dia]??= []
    db[dia].push({nombre, premio, numero, tipo})
    await global.db.write()
    let tag = dia === 'extra'? (esDomingo? '[DOMINGO]' : '[EXTRA]') : '[OK]'
    let msg = `*REGISTRO EXITOSO* ${tag}\n> Dia: ${NOMBRES_ES[dia]}\n> • ${nombre} | ${numero} | ${premio}`
    return m.reply(msg) // <- RETURN AQUI TAMBIEN
  }

  // 5. BLOQUE 5: HELP - SOLO SI LLEGÓ HASTA ACÁ SOLO CON.lista
  return m.reply(`*LISTA GRUPO SIN LIMITE*\n>> ================================== <<\n
>.${command} Nombre / Numero / Premio
>.${command} Nombre / Numero / Premio / extra
> Auto: *${NOMBRES_ES[diaDB]}*
\n>.${command} ver |.${command} eliminar si |.${command} eliminar extras`)
}

handler.help = ['lista']
handler.tags = ['main']
handler.command = /^lista$/i // <- Sigue exacto
handler.group = true
export default handler