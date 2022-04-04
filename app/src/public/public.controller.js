import { request, summary, tags } from "koa-swagger-decorator"
const tag = tags(["public"])
import tokenConfig from '../../../config/tokenConfig'
import chainConfig from '../../../config/chainConfig'

export default class PublicController {

    @request('get', '/public/chains')
    @summary("Get active chains")
    @tag
    static async getActiveChains(ctx, next) {
        ctx.body = { success: true, data: { chainConfig } }
        await next()
    }

    @request('get', '/public/tokens')
    @summary("Get active tokens")
    @tag
    static async getActiveTokens(ctx, next) {
        ctx.body = { success: true, data: { tokenConfig } }
        await next()
    }

    @request('get', '/public/networks')
    @summary("Get active networks")
    @tag
    static async getTokensByNetwork(ctx, next) {
        const tc = JSON.parse(JSON.stringify(tokenConfig))
        const cc = JSON.parse(JSON.stringify(chainConfig))
        const result = []

        for (const [globalChainId, globalTokenConfig] of Object.entries(cc)) {
            globalTokenConfig.tokens = []
            for (const [tokenCode, connectedChains] of Object.entries(tc)) {
                for (const [chainId, tokenConfig] of Object.entries(connectedChains)) {
                    if (globalChainId === chainId) {
                        delete tokenConfig['chainConfig'];
                        globalTokenConfig.tokens.push(tokenConfig)
                    }
                }
            }
            result.push(globalTokenConfig)
        }

        ctx.body = { success: true, data: { chainConfig: result } }
        await next()
    }
}

