import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
await mongoose.connect(process.env.MONGO_URL, { dbName: 'forbotDB' })
console.log('✅ Mongo Conectado')

const Cliente = mongoose.model('Cliente', new mongoose.Schema({
  telefono: { type: String, unique: true },
  nombre: String, grupo: String, fechaCompra: { type: Date, default: null }
}))

const MESES = {'enero':0,'febrero':1,'marzo':2,'abril':3,'mayo':4,'junio':5,'julio':6,'agosto':7,'septiembre':8,'octubre':9,'noviembre':10,'diciembre':11}

const parseFecha = (f) => {
  if(!f) return null; f=f.toLowerCase().trim();
  if(f.includes('/')){let [d,m,a]=f.split('/'); let fecha=new Date(`${a}-${m}-${d}`); return isNaN(fecha)?null:fecha}
  let p = f.split(' de '); if(p.length<2) return null;
  let dia=parseInt(p[0]), mes=MESES[p[1]]; 
  if(!isNaN(dia)&&mes!==undefined) return new Date(new Date().getFullYear(), mes, dia);
  return null
}

let handler = async (m, { command, text = '' }) => {
  
  if(command==='addcliente'){
    let p = text.split('-').map(s=>s.trim());
    if(p.length<4) return m.reply('❌ Te faltan datos\nUso: Nombre - Grupo - Telefono - Fecha\nEj: .addcliente Sofi - Caninas - +56 9 8750 5028 - 1 De Junio')
    
    let [n,g,t,f] = p; 
    t = t.replace(/\s/g,''); // Solo se ejecuta aqui, en addcliente
    if(!t) return m.reply('❌ Falta el teléfono')
    
    let fecha = parseFecha(f);
    if(!fecha) return m.reply('❌ Fecha inválida. Usa: 05/10/2025 o 1 De Junio');
    
    await Cliente.updateOne({telefono:t},{nombre:n,grupo:g,fechaCompra:fecha},{upsert:true});
    return m.reply(`✅ ${n} guardado | 📱 ${t} | 📅 ${fecha.toLocaleDateString('es-CL')}`)
  }

  if(command==='clientes'){
    let lista = await Cliente.find({}).sort({fechaCompra:-1});
    if(!lista.length) return m.reply('❌ Sin clientes aún. Agrega 1 con .addcliente');
    let msg = `*👥 CLIENTES: ${lista.length}*\n━━━━━━━━━━\n\n` + 
      lista.map((c,i)=>`*${i+1}. ${c.nombre}*\n 📌 ${c.grupo} | 📱 ${c.telefono} | 📅 ${c.fechaCompra?c.fechaCompra.toLocaleDateString('es-CL'):'Sin fecha'}`).join('\n\n');
    return m.reply(msg) // <-- Aqui ya no hay .replace()
  }

  if(command==='delcliente'){
    if(!text) return m.reply('❌ Pon el nombre: .delcliente Sofi')
    let r = await Cliente.deleteOne({nombre:new RegExp(`^${text}$`,'i')});
    return m.reply(r.deletedCount?`🗑️ "${text}" eliminado`:`❌ No encontré a "${text}"`)
  }
}
handler.command=['addcliente','clientes','delcliente']
export default handler