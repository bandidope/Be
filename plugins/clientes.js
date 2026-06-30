import mongoose from 'mongoose'
import { randomUUID } from 'crypto' // <-- Para generar jid único
import dotenv from 'dotenv'
dotenv.config()
await mongoose.connect(process.env.MONGO_URL, { dbName: 'forbotDB' })
console.log('✅ Mongo Conectado')

const Cliente = mongoose.model('Cliente', new mongoose.Schema({
  jid: { type: String, unique: true }, // <-- Volvemos a ponerlo
  telefono: { type: String, unique: true },
  nombre: String,
  grupos: { type: [String], default: [] },
  fechaCompra: { type: Date, default: null }
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
    if(p.length<4) return m.reply('❌ Uso: Nombre - Grupo1,Grupo2 - Telefono - Fecha')
    let [n,g,t,f] = p; t = t.replace(/\s/g,'');
    let grupos = g.split(',').map(x=>x.trim()).filter(Boolean);
    let fecha = parseFecha(f); if(!fecha) return m.reply('❌ Fecha inválida');

    let jidFake = randomUUID() // <-- Clave: jid único pa cada uno

    await Cliente.updateOne(
      {telefono:t},
      {nombre:n, grupos, fechaCompra:fecha, jid: jidFake}, // <-- Lo guardamos
      {upsert:true}
    );
    return m.reply(`✅ ${n} guardado | 📌 ${grupos.length} grupo(s)`)
  }
  if(command==='clientes'){
    let lista = await Cliente.find({}).sort({fechaCompra:-1});
    if(!lista.length) return m.reply('❌ Sin clientes.');
    let totalGrupos = lista.reduce((acc,c)=>acc + c.grupos.length, 0);
    let msg = `*👥 CLIENTES: ${lista.length} | 📦 GRUPOS: ${totalGrupos}*\n━━━━━━━━━━\n\n` +
      lista.map((c,i)=>`*${i+1}. ${c.nombre}* [${c.grupos.length}]\n 📌 ${c.grupos.join(', ')} | 📱 ${c.telefono} | 📅 ${c.fechaCompra?c.fechaCompra.toLocaleDateString('es-CL'):'Sin fecha'}`).join('\n\n');
    return m.reply(msg)
  }
  if(command==='delcliente'){
    if(!text) return m.reply('❌ Pon el nombre:.delcliente Sofi')
    let r = await Cliente.deleteOne({nombre:new RegExp(`^${text}$`,'i')});
    return m.reply(r.deletedCount?`🗑️ "${text}" eliminado`:`❌ No encontré a "${text}"`)
  }
}
handler.command=['addcliente','clientes','delcliente']
export default handler