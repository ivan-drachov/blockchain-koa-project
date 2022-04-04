import { body, request, summary, tags } from "koa-swagger-decorator"
import { AuthService, UserService } from "../../services"
import { TokenUtil } from "../../utils"

const tag = tags(["auth"])

export default class AuthController {

    @request('get', '/auth/getSignaturePhrase')
    @summary("Get phrase for signing")
    @tag
    static async getSignaturePhrase(ctx, next) {

        ctx.status = 200
        ctx.body = { success: true,data: { signaturePhrase: process.env.WEB3_MESSAGE } }

        await next()
    }

    @request('post', '/auth/connectWallet')
    @summary("Connect the wallet to AlphaCarbon")
    @body({
        address: { type: 'string', required: true },
        signature: { type: 'string', required: true },
    })
    @tag
    static async connectWallet(ctx, next) {

        const { request: { body: { address, signature } } } = ctx

        const status = await AuthService.checkSignature(address, signature)
        if (!status) {
            ctx.body = { success: false, message: 'Signature check failed.' }
            ctx.status = 400
            return ctx
        }

        let user
        const existingUser = await UserService.getUserByExternalAddress(address)

        if (!existingUser) {
            user = await AuthService.registerUser(address)
        } else {
            user = existingUser
        }

        const token = TokenUtil.generate({ userId: user.id })

        ctx.status = 200
        ctx.body = { success: true, data: { token, user } }

        await next()
    }

    @request('get', '/auth/me')
    @summary("Get wallet addresses")
    @tag
    static async me(ctx, next) {
        const { user } = ctx.state

        ctx.body = {
            success: true,
            data: {
                internalAddress: user.internalAddress,
                externalAddress: user.externalAddress
            }
        }

        await next()
    }
}

