import { body, request, summary, tags, query } from "koa-swagger-decorator"
import WithdrawalService from "../../services/withdrawal.service"
import { swaggerWithdrawalSchema } from "./schemas"
import { regExp } from "../../utils/regexps"
import Withdrawal from  "../../../models/Withdrawal"

const tag = tags(["withdrawal"])

export default class WithdrawalController {

    @request('post', '/withdrawal/toAddress')
    @summary('Withdrawal of your funds')
    @body(swaggerWithdrawalSchema)
    @tag

    static async withdrawal(ctx, next) {

        const { request: { body: { tokenCode, chainId, address, value } }, state: { user } } = ctx

        const checkCodeAndChain = WithdrawalService.checkCodeAndChain(tokenCode, chainId)
        if (!checkCodeAndChain) {
            ctx.body = { success: false, message: "invalid token or chainId" }
            ctx.status = 400
            return ctx
        }
        let withdrawalData
        if (!address.match(regExp.walletAddress)) {
            console.error(Withdrawal.STATUS_BAD_ADDRESS)
        } else {
             withdrawalData = {
                tokenCode,
                chainId,
                address,
                userId: user.id,
                value,
            }
        }

        const withdrawal = await WithdrawalService.createWithdrawal(withdrawalData)
        let transaction
        try {
            const sufficientBalance = await WithdrawalService.checkSufficientBalance(user.id, value, tokenCode)

            if (!sufficientBalance) {
                await withdrawal.update({ status: Withdrawal.STATUS_INSUFFICIENT_FUNDS })
                ctx.body = { success: false, message: Withdrawal.STATUS_INSUFFICIENT_FUNDS }
                ctx.status = 404
                return ctx
            } else {
                transaction = await WithdrawalService.withdrawalOfFunds(tokenCode.toUpperCase(), address, chainId, value, withdrawal)
                await withdrawal.update({ transactionHash: transaction.transactionHash })
            }

            if (transaction.status === true) {
                await WithdrawalService.updateBalance(user.id, value, tokenCode)
                await withdrawal.update({ status: Withdrawal.STATUS_SENT })
            } else {
                ctx.body = { success: false, message: "transaction withdrawal false" }
                await withdrawal.update( { status: Withdrawal.STATUS_ERROR_SENDING })
                ctx.status = 404
                return ctx
            }
        } catch (e) {
            await withdrawal.update({ status: Withdrawal.STATUS_ERROR_SENDING })
            console.error(e)
        }

        await withdrawal.update({ status: Withdrawal.STATUS_SENT })

        let hashTransaction = transaction.transactionHash

        ctx.status = 200
        ctx.body = { success: true, data: { hashTransaction }, message: "funds withdrawn, balance updated" }

        await next()
    }

    @request('get', '/withdrawal/withdrawalList')
    @query({
        page: {type: 'number', description: 'page'},
        perPage: {type: 'number', description: 'Number of Withdrawals per page'},
        startDate:
            {type: 'string', description: 'Start date for filter list of withdrawals'},
        endDate: {type: 'string', description: 'End date for filter list of withdrawals'},
        status: {type: 'string', description: 'Type value for filter list of withdrawals', example: 'created'}
    })
    @summary('Get withdrawals list')
    @tag

    static async getWithdrawalsList(ctx, next) {

        let page = ctx.query.page || 1
        let perPage = ctx.query.perPage || 10
        let status = ctx.query.status
        if(status && status !== Withdrawal.STATUS_BAD_ADDRESS && status !==Withdrawal.STATUS_BAD_TOKEN_CHAIN && 
            status !==Withdrawal.STATUS_CREATED &&  status !==Withdrawal.STATUS_ERROR_SENDING && 
            status !==Withdrawal.STATUS_INSUFFICIENT_FUNDS && status !==Withdrawal.STATUS_SENDING && 
            status !==Withdrawal.STATUS_SENT){
                ctx.body = { success: false, message: "Invalid status" }
                ctx.status = 400
                return ctx
        }
        let startDate = ctx.query.startDate ? new Date(ctx.query.startDate) : null
        let endDate = ctx.query.endDate ? new Date(ctx.query.endDate) : null
        if (page < 1) {
            ctx.body = {success: false, message: 'Page must be > 0.'}
            ctx.status = 400
            return ctx
        }
        if (perPage < 1) {
            ctx.body = {success: false, message: 'Value of perPage must be > 0.'}
            ctx.status = 400
            return ctx
        }
        const details = await WithdrawalService.getWithdrawals(status, page, perPage, startDate, endDate)

        ctx.status = 200
        ctx.body = {success: true, data: {details: details.rows, page, perPage, totalCount: details.count}}

        await next()

    }
}
