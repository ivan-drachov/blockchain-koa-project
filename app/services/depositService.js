import Web3 from "web3"
import { HDWalletUtil } from "../utils"
import UserService from "./user.service"
import globalTokenConfig from '../../config/tokenConfig'
import tokenAbi from "../../config/ERC20_ABI.json"
import Deposit from "../../models/Deposit"
import BigNumber from "bignumber.js"

export default class DepositService {

    static async sendGas(user, value, chainConfig, multiplierPercentage) {

        let sentStatus = false
        try {
            const web3 = new Web3(chainConfig.web3Provider)
            web3.eth.transactionBlockTimeout = 5
            const privateKey = process.env.HOT_W_PK

            let gasPrice = (await web3.eth.getGasPrice() * multiplierPercentage).toFixed(0)
            let rawTransaction = {
                gasPrice: web3.utils.toHex(gasPrice.toString()),
                to: user.internalAddress,
                from: process.env.HOT_W_ADDRESS,
                value: web3.utils.toHex(value),
                nonce: await web3.eth.getTransactionCount(process.env.HOT_W_ADDRESS, 'pending')
            }
            const copy = JSON.parse(JSON.stringify(rawTransaction))

            if (chainConfig.chainId !== '31337') rawTransaction.chainId = chainConfig.chainId
            if (chainConfig.chainId === '3' || "80001") rawTransaction.gasLimit = web3.utils.toHex(300000)
            if (chainConfig.chainId === '31337' || "80001")  rawTransaction.gas = await web3.eth.estimateGas(copy) * 2

            const signTransact = await web3.eth.accounts.signTransaction(rawTransaction, privateKey)
            console.log("Transaction gas is pending...")

            const transaction = await web3.eth.sendSignedTransaction(signTransact.rawTransaction)
            console.log(`Transaction gas success, you transaction hash ${transaction.transactionHash}`)

            sentStatus = transaction.status

        } catch (e) {
            console.error(e)
        }

        return sentStatus
    }

    static async proceedSingleTransferEvent(event, attempts = 0) {
        try {
            attempts++
            if (event.status === Deposit.STATUS_CREATED || Deposit.STATUS_ERROR) {

                const tokenConfig = globalTokenConfig[event.tokenCode][event.chainId]
                const chainConfig = tokenConfig["chainConfig"]
                const web3 = new Web3(chainConfig.web3Provider)
                web3.eth.transactionBlockTimeout = 5

                let multiplierPercentage = Number(1.30)
                if(event.status === Deposit.STATUS_ERROR) multiplierPercentage = Number(2)

                const user = await UserService.getUserByInternalAddress(event.receiver)
                const ACInternalAddress = user.internalAddress
                const UserHdWallet = await HDWalletUtil.getHDWallet(user.id)
                const UserPrivateKey = UserHdWallet.getPrivateKey().toString('hex')

                const contract = new web3.eth.Contract(tokenAbi, tokenConfig.tokenContractAddress)
                const balanceInternalAddress = await (contract.methods.balanceOf(ACInternalAddress)).call()
                const contractTransferData = (contract.methods.transfer(process.env.HOT_W_ADDRESS, balanceInternalAddress)).encodeABI()
                let gasPrice = (await web3.eth.getGasPrice() * multiplierPercentage).toFixed(0)

                let ACTransaction = {
                    gasPrice: web3.utils.toHex(gasPrice.toString()),
                    to: tokenConfig.tokenContractAddress,
                    data: contractTransferData,
                }

                const copy = JSON.parse(JSON.stringify(ACTransaction))
                if (chainConfig.chainId === '31337'|| "13370"){
                    copy.from = process.env.HOT_W_ADDRESS
                    copy.nonce = await web3.eth.getTransactionCount(process.env.HOT_W_ADDRESS, 'pending')
                } else {
                    copy.from = ACInternalAddress
                    copy.nonce = await web3.eth.getTransactionCount(ACInternalAddress, 'pending')
                }

                if (chainConfig.chainId === '3' || "80001") ACTransaction.gasLimit = web3.utils.toHex(300000)
                if (chainConfig.chainId === '31337') ACTransaction.gas = await web3.eth.estimateGas(copy) * 2

                ACTransaction.from = ACInternalAddress
                ACTransaction.nonce = await web3.eth.getTransactionCount(ACInternalAddress, 'pending')

                let gasSent = true
                let value
                let balanceInternalAddressInETH = await web3.eth.getBalance(ACInternalAddress)
                const amountOfGas = await this.estimateValue(ACTransaction, ACInternalAddress, web3)
                if (chainConfig.chainId === '31337' || '13370') value = amountOfGas * 2

                 if ((new BigNumber(amountOfGas)).isGreaterThanOrEqualTo(balanceInternalAddressInETH)) {
                    gasSent = await this.sendGas(user, value, chainConfig, multiplierPercentage)
                 }
                if (gasSent === true) {

                    await event.update({ status: Deposit.TRANSACTION_GAS_SUCCESS })

                    const signedTransaction = await web3.eth.accounts.signTransaction(ACTransaction, UserPrivateKey)
                    console.log("Transaction token is pending...")


                    const transaction = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                    console.log(`Transaction token success, you transaction hash ${transaction.transactionHash}`)

                    if (transaction.status === true) {
                        await event.update({ status: Deposit.TRANSACTION_TOKEN_SUCCESS })
                    } else {
                        await event.update({ status: Deposit.TRANSACTION_TOKEN_FAILED })
                    }
                    return transaction.status
                } else {
                    await event.update({ status: Deposit.TRANSACTION_GAS_FAILED })
                    console.error("Transaction gas failed")
                    multiplierPercentage = Number(1.50)
                    await this.sendGas(user, amountOfGas, chainConfig, multiplierPercentage)
                }
            }
        } catch (e) {
            console.error(e.message)
            await event.update({ status: Deposit.STATUS_ERROR })
            if (attempts < 5) {
                await DepositService.proceedSingleTransferEvent(event, attempts)
            }

        }
    }

    static async estimateValue(ACTransaction, UserInternalAddress, web3) {
        let gasPrice = (await web3.eth.getGasPrice() * 1.30).toFixed(0)
        let estimateGas = 50000
        try {
            const copy = JSON.parse(JSON.stringify(ACTransaction))
            copy.from = UserInternalAddress
            estimateGas = await web3.eth.estimateGas(copy)
        } catch (e) {
            console.error(e.message)
        }
        return (estimateGas * gasPrice)
    }
}
