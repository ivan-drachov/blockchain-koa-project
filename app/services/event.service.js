import db from "../../models"
import sequelize from "sequelize"
import DepositService from "./depositService"
import {SleepUtil} from "../utils"
import UserService from "./user.service"
import settings from '../../config/settings.json'
import BigNumber from "bignumber.js"
import globalTokenConfig from '../../config/tokenConfig'
import tokenAbi from "../../config/ERC20_ABI.json"
import WeiService from "./wei.service"

BigNumber.config({ EXPONENTIAL_AT: 1e+9 })

const Web3 = require('web3')

export default class EventService {

    static async checkIsNeedToProceed(event, tokenCode, chainId) {
        const innerUser = await UserService.getUserByInternalAddress(event.returnValues.to)
        if (innerUser) {
            const existingEvent = await db.Deposit.findOne({
                where: {
                    hash: { [sequelize.Op.iLike]: event.transactionHash },
                    tokenCode: { [sequelize.Op.iLike]: tokenCode },
                    chainId: { [sequelize.Op.iLike]: chainId },
                }
            })
            return !existingEvent
        } else {
            return false
        }
    }

    static async saveBatchOfTransferEvents(batchTransferEvents, tokenCode, chainId) {
        for (let event of batchTransferEvents) {
            const isNeedToProceed = await EventService.checkIsNeedToProceed(event, tokenCode, chainId)
            if (isNeedToProceed) {
                const savedEvent = await EventService.saveEventData(event, tokenCode, chainId)
                await EventService.saveBalanceData(event, tokenCode, chainId)
                await SleepUtil.sleep(300)
                await DepositService.proceedSingleTransferEvent(savedEvent)
            }
        }
    }

    static async saveBalanceData(event, tokenCode, chainId) {
        const user = await UserService.getUserByInternalAddress(event.returnValues.to)
        const userBalance = await db.UserBalance.findOne({
            where: { userId: user.id, tokenCode: { [sequelize.Op.iLike]: tokenCode } }
        })
        let valueInNumber = await WeiService.WeiToNumber(tokenCode, chainId, event.returnValues.value)
        try {
            if (userBalance) {
                let currentBalance = new BigNumber(userBalance.balance)
                let addedBalance = new BigNumber(valueInNumber)
                let finalUserBalance = BigNumber.sum(currentBalance, addedBalance)
                userBalance.balance = finalUserBalance.toNumber()
                await userBalance.save()
                    .then(function () {
                        console.log("UserBalance with userId = " + user.id + " was updated successfully!")
                    })
                    .catch(function () {
                        console.log("Error.Couldn't update UserBalance in DB")
                    })
            } else {
                let userBalanceData = {
                    userId: user.id,
                    balance: valueInNumber,
                    dailyLimit: settings.dailyLimit,
                    tokenCode
                }
                await db.UserBalance.create(userBalanceData)
                    .then(function () {
                        console.log("New UserBalance inserted into DB successfully!")
                    })
                    .catch(function () {
                        console.log("Error.Couldn't insert new UserBalance into DB")
                    })
            }
        } catch (err) {
            console.error(`Error, while updating user balance`, err)
        }
        return userBalance
    }

    static async saveEventData(event, tokenCode, chainId) {
        let valueInNumber = await WeiService.WeiToNumber(tokenCode, chainId, event.returnValues.value )
        return await db.Deposit.create({
            body: event,
            status: "pending",
            sender: event.returnValues.from,
            receiver: event.returnValues.to,
            blockNumber: event.blockNumber,
            hash: event.transactionHash,
            amount: valueInNumber,
            chainId,
            tokenCode
        })
    }

    static async getLastTransferEvent(tokenCode, chainId) {
        return db.Deposit.findOne({where: {tokenCode, chainId}, order: [['blockNumber', 'DESC']]})
    }

    static async getLastTransferEvents() {
        for (const [tokenCode, connectedChains] of Object.entries(globalTokenConfig)) {

            for (const [chainId, tokenConfig] of Object.entries(connectedChains)) {
                try {
                    const chainConfig = tokenConfig["chainConfig"]
                    const web3 = new Web3(chainConfig.web3Provider)
                    const contract = new web3.eth.Contract(tokenAbi, tokenConfig.tokenContractAddress)
                    const lastTransferEvent = await this.getLastTransferEvent(tokenCode, chainId)

                    let START_BLOCK
                    if (lastTransferEvent){
                        START_BLOCK = lastTransferEvent.blockNumber
                    } else {
                        START_BLOCK = await web3.eth.getBlockNumber() - 100
                    }
                    const batchTransferEvents = await contract.getPastEvents('Transfer', {
                        fromBlock: START_BLOCK,
                    })

                    this.saveBatchOfTransferEvents(batchTransferEvents, tokenCode, chainId)
                } catch (e) {
                    console.error(`Error, while getting past events`, tokenCode, chainId)
                    console.error(e.message)
                }
            }
        }
        for (const tokenCode of globalTokenConfig) {
            for (const chainId of globalTokenConfig[tokenCode]) {

            }
        }
    }
}
