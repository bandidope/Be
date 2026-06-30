import { db } from './plugins/clientes.js'

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let jid = m.sender
  let nombre = conn.getName(jid)

  switch (command) {
    case 'registrar': {
      await db.registrarCliente(jid, nombre)
      await db.sumarCompra(jid, 1) // simulamos 1 sol de compra
      let user = await db.getCliente(jid)
      m.reply(`✅ Registrado ${nombre}\nCompras: ${user.compras}\nGasto Total: S/. ${user.gastoTotal}\n\n*Reinicia el bot y prueba .perfil*`)
      break
    }
    case 'perfil': {
      let user = await db.getCliente(jid)
      if (!user) return m.reply('❌ No estás registrado. Usa .registrar primero')
      m.reply(`👤 *PERFIL ANTI-REINICIO*\n\nNombre: ${user.nombre}\nCompras: ${user.compras}\nGasto Total: S/. ${user.gastoTotal}\nFecha: ${user.fechaRegistro.toLocaleDateString('es-PE')}`)
      break
    }
    case 'sorteo': {
      if (!args[0]) return m.reply(`Uso: ${usedPrefix}sorteo crear CODIGO|PREMIO\nEj: ${usedPrefix}sorteo crear SORTEO1|Audifonos`)
      let [tipo, data] = args[0].split(' ')
      if (tipo === 'crear') {
        let [codigo, premio] = data.split('|')
        await db.crearSorteo(codigo, premio)
        m.reply(`🎉 Sorteo creado: *${codigo}*\nPremio: ${premio}\nUsa .sorteo participar ${codigo}`)
      }
      if (tipo === 'participar') {
        let codigo = data
        await db.participarSorteo(codigo, jid)
        m.reply(`✅ Participaste en ${codigo}, ${nombre}`)
      }
      break
    }
  }
}
handler.command = ['registrar', 'perfil', 'sorteo']
export default handler