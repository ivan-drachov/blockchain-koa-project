import db from "../../models"
import { PasswordUtil, TokenUtil } from "../utils"
import globalTokenConfig from "../../config/tokenConfig";
import Web3 from "web3";
import tokenAbi from "../../config/ERC20_ABI.json";
import WeiService from "./wei.service";

export default class AdminWalletsService {

    static async getBalancesByAddress(address) {
        let balances = []

        for (const tokenCode in globalTokenConfig) {
            for (const chainId in globalTokenConfig[tokenCode]) {
                const tokenConfig = globalTokenConfig[tokenCode][chainId]
                const chainConfig = tokenConfig["chainConfig"]
                const web3 = new Web3(chainConfig.web3Provider)
                if (!balances.find(e => (e.chainId === chainId))){
                    const nativeBalance = {nativeToken: true, chainId: chainId}
                    nativeBalance.tokenCode = chainConfig.nativeCoinCode
                    nativeBalance.balance = web3.utils.fromWei(await web3.eth.getBalance(address), "ether")
                    balances.push(nativeBalance)
                }
                const tokenBalance = {nativeToken: false, chainId}
                const contract = new web3.eth.Contract(tokenAbi, tokenConfig.tokenContractAddress)
                const addressBalance = await (contract.methods.balanceOf(address)).call()
                tokenBalance.tokenCode = tokenCode
                tokenBalance.balance = await WeiService.WeiToNumber(tokenCode, chainId, addressBalance)

                balances.push(tokenBalance)
            }
        }

        return balances
    }
}
