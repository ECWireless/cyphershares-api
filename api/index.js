const BigNumber = require('bignumber.js');
const CoinMarketCap = require('coinmarketcap-api');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const { ChainId, Token, WETH, Trade, TokenAmount, TradeType, Fetcher, Percent, Route } = require('@uniswap/sdk');

dotenv.config();
const app = express();
app.use(cors());

// Initialize CoinMarketCap
const apiKey = process.env.COIN_MARKET_CAP_API;
const client = new CoinMarketCap(apiKey);

// Token Addresses
const WETH_ADDRESS = '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
const CSDEFI_TOKEN_ADDRESS = '0xf9d50338Fb100B5a97e79615a8a912e10975b61c'

// BUY PRICE
app.get('/api/buy_price/:quantity/:currency/:input_type', async (req, res) => {
	try {
		if (req.method === "OPTIONS") {
			return res.status(200).end();
		}

		const quantity = new BigNumber(req.params.quantity)
		const quantityLarge = quantity.multipliedBy(new BigNumber(10).pow(18))
		// const currency = req.params.currency
		// const input_type = req.params.input_type

		if (quantityLarge.toString() === '0') {
			res.status(400);
			return res.send('Input invalid');
		}

		// Uniswap Info
		const csDEFI = new Token(ChainId.KOVAN, CSDEFI_TOKEN_ADDRESS, 18);
		const pair = await Fetcher.fetchPairData(csDEFI, WETH[csDEFI.chainId]);
		const route = new Route([pair], WETH[csDEFI.chainId]);
		const trade = new Trade(route, new TokenAmount(WETH[csDEFI.chainId], quantityLarge), TradeType.EXACT_INPUT);
		const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
		const slippageTolerance = new Percent('50', '10000'); // 50 bips, or 0.5%
		const amountOut = new BigNumber(trade.minimumAmountOut(slippageTolerance).toFixed()).multipliedBy(new BigNumber(10).pow(18))
		const amountOutReadable = amountOut.dividedBy(new BigNumber(10).pow(18)).toFixed(4);
		const amountOutEstimate = trade.outputAmount.toFixed(6);
		const slippageNumber = trade.priceImpact.toFixed(5);
		let slippage = `${slippageNumber.toString()}%`;
		if (slippageNumber < 0.01) {
			slippage = "\u003c 0.01%";
		}

		// CoinMarketCap Info
		const ethUsdPrice = await client.getQuotes({id: 1027})
		.then(data => {
			const ethPrice = data.data['1027'].quote.USD.price
			return ethPrice.toFixed(2)
		})
		.catch(console.error);
		const inputValueUSD = Number(quantity.toString()) * ethUsdPrice

		const data = {
			"buy_price": {
				"amount_in": quantityLarge.toString(),
				"amount_out": amountOut.toString(),
				"path": [
					WETH_ADDRESS,
					CSDEFI_TOKEN_ADDRESS
				],
				"deadline": deadline,
				"gas_cost": "202776",
				"gas_price": "20000000000",
				"trade_type": "exact_in",
				"slippage": slippageNumber,
				"display": {
					"from_quantity": quantity.toString(),
					"from_token_price_usd": `$NA`,
					"to_quantity_estimate": amountOutEstimate,
					"to_quantity_minimum": amountOutReadable,
					"to_token_price_usd": "$NA",
					"input_value_usd": `$${inputValueUSD.toFixed(2)}`,
					"output_value_usd": `$${inputValueUSD.toFixed(2)}`,
					"total_price_currency":"0.022619 ETH",
					"total_price_usd":"$NA",
					"gas_price_eth":"0.004056 ETH",
					"gas_price_usd":"$NA",
					"slippage": slippage
				}
			}
		}

		return res.send(data);
	} catch (err) {
		console.error(err)
		res.status(400);
		return res.send('Input invalid');
	}
});

// SELL PRICE
app.get('/api/sell_price/:quantity/:currency/:input_type', async (req, res) => {
	try {
		if (req.method === "OPTIONS") {
			return res.status(200).end();
		}

		const quantity = new BigNumber(req.params.quantity)
		const quantityLarge = quantity.multipliedBy(new BigNumber(10).pow(18))
		// const currency = req.params.currency
		// const input_type = req.params.input_type

		if (quantityLarge.toString() === '0') {
			res.status(400);
			return res.send('Input invalid');
		}

		// Uniswap Info
		const csDEFI = new Token(ChainId.KOVAN, CSDEFI_TOKEN_ADDRESS, 18);
		const pair = await Fetcher.fetchPairData(WETH[csDEFI.chainId], csDEFI);
		const route = new Route([pair], csDEFI);
		const trade = new Trade(route, new TokenAmount(csDEFI, quantityLarge), TradeType.EXACT_INPUT);

		const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
		const slippageTolerance = new Percent('50', '10000'); // 50 bips, or 0.5%
		const amountOut = new BigNumber(trade.minimumAmountOut(slippageTolerance).toFixed()).multipliedBy(new BigNumber(10).pow(18))
		const amountOutReadable = amountOut.dividedBy(new BigNumber(10).pow(18)).toFixed(4);
		const amountOutEstimate = trade.outputAmount.toFixed(6);
		const slippageNumber = trade.priceImpact.toFixed(5);
		let slippage = `${slippageNumber.toString()}%`;
		if (slippageNumber < 0.01) {
			slippage = "\u003c 0.01%";
		}

		// CoinMarketCapInfo
		const ethUsdPrice = await client.getQuotes({id: 1027})
		.then(data => {
			const ethPrice = data.data['1027'].quote.USD.price
			return ethPrice.toFixed(2)
		})
		.catch(console.error);
		const inputValueUSD = Number(amountOutEstimate) * ethUsdPrice

		const data = {
			"sell_price": {
				"amount_in": quantityLarge.toString(),
				"amount_out": amountOut.toString(),
				"path": [
					CSDEFI_TOKEN_ADDRESS,
					WETH_ADDRESS
				],
				"deadline": deadline,
				"gas_cost": "202776",
				"gas_price": "30000000000",
				"slippage": slippageNumber,
				"display": {
					"from_quantity": quantity.toString(),
					"from_token_price_usd": "$NA",
					"to_quantity_estimate": amountOutEstimate,
					"to_quantity_minimum": amountOutReadable,
					"to_token_price_usd": "$NA",
					"input_value_usd": `$${inputValueUSD.toFixed(2)}`,
					"output_value_usd": `$${inputValueUSD.toFixed(2)}`,
					"total_price_currency":"0.022619 ETH",
					"total_price_usd":"$NA",
					"gas_price_eth":"0.000169 ETH",
					"gas_price_usd":"$NA",
					"slippage": slippage
				}
			}
		}

		return res.send(data);
	} catch (err) {
		console.error(err)
		res.status(400);
		return res.send('Input invalid');
	}
});

app.listen(process.env.PORT || 3001, () =>
  console.log(`Listening on port 3001!`),
);

module.exports = app;
