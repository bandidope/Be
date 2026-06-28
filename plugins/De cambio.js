import fetch from 'node-fetch'

const MARCA = 'For Three Bot 💱'
const TZ = 'America/Lima'

let handler = async (m, { conn, text }) => {
  await conn.sendMessage(m.chat, { react: { text: '💱', key: m.key } }).catch(_=>{})

  if (!text ||!text.includes('/')) {
    return m.reply(`💱 *CAMBIO GLOBAL + BLUE ${MARCA}*

Uso:.cambio [monto] / [CODIGO] / [CODIGO]

Ejemplos:
.cambio 100 / PEN / USD -> Oficial
.cambio 100 / USD / ARS  -> BLUE Venta 🇦🇷
.cambio 100 / ARS / PEN  -> BLUE Inverso 🇦🇷
.cambio 100 / COP / MXN  -> Oficial

Códigos: PEN, USD, EUR, COP, MXN, ARS, BRL...`)
  }

  let [montoStr, de, a] = text.split('/').map(v => v.trim().toUpperCase())
  let monto = parseFloat(montoStr.replace(/,/g, ''))

  if (isNaN(monto) || monto <= 0) return m.reply(`⚠️ Monto inválido`)
  if (de.length!== 3 || a.length!== 3) return m.reply(`⚠️ Usa códigos de 3 letras: PEN, USD, ARS`)

  if (de === a) return m.reply(`✅ ${monto} ${de} = ${monto} ${a}`)

  try {
    let tasaUSD_ARS = null
    let tipoTasa = 'Oficial'

    // <- PASO 1: Si hay ARS, agarra el BLUE de dolarapi.com
    if (de === 'ARS' || a === 'ARS') {
      let resBlue = await fetch('https://dolarapi.com/v1/dolares/blue')
      let jsonBlue = await resBlue.json()
      if(!jsonBlue.venta) throw new Error('API Blue down')
      tasaUSD_ARS = jsonBlue.venta
      tipoTasa = 'BLUE'
    }

    let total
    // <- PASO 2: Calcula con Blue si hay ARS
    if (de === 'USD' && a === 'ARS') total = (monto * tasaUSD_ARS).toFixed(2)
    else if (de === 'ARS' && a === 'USD') total = (monto / tasaUSD_ARS).toFixed(2)
    else if (de === 'ARS') {
      // ARS -> USD -> X con Blue
      let res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
      let json = await res.json()
      total = ((monto / tasaUSD_ARS) * json.rates[a]).toFixed(2)
    }
    else if (a === 'ARS') {
      // X -> USD -> ARS con Blue
      let res = await fetch(`https://api.exchangerate-api.com/v4/latest/${de}`)
      let json = await res.json()
      total = ((monto * json.rates.USD) * tasaUSD_ARS).toFixed(2)
    } 
    // <- PASO 3: Si no hay ARS, todo Oficial
    else {
      let res = await fetch(`https://api.exchangerate-api.com/v4/latest/${de}`)
      let json = await res.json()
      if(!json.rates[a]) throw new Error('Moneda inválida')
      total = (monto * json.rates[a]).toFixed(2)
    }

    let fecha = new Date().toLocaleDateString('es-PE', { timeZone: TZ })

    let txt = `💱 *CAMBIO ${MARCA}*\n»————————> 💵 <————————«\n
💰 ${monto} ${de} = *${total} ${a}*
📊 Tasa: ${tipoTasa} ${tasaUSD_ARS? `1 USD = ${tasaUSD_ARS} ARS` : ''}
📅 ${fecha}`

    m.reply(txt)

  } catch(e) {
    console.log(e)
    m.reply(`⚠️ Error: ${e.message}\nRevisa los códigos: PEN, USD, ARS, COP...`)
  }
}

handler.help = ['cambio']
handler.tags = ['main']
handler.command = /^cambio$/i
handler.group = true
export default handler