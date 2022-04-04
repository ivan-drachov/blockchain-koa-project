import Web3 from "web3"
import db from "../../models"
import BigNumber from "bignumber.js"
import globalTokenConfig from '../../config/tokenConfig'
import tokenAbi from "../../config/ERC20_ABI.json"
import settings from "../../config/settings.json"
import WeiService from "./wei.service"
import Withdrawal from  "../../models/Withdrawal"
import sequelize from "sequelize"

export default class WithdrawalService {

    static async withdrawalOfFunds(tokenCode, address, chainId, value, withdrawal, attempts = 0){
        const tokenConfig = globalTokenConfig[tokenCode][chainId]
        const chainConfig = tokenConfig["chainConfig"]

        try {
            attempts++
            if (withdrawal.status === Withdrawal.STATUS_CREATED || Withdrawal.STATUS_ERROR_SENDING) {
                const web3 = new Web3(chainConfig.web3Provider)
                web3.eth.transactionBlockTimeout = 5

                let ValueInWei = await WeiService.NumbersToWei(tokenCode, chainId, value)
                let multiplierPercentage = 1.30
                if(withdrawal.status === "error"){ multiplierPercentage = 2 }

                let valueTokens = web3.utils.toHex(ValueInWei)
                const privateKey = process.env.HOT_W_PK
                const contract = new web3.eth.Contract(tokenAbi, tokenConfig.tokenContractAddress)
                const contractTransferData = (contract.methods.transfer(address, valueTokens)).encodeABI()
                let gasPrice = (await web3.eth.getGasPrice() * multiplierPercentage).toFixed(0)

                let  withdrawalTransaction = {
                    gasPrice: web3.utils.toHex(gasPrice.toString()),
                    to: tokenConfig.tokenContractAddress,
                    data: contractTransferData,
                    nonce: await web3.eth.getTransactionCount(process.env.HOT_W_ADDRESS, 'pending')
                }

                const copy = JSON.parse(JSON.stringify(withdrawalTransaction))
                if (chainConfig.chainId === '31337'|| "13370") copy.from = process.env.HOT_W_ADDRESS
                if (chainConfig.chainId !== '31337') withdrawalTransaction.gasLimit = web3.utils.toHex(300000)
                if (chainConfig.chainId === '31337' || "13370") withdrawalTransaction.gas = await web3.eth.estimateGas(copy) * 2

                const signedTransaction = await web3.eth.accounts.signTransaction(withdrawalTransaction, privateKey)
                console.log("Transaction withdrawal is pending...")

                const transaction = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                console.log(`Transaction withdrawal success, you transaction hash ${transaction.transactionHash}`)
                return transaction
            }
        } catch (e) {
            console.error(e)
            await withdrawal.update({ status: Withdrawal.STATUS_ERROR_SENDING })
            if (attempts < 5) {
                await WithdrawalService.withdrawalOfFunds(tokenCode, address, chainId, value, withdrawal)
            }
        }
    }

    static async getUserBalanceById(userId, tokenCode) {
        let balance = await db.UserBalance.findOne({ where: { userId, tokenCode } })
        if (!balance) {
            balance = await db.UserBalance.create({
                userId,
                balance: 0,
                dailyLimit: settings.dailyLimit,
                tokenCode
            })
        }
        return balance
    }

    static async getUserBalancesById(id) {
        return db.UserBalance.findAndCountAll({ where: { userId: id } })
    }

    static async createWithdrawal(withdrawalData) {
        return db.Withdrawal.create(withdrawalData)
    }

    static async checkSufficientBalance(userId, value, tokenCode) {
        const balance = await WithdrawalService.getUserBalanceById(userId, tokenCode)
        let userBalanceBN = new BigNumber(balance.balance)
        let valueBN = new BigNumber(value)
        return userBalanceBN.isGreaterThanOrEqualTo(valueBN)
    }

    static async updateBalance(userId, value, tokenCode) {
        const balance = await WithdrawalService.getUserBalanceById(userId, tokenCode)
        let userBalanceBN = new BigNumber(balance.balance)
        let valueBN = new BigNumber(value)
        const newBalance = userBalanceBN.minus(valueBN)

        await balance.update({ balance: newBalance.toFixed() })
    }

    static checkCodeAndChain(tokenCode, chainId) {
        const coinExists = globalTokenConfig[tokenCode]
        if (coinExists) {
            return !!coinExists[chainId]
        }
        return false
    }

    static async getUserWithdrawalById(id) {
        return db.Withdrawal.findOne({ where: { id } })
    }

    static async getWithdrawals(status, page, perPage, startDate, endDate) {

        let query =  {
            where: {},
            order: [['id', 'ASC']]
        }
        if(startDate) query.where.createdAt = {[sequelize.Op.gte]: startDate}
        if(endDate) query.where.createdAt = {[sequelize.Op.lte]: endDate}
        if(startDate && endDate) query.where.createdAt = {[sequelize.Op.gte]: startDate, [sequelize.Op.lte]: endDate}
        if(status) query.where.status = {[sequelize.Op.iLike]: status}
        if(page && perPage) query.offset = (page-1)*perPage
        if(perPage) query.limit = perPage

        return db.Withdrawal.findAndCountAll(query)
    }

    static async getWithdrawalsByAddress(addr, status, page, perPage, startDate, endDate) {

        let query =  {
            where:  {address: {[sequelize.Op.iLike]: addr}},
            order: [['id', 'ASC']]
        }
        if(startDate) query.where = {address : {[sequelize.Op.iLike]: addr},createdAt: {[sequelize.Op.gte]: startDate}}
        if(endDate) query.where = {address: {[sequelize.Op.iLike]: addr},createdAt: {[sequelize.Op.lte]: endDate}}
        if(startDate && endDate) query.where = {address : {[sequelize.Op.iLike]: addr},
            createdAt: {[sequelize.Op.gte]: startDate, [sequelize.Op.lte]: endDate}}
        if(status) query.where.status = {[sequelize.Op.iLike]: status}
        if(page && perPage) query.offset = (page-1)*perPage
        if(perPage) query.limit = perPage
        return db.Withdrawal.findAndCountAll(query)
    }
}
