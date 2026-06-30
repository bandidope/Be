import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
await mongoose.connect(process.env.MONGO_URL, { dbName: 'forbotDB' }).catch(err => console.log(err))
console.log('✅ Mongo Conectado')

const Cliente = mongoose.model('Cliente', new mongoose.Schema({
  telefono: { type: String, unique: true },
  nombre: String,
  grupo: String,
  fechaCompra: Date
}))

let handler = async (m, { command, text }) => {
  let [nombre, grupo, telefono, fecha] = text.split('-').map(s => s.trim())

  if (command === 'addcliente') {
    if (!telefono) return m.reply('Uso: .addcliente Nombre - Grupo - Telefono - Fecha')
    await Cliente.findOneAndUpdate({ telefono }, { nombre, grupo, fechaCompra: new Date(fecha.split('/').reverse().join('-')) }, { upsert: true })
    return m.reply(`✅ ${nombre} guardado`)
  }

  if (command === 'clientes') {
    let lista = await Cliente.find({})
    if (!lista.length) return m.reply('❌ Sin clientes')
    return m.reply(`*👥 CLIENTES: ${lista.length}*\n` + lista.map((c,i)=>`${i+1}. ${c.nombre} | ${c.grupo}`).join('\n'))
  }

  if (command === 'delcliente') {
    let res = await Cliente.deleteOne({ nombre: new RegExp(`^${text}$`, 'i') })
    return m.reply(res.deletedCount? `🗑️ "${text}" eliminado` : `❌ No encontré a "${text}"`)
  }
}
handler.help = ['addcliente', 'clientes', 'delcliente']
handler.command = /^(addcliente|clientes|delcliente)$/i 
export default handler