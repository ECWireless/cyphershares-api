const express = require('express');
var cors = require('cors');
const { ChainId, Token, WETH, Trade, TokenAmount, TradeType, Fetcher, Percent, Route } = require('@uniswap/sdk')

const app = express();

app.get('/api/buy_price/:quantity/:currency/:input_type', cors(), async (req, res) => {
	try {
		if (req.method === "OPTIONS") {
			return res.status(200).end();
		}

		const quantity = req.params.quantity
		const quantityLarge = quantity * 10**18
		// const currency = req.params.currency
		// const input_type = req.params.input_type
	
		const WETH_ADDRESS = '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
		const CSDEFI_TOKEN_ADDRESS = '0xf9d50338Fb100B5a97e79615a8a912e10975b61c'
	
		const csDEFI = new Token(ChainId.KOVAN, CSDEFI_TOKEN_ADDRESS, 18);
		const pair = await Fetcher.fetchPairData(csDEFI, WETH[csDEFI.chainId]);
		const route = new Route([pair], WETH[csDEFI.chainId]);
		const trade = new Trade(route, new TokenAmount(WETH[csDEFI.chainId], quantityLarge), TradeType.EXACT_INPUT);
		const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
		const slippageTolerance = new Percent('50', '10000'); // 50 bips, or 0.5%
		const amountOut = (trade.outputAmount.toFixed(18) * 10**18).toString();
		const amountReadable = trade.minimumAmountOut(slippageTolerance).toFixed(18).toString();

		const data = {
			"buy_price": {
				"amount_in": quantityLarge,
				"amount_out": amountOut,
				"path": [
					WETH_ADDRESS,
					CSDEFI_TOKEN_ADDRESS
				],
				"deadline": deadline,
				"gas_cost": "202776",
				"gas_price": "20000000000",
				"slippage": "-0.006031912846003326964441243396256458922966089",
				"trade_type": "exact_in",
				"display": {
					"from_quantity": quantity,
					"from_token_price_usd": "$NA",
					"to_quantity": amountReadable,
					"to_token_price_usd": "$NA",
					"input_value_usd": "$NA",
					"output_value_usd": "$NA",
					"total_price_currency":"0.022619 ETH",
					"total_price_usd":"$NA",
					"gas_price_eth":"0.021619 ETH",
					"gas_price_usd":"$NA",
					"slippage":"\u003c 0.01%"
				}
			}
		}

		return res.send(data);
	} catch (err) {
		console.error(err)
	}
});

app.get('/test', cors(), async (req, res) => {
	const quantity = 0.001
	const quantityLarge = quantity * 10**18
	// const currency = req.params.currency
	// const input_type = req.params.input_type

	const WETH_ADDRESS = '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
	const CSDEFI_TOKEN_ADDRESS = '0xf9d50338Fb100B5a97e79615a8a912e10975b61c'

	const csDEFI = new Token(ChainId.KOVAN, CSDEFI_TOKEN_ADDRESS, 18);
	const pair = await Fetcher.fetchPairData(csDEFI, WETH[csDEFI.chainId]);
	const route = new Route([pair], WETH[csDEFI.chainId]);
	const trade = new Trade(route, new TokenAmount(WETH[csDEFI.chainId], quantityLarge), TradeType.EXACT_INPUT);
	const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
	const slippageTolerance = new Percent('50', '10000'); // 1 bips, or 0.5%
	const amountOut = (trade.outputAmount.toFixed(18) * 10**18).toString();
	const amountReadable = trade.minimumAmountOut(slippageTolerance).toFixed(5).toString();

	console.log(amountOut)

	const data = {
		"buy_price": {
			"amount_in": quantityLarge,
			"amount_out": amountOut,
			"path": [
				WETH_ADDRESS,
				CSDEFI_TOKEN_ADDRESS
			],
			"deadline": deadline,
			"gas_cost": "202776",
			"gas_price": "20000000000",
			"slippage": "-0.006031912846003326964441243396256458922966089",
			"trade_type": "exact_in",
			"display": {
				"from_quantity": quantity,
				"from_token_price_usd": "$NA",
				"to_quantity": amountReadable,
				"to_token_price_usd": "$NA",
				"input_value_usd": "$NA",
				"output_value_usd": "$NA",
				"total_price_currency":"0.022619 ETH",
				"total_price_usd":"$NA",
				"gas_price_eth":"0.021619 ETH",
				"gas_price_usd":"$NA",
				"slippage":"\u003c 0.01%"
			}
		}
	}

	return res.send(data);
})

app.listen(process.env.PORT || 3001, () =>
  console.log(`Listening on port 3001!`),
);

module.exports = app;