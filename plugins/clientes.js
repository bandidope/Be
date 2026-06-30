import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
await mongoose.connect(process.env.MONGO_URL, { dbName: 'forbotDB' })
console.log('✅ Mongo Clientes OK')

const Cliente = mongoose.model('Cliente', new mongoose.Schema({
  telefono: { type: String, unique: true },
  nombre: String,
  grupo: String,
  fechaCompra: Date
}))

let handler = async (m, { command, args }) => {
  let texto = args.join(' ')

  if (command === 'addcliente') {
    // Formato: .addcliente Nombre - Grupo - Telefono - Fecha
    let [nombre, grupo, telefono, fecha] = texto.split('-').map(s => s.trim())
    if (!telefono || !nombre) return m.reply('Uso: .addcliente Nombre - Grupo - Telefono - Fecha\nEj: .addcliente Juan Perez - Grupo A - 51987654321 - 05/10/2025')
    
    await Cliente.findOneAndUpdate({ telefono }, { 
      nombre, 
      grupo, 
      fechaCompra: new Date(fecha.split('/').reverse().join('-')) 
    }, { upsert: true })
    
    return m.reply(`✅ Cliente guardado/actualizado\n*${nombre}* | ${grupo} | ${telefono}`)
  }

  if (command === 'clientes') {
    let lista = await Cliente.find({}).sort({ fechaCompra: -1 })
    if (lista.length === 0) return m.reply('❌ No tienes clientes registrados aún')
    
    let msg = `*👥 LISTA DE CLIENTES | TOTAL: ${lista.length}*\n`
    msg += `━━━━━━━━━━\n\n`
    
    lista.forEach((c, i) => {
      let fecha = c.fechaCompra.toLocaleDateString('es-PE')
      msg += `*${i+1}. ${c.nombre}*\n`
      msg += `   📌 Grupo: ${c.grupo}\n`
      msg += `   📱 Tel: ${c.telefono}\n`
      msg += `   📅 Fecha: ${fecha}\n\n`
    })
    return m.reply(msg.trim())
  }
}
handler.command = ['addcliente', 'clientes']
export default handler