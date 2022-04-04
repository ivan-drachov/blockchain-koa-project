import HDWallet from "ethereum-hdwallet"

export default class HDWalletUtil {

    static async getHDWallet(number) {
        const mnemonic = process.env.HD_WALLET_MNEMONIC
        const hdwallet = HDWallet.fromMnemonic(mnemonic)
        const motherWallet = hdwallet.derive(`m/44'/60'/0'/0`)
        if (typeof number === 'number' ) {
            if (Number.isInteger(number) && number > 0) {
                return motherWallet.derive(number)
            }
        }
        return motherWallet
    }

    static getHDWalletAddress(hdWallet){
        return `0x${ hdWallet.getAddress().toString('hex') }`
    }
}
