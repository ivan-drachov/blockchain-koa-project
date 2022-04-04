import { request, summary, tags } from "koa-swagger-decorator"
import WithdrawalService from "../../services/withdrawal.service"

const tag = tags(["user"])

export default class UserBalanceController {

    @request('get', '/user/balance')
    @summary("Get user balance")
    @tag
    static async GetUserBalance(ctx, next) {
        const { state:{ user } } = ctx
        const balance = await WithdrawalService.getUserBalancesById(user.id)

        ctx.body = {
            success: true,
            data: { balance: balance.rows, totalCount: balance.count  } }
        await next()
    }
}

