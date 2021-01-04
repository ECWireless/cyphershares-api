const express = require('express');
var cors = require('cors');

const app = express();
app.use(cors())

app.get('/', (req, res) => {
    return res.send('CypherShares API.');
});

app.get('/api', (req, res) => {
    return res.send({"buy_price":{"amount_in":"1000000000000000","amount_out":"7057266332547125","path":["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b"],"deadline":1609727670,"gas_cost":"170000","gas_price":"127170610158","slippage":"-0.006031912846003326964441243396256458922966089","trade_type":"exact_in","display":{"from_quantity":"0.001","from_token_price_usd":"$971.65","to_quantity":"0.007057","to_token_price_usd":"$138.51","input_value_usd":"$0.97","output_value_usd":"$0.98","total_price_currency":"0.022619 ETH","total_price_usd":"$21.98","gas_price_eth":"0.021619 ETH","gas_price_usd":"$21.01","slippage":"\u003c 0.01%"}}});
});

app.listen(3001, () =>
  console.log(`Example app listening on port 3001!`),
);

module.exports = app