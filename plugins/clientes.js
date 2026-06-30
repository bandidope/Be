import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

/* ========= 1. CONEXIÓN GLOBAL ANTI-REINICIO ========= */
if (!global.mongooseConn) {
  global.mongooseConn = mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000
  })
  mongoose.connection.on('connected', () => console.log('✅ MongoDB Conectado - ForBotDB'))
  mongoose.connection.on('error', err => console.log('❌ MongoDB Error:', err.message))
}

/* ========= 2. ESQUEMAS ========= */
const clienteSchema = new mongoose.Schema({
  _id: { type: String }, // usamos el jid de WhatsApp como ID
  nombre: { type: String, default: 'Sin Nombre' },
  compras: { type: Number, default: 0 },
  gastoTotal: { type: Number, default: 0 },
  fechaRegistro: { type: Date, default: Date.now },
  notas: { type: String, default: '' }
})

const sorteoSchema = new mongoose.Schema({
  codigo: { type: String, unique: true, required: true }, // ej: SORTEO-001
  premio: { type: String, required: true },
  participantes: [{ type: String }], // array de jid
  ganador: { type: String, default: null },
  estado: { type: String, enum: ['activo', 'terminado'], default: 'activo' },
  fecha: { type: Date, default: Date.now }
})

const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema)
const Sorteo = mongoose.models.Sorteo || mongoose.model('Sorteo', sorteoSchema)

/* ========= 3. FUNCIONES PARA TU BOT ========= */
export const db = {
  // CLIENTES
  async registrarCliente(jid, nombre) {
    await Cliente.updateOne(
      { _id: jid },
      { $setOnInsert: { nombre } },
      { upsert: true }
    )
  },
  async sumarCompra(jid, monto = 0) {
    await Cliente.updateOne(
      { _id: jid },
      { $inc: { compras: 1, gastoTotal: monto }
    )
  },
  async getCliente(jid) {
    return await Cliente.findById(jid)
  },
  async topClientes(limit = 10) {
    return await Cliente.find().sort({ gastoTotal: -1 }).limit(limit)
  },

  // SORTEOS
  async crearSorteo(codigo, premio) {
    return await Sorteo.create({ codigo, premio })
  },
  async participarSorteo(codigo, jid) {
    return await Sorteo.updateOne(
      { codigo, estado: 'activo' },
      { $addToSet: { participantes: jid } // $addToSet evita duplicados
    )
  },
  async sortearGanador(codigo) {
    const s = await Sorteo.findOne({ codigo, estado: 'activo' })
    if (!s || s.participantes.length === 0) return null
    const ganador = s.participantes[Math.floor(Math.random() * s.participantes.length)]
    s.ganador = ganador
    s.estado = 'terminado'
    await s.save()
    return ganador
  },
  async getSorteo(codigo) {
    return await Sorteo.findOne({ codigo })
  }
}