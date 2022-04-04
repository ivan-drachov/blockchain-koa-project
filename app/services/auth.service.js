import Web3 from 'web3'
import db from "../../models"
import { HDWalletUtil } from "../utils"

const web3 = new Web3()

export default class AuthService {

    static async checkSignature(address, signature) {
        try {
            const recoveredAddress = web3.eth.accounts.recover(process.env.WEB3_MESSAGE, signature)
            return recoveredAddress.toLowerCase() === address.toLowerCase()

        } catch (e) {
            console.log(e)
        }
        return false
    }

    static async registerUser(address) {
        const user = await db.User.create({externalAddress: address})
        const userHDWallet = await HDWalletUtil.getHDWallet(user.id)
        user.internalAddress = await HDWalletUtil.getHDWalletAddress(userHDWallet)
        await user.save()
        return user
    }
}
