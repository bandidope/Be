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
    let [nombre, grupo, telefono, fecha] = texto.split('-').map(s => s.trim())
    if (!telefono) return m.reply('Uso:.addcliente Nombre - Grupo - Telefono - Fecha')
    await Cliente.findOneAndUpdate({ telefono }, { nombre, grupo, fechaCompra: new Date(fecha.split('/').reverse().join('-')) }, { upsert: true })
    return m.reply(`✅ ${nombre} guardado`)
  }

  if (command === 'clientes') {
    let lista = await Cliente.find({}).sort({ fechaCompra: -1 })
    if (!lista.length) return m.reply('❌ Sin clientes')
    let msg = `*👥 CLIENTES: ${lista.length}*\n━━━━━━━━━━\n\n` +
      lista.map((c, i) => `*${i+1}. ${c.nombre}*\n 📌 ${c.grupo} | 📱 ${c.telefono} | 📅 ${c.fechaCompra.toLocaleDateString('es-PE')}`).join('\n\n')
    return m.reply(msg)
  }

  if (command === 'delcliente') {
    // .delcliente Juan Perez
    let nombreABorrar = texto
    if (!nombreABorrar) return m.reply('Uso: .delcliente Nombre Completo')
    
    let res = await Cliente.deleteOne({ nombre: new RegExp(`^${nombreABorrar}$`, 'i') }) // i = no importa mayusculas
    return m.reply(res.deletedCount? `🗑️ Cliente "${nombreABorrar}" eliminado. Como si nunca existió.` : `❌ No encontré a "${nombreABorrar}"`)
  }
}
handler.command = ['addcliente', 'clientes', 'delcliente']
export default handler