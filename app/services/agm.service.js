import db from "../../models"
import sequelize from "sequelize"
import Web3 from "web3"
import globalTokenConfig from '../../config/tokenConfig'
import tokenAbi from "../../config/ERC20_ABI.json"
import WeiService from "./wei.service"
import AirGappedAction from "../../models/AirGappedAction"

export default class AgmService {

    static async createNewAGA(content) {
        return db.AirGappedAction.create(content)
    }

    static async setAGAStatus(uuid, status){
        try{
            let updated_aga = await db.AirGappedAction.findOne({
                where: {uuid}
            })
            updated_aga.update({
                status: status
              }).then(function() {console.log("AGA transaction status was updated successfully!")})

        }catch(err){
            console.error(`Error, while updating AGA status`, err)
        }

    }

    static async getAgaById(id) {
        return db.AirGappedAction.findOne({
            where: { id }
        })
    }

    static async deleteAction(id){
        return db.AirGappedAction.destroy({
            where: {id}
            }
          )
    }

    static async airGappedactionList( page, perPage, startDate, endDate, tokenCode) {
        let query =  {
            where: { },
            order: [['id', 'DESC']]
        }
        if(startDate) query.where.createdAt = {[sequelize.Op.gte]: startDate}
        if(endDate) query.where.createdAt = {[sequelize.Op.lte]: endDate}
        if(tokenCode) query.where.tokenCode = {[sequelize.Op.iLike]: tokenCode}
        if(page && perPage) query.offset = (page - 1) * perPage
        if(perPage) query.limit = perPage

        return await db.AirGappedAction.findAndCountAll(query)
    }

    static async getAgaListByIds(ids) {
        console.log(ids)
        if (ids) {
            let list
            if (Array.isArray(ids)) {
                list = ids
            } else {
                list = [ids]
            }
            let query =  {
                where: { id: {[sequelize.Op.in]: list}},
                order: [['id', 'ASC']]
            }
            return db.AirGappedAction.findAll(query)
        }
        return []
    }

    static async makeTransactionList(listOfAGA, ctx){

        let transactionList = []

        let count = 0
        let transaction = null
        for (let aga of listOfAGA) {
            const agaDB = await AgmService.getAgaByUuid(aga.uuid)
            const tokenConfig = globalTokenConfig[agaDB.tokenCode][agaDB.chainId]
            const chainConfig = tokenConfig["chainConfig"]
            const web3 = new Web3(chainConfig.web3Provider)
            let nonce = await web3.eth.getTransactionCount(process.env.COLD_W_ADDRESS, 'pending')
            if(aga.action === 'token_transfer'){
                try{
                    transaction = await AgmService.getTransactionFromAGA(aga, nonce+count, tokenConfig, chainConfig, agaDB.tokenCode, agaDB.chainId)
                }catch(err){
                    console.log(err.message)
                    ctx.status = 500
                    ctx.body = { success: false, message: 'Can not get valid nonce because there are some unmained transactions in blockchain ID = '+agaDB.chainId }
                    return ctx
                }
                
                if(transaction){
                    transactionList.push(transaction)
                    AgmService.setAGAStatus(aga.uuid, AirGappedAction.STATUS_EXPORTED)
                }else{
                    AgmService.setAGAStatus(aga.uuid, AirGappedAction.STATUS_EXPORT_ERROR)
                }

            }
            if(aga.action === 'native_transfer'){
                try{
                    transaction = await AgmService.getTransactionFromAGANative(aga, nonce+count, chainConfig, agaDB.tokenCode, agaDB.chainId)
                }catch(err){
                    console.log(err.message)
                    ctx.status = 500
                    ctx.body = { success: false, message: 'Can not get valid nonce because there are some unmained transactions in blockchain ID = '+agaDB.chainId }
                    return ctx
                }
                
                if(transaction){
                    transactionList.push(transaction)
                    AgmService.setAGAStatus(aga.uuid, AirGappedAction.STATUS_EXPORTED)
                }else{
                    AgmService.setAGAStatus(aga.uuid, AirGappedAction.STATUS_EXPORT_ERROR)
                }
            }
            count++
        }

        return transactionList
    }

    static async getTransactionFromAGA(aga, nonce, tokenConfig, chainConfig, tokenCode, chainId){

        const web3 = new Web3(chainConfig.web3Provider)
        let valueTokens = WeiService.NumbersToWei(tokenCode, chainId, aga.value)
        const contract = new web3.eth.Contract(tokenAbi, tokenConfig.tokenContractAddress)
        const contractTransferData = (contract.methods.transfer(aga.receiver, web3.utils.toHex(valueTokens))).encodeABI()

        let gasPrice = (await web3.eth.getGasPrice() * 1.30).toFixed(0)
        const outputTransaction = {
            gasPrice: web3.utils.toHex(gasPrice.toString()),
            to: tokenConfig.tokenContractAddress,
            data: contractTransferData,
            nonce: nonce
        }
    
        const copy = JSON.parse(JSON.stringify(outputTransaction))
        if (chainConfig.chainId === '31337'|| "13370") copy.from = process.env.COLD_W_ADDRESS
        if (chainConfig.chainId !== '31337') outputTransaction.gasLimit = web3.utils.toHex(300000)
        if (chainConfig.chainId === '31337' || "13370") outputTransaction.gas = await web3.eth.estimateGas(copy) * 2

        const res = {
            "uuid": aga.uuid,
            "rawTransactionObject": outputTransaction
        }
        return res
    }

    static async getTransactionFromAGANative(aga, nonce, chainConfig, tokenCode, chainId){

        const web3 = new Web3(chainConfig.web3Provider)
        let gasPrice = (await web3.eth.getGasPrice() * 1.30).toFixed(0)
        let valueWei = WeiService.NumbersToWei(tokenCode, chainId, aga.value)
        const rawTransaction = {
            gasPrice: web3.utils.toHex(gasPrice.toString()),
            to: aga.receiver,
            from: process.env.COLD_W_ADDRESS,
            value: web3.utils.toHex(valueWei),
            nonce: nonce
        }
        const copy = JSON.parse(JSON.stringify(rawTransaction))

        if (chainConfig.chainId !== '31337') rawTransaction.chainId = chainConfig.chainId
        if (chainConfig.chainId === '3' || "80001") rawTransaction.gasLimit = web3.utils.toHex(300000)
        if (chainConfig.chainId === '31337' || "80001")  rawTransaction.gas = await web3.eth.estimateGas(copy) * 2

        const res = {
            "uuid": aga.uuid,
            "rawTransactionObject": rawTransaction
        }
        return res
    }

    static getDateString() {
        const date = new Date();
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day =`${date.getDate()}`.padStart(2, '0');
        return `${year}${month}${day}`
      }

    static async makeSignTransaction(unsignedTransArr){

        try{
            const privateKey = process.env.COLD_W_PK
            const trDB = await AgmService.getAgaByUuid(unsignedTransArr["uuid"])
            let tokenCode = trDB.tokenCode
            let chainId = trDB.chainId

            const tokenConfig = globalTokenConfig[tokenCode][chainId]

            const chainConfig = tokenConfig["chainConfig"]
            const web3 = new Web3(chainConfig.web3Provider)
            const signT = await web3.eth.accounts.signTransaction(unsignedTransArr['rawTransactionObject'], privateKey)
            let res = {
                "uuid": unsignedTransArr.uuid,
                "rawTransactionObject": unsignedTransArr["rawTransactionObject"],
                "signedTransaction": signT
            }

          return res
        }
        catch(e){
            console.log(e)
        }
    }

    static getTokenCodeByAddress(address, chainId){
        let code
        let globalToken = globalTokenConfig

        for (let element of Object.values(globalToken)){
            if(element.hasOwnProperty(chainId.toString())){

                if(element[chainId.toString()].tokenContractAddress === address){

                     code = element[chainId.toString()].tokenCode

                }
                break
            }
        };
        return code;
    }
    static async updateStatusOfSignedAGAs(arr, stat){
        await db.AirGappedAction.update(
            { status: stat },
            {
              where: {
                uuid: arr,
              },
            }
          );
    }

    static async sendSignTransaction(signedTxObject){
        const trDB = await AgmService.getAgaByUuid(signedTxObject["uuid"])
        const tokenCode = trDB.tokenCode
        const chainId = trDB.chainId
        const tokenConfig = globalTokenConfig[tokenCode][chainId]
        const chainConfig = tokenConfig["chainConfig"]

        try {
            const web3 = new Web3(chainConfig.web3Provider)

                console.log(`Transaction with chainId = ${chainId} and tokenCode = ${tokenCode} and value = ${trDB.value} is pending...`)

                const transaction = await web3.eth.sendSignedTransaction(signedTxObject["signedTransaction"].rawTransaction)
                console.log(`Transaction withdrawal success, you transaction hash ${ transaction.transactionHash }`)

                return transaction.transactionHash
        } catch (e) {
            console.error(e)
        }

    }

    static async getAgaByUuid(uuid){
        return await db.AirGappedAction.findOne({
            where: {uuid}
        })
    }
}
