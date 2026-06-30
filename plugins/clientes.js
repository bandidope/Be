import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.MONGO_URL, { dbName: 'forbotDB' })
console.log('✅ Mongo Conectado')

const clienteSchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  nombre: String,
  compras: { type: Number, default: 0 },
  gastoTotal: { type: Number, default: 0 },
  fechaRegistro: { type: Date, default: Date.now }
})
const sorteoSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  premio: String,
  participantes: [String],
  fechaCreacion: { type: Date, default: Date.now }
})

const Cliente = mongoose.model('Cliente', clienteSchema)
const Sorteo = mongoose.model('Sorteo', sorteoSchema)

export const db = {
  registrarCliente: async (jid, nombre) => {
    return await Cliente.findOneAndUpdate({ jid }, { jid, nombre }, { upsert: true, new: true })
  },
  getCliente: async (jid) => await Cliente.findOne({ jid }),
  sumarCompra: async (jid, monto) => {
    return await Cliente.findOneAndUpdate({ jid }, { $inc: { compras: 1, gastoTotal: monto } }, { new: true })
  },
  crearSorteo: async (codigo, premio) => {
    return await Sorteo.create({ codigo, premio, participantes: [] })
  },
  participarSorteo: async (codigo, jid) => {
    return await Sorteo.findOneAndUpdate({ codigo }, { $addToSet: { participantes: jid } }, { new: true })
  }
}

// === PLUGIN DENTRO DEL MISMO ARCHIVO ===
let handler = async (m, { conn, command, args, usedPrefix }) => {
  let jid = m.sender
  let nombre = conn.getName(jid)

  if (command === 'registrar') {
    await db.registrarCliente(jid, nombre)
    await db.sumarCompra(jid, 1)
    let user = await db.getCliente(jid)
    m.reply(`✅ Registrado ${nombre}\nCompras: ${user.compras}\nGasto: S/. ${user.gastoTotal}`)
  }
  if (command === 'perfil') {
    let user = await db.getCliente(jid)
    if (!user) return m.reply('❌ Usa.registrar primero')
    m.reply(`👤 *PERFIL*\nNombre: ${user.nombre}\nCompras: ${user.compras}\nGasto: S/. ${user.gastoTotal}`)
  }
}
handler.command = ['registrar', 'perfil']
export default handler