import { body, request, summary, tags, query } from "koa-swagger-decorator"
import AdminWithdrawalService from "../../services/admin.withdrawal.service" 
import { swaggerAdminWithdrawalSchema } from "./schemas"
import { regExp } from "../../utils/regexps"
import AdminWithdrawal from "../../../models/AdminWithdrawal"
import WithdrawalService from "../../services/withdrawal.service"

const tag = tags(["adminwithdrawal"])

export default class AdminWithdrawalController {


    @request('post', '/adminwithdrawal/createAdminWithdrawal')
    @summary('Withdrawal by admin')
    @body(swaggerAdminWithdrawalSchema)
    @tag

    static async createAdminWithdrawal(ctx, next) {
        const { request: { body: { tokenCode, chainId, userWithdrawalId, address, value, approvedBy, type } }, state: { user } } = ctx
        
        const newAdminWithdrawalContent = {
            type,
            adminId: user.id,
            userWithdrawalId,
            transactionHash: '',
            data: {},
            address,
            status: AdminWithdrawal.STATUS_CREATED,
            tokenCode,
            value,
            approvedBy,
            chainId
        }

        if (!userWithdrawalId) {
            ctx.body = { success: false, message: "User Withdrawal ID is invalid" }
            ctx.status = 400
            return ctx
        }
        const userWithdrawal = await WithdrawalService.getUserWithdrawalById(userWithdrawalId)
        if (!userWithdrawal){
            ctx.body = { success: false, message: "User Withdrawal with such ID not found" }
            ctx.status = 404
            return ctx
        }
        
        if(type !== AdminWithdrawal.TYPE_HOT_WALLET_RECYCLE && type !== AdminWithdrawal.TYPE_TO_ADDRESS && type !== AdminWithdrawal.TYPE_WITHDRAW_APPROVE){
            ctx.body = { success: false, message: "invalid type" }
            ctx.status = 400
            return ctx
        }
        const checkCodeAndChain = AdminWithdrawalService.checkCodeAndChain(tokenCode, chainId)
        if (!checkCodeAndChain) {
            ctx.body = { success: false, message: AdminWithdrawal.STATUS_BAD_TOKEN_CHAIN }
            ctx.status = 400
            return ctx
        }
        if (!address || !address.match(regExp.walletAddress)) {
            ctx.body = { success: false, message: "invalid address" }
            ctx.status = 400
            return ctx
        }
        let result = await AdminWithdrawalService.createNewAdminWithdrawal(newAdminWithdrawalContent)

        ctx.status = 200
        ctx.body = { success: true, data: {result}, message: "New admin withdrawal created" }

        await next()
    }

    @request('post', '/adminwithdrawal/manual')
    @summary('Manual withdrawal by admin')
    @body({
        id: { type: 'number', required: true, example: 7, description: 'Id of User Withdrawal' },
        type: {type: 'string', required: true, example: AdminWithdrawal.TYPE_TO_ADDRESS}
    })
    @tag

    static async withdrawalManual(ctx, next) {

        const { request: { body: { id, type } }, state: { user } } = ctx
        const userWithdrawal = await WithdrawalService.getUserWithdrawalById(id)
        if (!userWithdrawal) {
            ctx.body = { success: false, message: "No user Withdrawal with such Id" }
            ctx.status = 404
            return ctx
        }
        
        const newAdminWithdrawalContent = {
            type,
            adminId: user.id,
            userWithdrawalId: id,
            transactionHash: userWithdrawal.transactionHash,
            data: userWithdrawal.data,
            address: userWithdrawal.address,
            status: AdminWithdrawal.STATUS_CREATED,
            tokenCode: userWithdrawal.tokenCode,
            value: userWithdrawal.value,
            approvedBy: userWithdrawal.approvedBy,
            chainId: userWithdrawal.chainId
        }

        let transaction
        const adminWithdrawal = await AdminWithdrawalService.createNewAdminWithdrawal(newAdminWithdrawalContent)

        if(!adminWithdrawal){
            ctx.body = { success: false, message: "Creating of linked Admin Withdrawal is failed" }
            ctx.status = 500
            return ctx
        }
        try {
            
            const sufficientBalance = await AdminWithdrawalService.checkSufficientBalance(adminWithdrawal.address, adminWithdrawal.value, adminWithdrawal.tokenCode, adminWithdrawal.chainId)

            if (!sufficientBalance) {
                await adminWithdrawal.update({ status: AdminWithdrawal.STATUS_INSUFFICIENT_FUNDS })
                ctx.body = { success: false, message: AdminWithdrawal.STATUS_INSUFFICIENT_FUNDS }
                ctx.status = 404
                return ctx
            } else {
                transaction = await AdminWithdrawalService.withdrawalOfFunds(adminWithdrawal.tokenCode.toUpperCase(), adminWithdrawal.address, 
                    adminWithdrawal.chainId, adminWithdrawal.value, adminWithdrawal)
                await adminWithdrawal.update({ transactionHash: transaction.transactionHash })
            }

            if (transaction.status === true) {
                await AdminWithdrawalService.updateBalance(user.id, adminWithdrawal.value, adminWithdrawal.tokenCode)
                await adminWithdrawal.update({ status: AdminWithdrawal.STATUS_SENDING })
            } else {
                ctx.body = { success: false, message: "transaction output false" }
                await adminWithdrawal.update( { status: AdminWithdrawal.STATUS_ERROR_SENDING })
                ctx.status = 404
                return ctx
            }
        } catch (e) {
            await adminWithdrawal.update({ status: AdminWithdrawal.STATUS_ERROR_SENDING })
            console.error(e)
        }

        await adminWithdrawal.update({ status: AdminWithdrawal.STATUS_SENT })

        let hashTransaction = transaction.transactionHash

        ctx.status = 200
        ctx.body = { success: true, data: { hashTransaction }, message: "funds withdrawn, balance updated" }
        await next()
    }

    @request('get', '/adminwithdrawal/adminWithdrawalList')
    @query({
        page: {type: 'number', description: 'page'},
        perPage: {type: 'number', description: 'Number of Admin Withdrawals per page'},
        startDate:
            {type: 'string', description: 'Start date for filter list of admin withdrawals'},
        endDate: {type: 'string', description: 'End date for filter list of admin withdrawals'},
        status: {type: 'string', description: 'Type value for filter list of admin withdrawals', example: 'created'}
    })
    @summary('Get admin withdrawals list')
    @tag

    static async adminWithdrawalsList(ctx, next) {

        let page = ctx.query.page || 1
        let perPage = ctx.query.perPage || 10
        let status = ctx.query.status
        if(status && status !== AdminWithdrawal.STATUS_BAD_ADDRESS && status !==AdminWithdrawal.STATUS_BAD_TOKEN_CHAIN && 
            status !==AdminWithdrawal.STATUS_CREATED &&  status !==AdminWithdrawal.STATUS_ERROR_SENDING && 
            status !==AdminWithdrawal.STATUS_INSUFFICIENT_FUNDS && status !==AdminWithdrawal.STATUS_SENDING && 
            status !==AdminWithdrawal.STATUS_SENT){
                console.log('STATUS: '+status)
                ctx.body = { success: false, message: "Invalid status" }
                ctx.status = 400
                return ctx
        }
        let startDate = ctx.query.startDate? new Date(ctx.query.startDate): null
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
        const details = await AdminWithdrawalService.getAdminWithdrawals(status, page, perPage, startDate, endDate)

        ctx.status = 200
        ctx.body = {success: true, data: {details: details.rows, page, perPage, totalCount: details.count}}

        await next()

    }
  
}
