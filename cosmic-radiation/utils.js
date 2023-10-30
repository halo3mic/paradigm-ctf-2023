const fs = require('fs')


exports.sleep = async () => {
	return new Promise(resolve => setTimeout(resolve, 1000))
}

exports.getContracts = (path) =>  {
	const file = fs.readFileSync(path).toString()
	return file.split('\n').map(line => {
		const [ ,address,,,,, ] = line.split(',')
		return address
	}).slice(1)

}

exports.findFlips = (orgCode, replacement) => {
	var newCodePart = BigInt(replacement).toString(2)
	var orgCodePart = BigInt(orgCode.slice(0, replacement.length)).toString(2)
	const longer = Math.ceil(newCodePart.length / 8) * 8
	newCodePart = newCodePart.padStart(longer, '0')
	orgCodePart = orgCodePart.padStart(longer, '0')

	const flips = []
	for (let i = 0; i < orgCodePart.length; i++) {
		if (orgCodePart[i] !== newCodePart[i]) {
		flips.push(i)
		}
	}
	return flips
}

exports.flipCode = (code, bits) => {
	for (const bit of bits) {
		const byte_offset = Math.floor(bit / 8)
		const bit_offset = 7 - bit % 8
		if (byte_offset < code.length) {
			code[byte_offset] ^= 1 << bit_offset
		}
	}
	return code
}
