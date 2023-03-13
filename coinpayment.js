const coinbase = require('coinbase-commerce-node')
const {COIN_API} = process.env

exports.coinbaseInit = ()=>{
    const Client = coinbase.Client
    Client.init(COIN_API)
    return coinbase.resources.Charge
}



