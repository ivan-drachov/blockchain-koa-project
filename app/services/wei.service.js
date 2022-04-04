import globalTokenConfig from "../../config/tokenConfig"
import BigNumber from "bignumber.js"
BigNumber.config({ EXPONENTIAL_AT: 1e+9 })

export default class WeiService {
    static async WeiToNumber(tokenCode, chainId, value) {
        const tokenConfig = globalTokenConfig[tokenCode][chainId]
        let valueBN = new BigNumber(value)
        let decimalsBN = (new BigNumber(10)).exponentiatedBy(tokenConfig.decimals)
        return valueBN.dividedBy(decimalsBN).toNumber()
    }
    static async NumbersToWei(tokenCode, chainId, value) {
        const tokenConfig = globalTokenConfig[tokenCode][chainId]
        let valueBN = new BigNumber(value)
        let decimalsBN = (new BigNumber(10)).exponentiatedBy(tokenConfig.decimals)
        return valueBN.multipliedBy(decimalsBN).toString()
    }
}
