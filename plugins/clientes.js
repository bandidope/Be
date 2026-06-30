import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
await mongoose.connect(process.env.MONGO_URL, { dbName: 'forbotDB' })
console.log('✅ Mongo Conectado')

const Cliente = mongoose.model('Cliente', new mongoose.Schema({
  telefono: { type: String, unique: true },
  nombre: String,
  grupo: String,
  fechaCompra: Date
}))

// Diccionario pa traducir meses
const MESES = {
  'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
  'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
}

// Traductor de fechas: Acepta "1 De Junio" o "05/10/2025"
const parseFecha = (fechaStr) => {
  if (!fechaStr) return null
  fechaStr = fechaStr.toLowerCase().trim()
  
  // Caso 1: 05/10/2025
  if (fechaStr.includes('/')) {
    let [dia, mes, anio] = fechaStr.split('/')
    let fecha = new Date(`${anio}-${mes}-${dia}`)
    return isNaN(fecha) ? null : fecha
  }

  // Caso 2: 1 De Junio 
  let partes = fechaStr.split(' de ')
  if (partes.length === 2) {
    let dia = parseInt(partes[0])
    let mes = MESES[partes[1]]
    let anio = new Date().getFullYear() // Si no pones año, usa este año 2026
    if (!isNaN(dia) && mes !== undefined) {
      return new Date(anio, mes, dia)
    }
  }
  return null // Si no entiende la fecha
}

let handler = async (m, { command, text }) => {
  let [nombre, grupo, telefono, fechaStr] = text.split('-').map(s => s.trim())
  telefono = telefono.replace(/\s/g, '') // Quita espacios: +56 9 8750 5028 -> +56987505028

  if (command === 'addcliente') {
    if (!telefono || !nombre) return m.reply('Uso: .addcliente Nombre - Grupo - Telefono - Fecha\nEj: .addcliente Sofi - Caninas - +56 9 8750 5028 - 1 De Junio')
    
    let fecha = parseFecha(fechaStr)
    if (!fecha) return m.reply(`❌ Fecha inválida: ${fechaStr}\nUsa: 05/10/2025 o 1 De Junio`)

    await Cliente.findOneAndUpdate({ telefono }, { nombre, grupo, fechaCompra: fecha }, { upsert: true })
    return m.reply(`✅ ${nombre} guardado | Fecha: ${fecha.toLocaleDateString('es-CL')}`)
  }

  if (command === 'clientes') {
    let lista = await Cliente.find({}).sort({ fechaCompra: -1 })
    if (!lista.length) return m.reply('❌ Sin clientes')
    let msg = `*👥 CLIENTES: ${lista.length}*\n━━━━━━━━━━\n\n` +
      lista.map((c,i)=>`*${i+1}. ${c.nombre}*\n 📌 ${c.grupo} | 📱 ${c.telefono} | 📅 ${c.fechaCompra.toLocaleDateString('es-CL')}`).join('\n\n')
    return m.reply(msg)
  }

  if (command === 'delcliente') {
    let res = await Cliente.deleteOne({ nombre: new RegExp(`^${text}$`, 'i') })
    return m.reply(res.deletedCount? `🗑️ "${text}" eliminado` : `❌ No encontré a "${text}"`)
  }
}
handler.command = ['addcliente', 'clientes', 'delcliente']
export default handler