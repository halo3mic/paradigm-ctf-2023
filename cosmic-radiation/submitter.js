require('dotenv').config()
const net = require('net');
const fs = require('fs');


const BITFLIPS_PATH = './bitflips'
const hostname = 'cosmic-radiation.challenges.paradigm.xyz';
const port = 1337;
const BITFLIPS_LIMIT = 1000
const token = process.env.CTF_TOKEN;
if (!token)
	throw new Error('CTF_TOKEN missing');

const client = net.createConnection({ port, host: hostname }, () => {
	console.log(`Connected to ${hostname}:${port}`);
});

client.setTimeout(300000);
const payloads = fs.readFileSync(BITFLIPS_PATH).toString().split(',').slice(0, BITFLIPS_LIMIT)
var payloadIndex = 0

client.on('data', async (data) => {
	const message = data.toString().trim();
	console.log(`Received: "${message}"`);

	if (message.startsWith('ticket?')) {
		const res = client.write(token + '\n');
		console.log('Sent:', res);
	} else if (message.endsWith('action?')) {
		const res = client.write('1\n');
		console.log('Sent:', res);
	} else if (message.startsWith('bitflip?') || message.endsWith('bitflip?')) {
		if (payloadIndex >= payloads.length) {
			console.log('no payload')
			client.write('\n');
		} else {
			const payload = payloads[payloadIndex]
			if (!payload) {
				console.log('no payload')
				client.write('\n');
			} else {
				const res = client.write(payload + '\n');
				console.log('payload:', payload)
				console.log(`${payloadIndex+1}/${payloads.length} Sent chunk: ${res ? 'Success' : 'Failure'}`);
				payloadIndex++
			}
		}
	
	}
});

client.on('end', () => {
	console.log('Connection closed');
});

client.on('error', (error) => {
	console.error('An error occurred:', error);
});
