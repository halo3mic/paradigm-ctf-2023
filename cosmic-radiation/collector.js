require('dotenv').config()
const { ethers } = require("ethers");
const utils = require('./utils')
const fetch = require('node-fetch')

const BALS_PATH = './bals.csv'

async function collect() {
	const providerRpc = process.env.ETH_RPC_CTF
	const ctfProvider = new ethers.providers.JsonRpcProvider(providerRpc)
	ctfProvider.connection.timeout = 120000

    const ctfWallet = new ethers.Wallet(process.env.CTF_PK, ctfProvider)
	console.log(ctfWallet.address)
	let contracts = utils.getContracts(BALS_PATH)

	// const lastCollected = '0x3b454e25cc00d3b0259df105900e39365bb7f321'
	// const index = contracts.indexOf(lastCollected)
	// contracts = contracts.slice(index+1)

	for (let c of contracts) {
		console.log(c)
		while (1) {
			try {
				let nonce = await ctfWallet.getTransactionCount()
				const sig = await ctfWallet.sendTransaction({
					to: c, 
					data: '0x', 
					value: 0, 
					nonce: nonce,
					gasLimit: 50000,
					chainId: 1,
					gasPrice: 50e9,
				})
				console.log(sig)
				break
			} catch (e) {
				console.log(e)
				await utils.sleep(2000)
			}
		}
		utils.sleep(10)
	}
	// console.log(contracts.length)
	// let nonce = 0
	// const batchSize = 10
	// for (let i=0; i < contracts.length; i+=batchSize) {
	// 	console.log(i)
	// 	const batch = contracts.slice(i, i+batchSize)
	// 	console.log('getting nonce')
	// 	// const nonce = await ctfProvider.getTransactionCount(ctfWallet.address)
	// 	console.log("signing batch")
	// 	const txs = await Promise.all(batch.map((c, i) => {
	// 		console.log(c)
	// 		return ctfWallet.signTransaction({
	// 			to: c,
	// 			data: '0x',
	// 			value: 0,
	// 			nonce: nonce + i,
	// 			gasLimit: 50000,
	// 			chainId: 1,
	// 			gasPrice: 50e9,
	// 		})
	// 	}))
	// 	console.log('sending batch')
	// 	await sendRawBatch(providerRpc, txs)
	// 	await utils.sleep(2000)
	// 	nonce += batchSize
	// }
}

async function sendRawBatch(providerRpc, txs) {
	const payload = txs.map((tx, i) => {
		return {
			jsonrpc: '2.0',
			id: i,
			method: 'eth_sendRawTransaction',
			params: [tx],
		}
	})
	console.log(payload)
	console.log(providerRpc, providerRpc)
	const res = await fetch(providerRpc, {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: { 'Content-Type': 'application/json' },
	})
	console.log(res)
}

collect()