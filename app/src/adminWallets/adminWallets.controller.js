import UserService from '../../services/user.service'
import {body, path, query, request, summary, tags} from "koa-swagger-decorator"
import {swaggerWalletSchema} from "./schemas"
import {regExp} from "../../utils/regexps"
import globalTokenConfig from "../../../config/tokenConfig"
import Web3 from "web3"
import tokenAbi from "../../../config/ERC20_ABI.json"
import WeiService from "../../services/wei.service"
import AdminWalletsService from "../../services/admin.wallets";
import WithdrawalService from '../../services/withdrawal.service'
import Withdrawal from '../../../models/Withdrawal'

const tag = tags(["wallets"])

export default class AdminWalletsController {

    @request('get', '/admin/wallets')
    @query({
        page: {type: 'number', description: 'page'},
        perPage: {type: 'number', description: 'Number of users per page'}
    })
    @summary('Get list of users')
    @tag

    static async listOfUsers(ctx, next) {

        let page = ctx.query.page || 1
        let perPage = ctx.query.perPage || 10
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

        let users = await UserService.getUsers(page, perPage)
        ctx.status = 200
        ctx.body = {success: true, data: {users:users.rows, page, perPage, totalCount: users.count}}

        await next()
    }

    @request('get', '/admin/wallets/details/{address}')
    @query({
        page: {type: 'number', description: 'page'},
        perPage: {type: 'number', description: 'Number of Wallets per page'},
        startDate:
            {type: 'string', description: 'Start date for filter list of wallets'},
        endDate:
            {type: 'string', description: 'End date for filter list of wallets'}
    })
    @path({address: {type: 'string', required: true, description: 'wallet address'}})
    @summary('Get details of wallet')
    @tag

    static async getUserDetails(ctx, next) {

        const address = ctx.params.address

        if (!address.match(regExp.walletAddress)) {
            console.error('Invalid address')
            ctx.body = {success: false, message: 'Invalid address.'}
            ctx.status = 400
            return ctx
        }

        const user = await UserService.getUserByInternalAddress(address)
        if (!user) {
            ctx.body = {success: false, message: 'ERROR!!! No wallet with such ID.'}
            ctx.status = 404
            return ctx
        }
        let page = ctx.query.page || 1
        let perPage = ctx.query.perPage || 10
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
        const details = await UserService.getDetails(user.internalAddress, page, perPage, startDate, endDate)
        const balances = await WithdrawalService.getUserBalancesById(user.id)
        ctx.status = 200
        ctx.body = {success: true, data: {details: details.rows, user: user, balances:balances.rows , totalBalances: balances.count, page, perPage, totalCount: details.count}}

        await next()

    }

    @request('get', '/admin/wallets/allDepositList')
    @query({
        page: {type: 'number', description: 'page'},
        perPage: {type: 'number', description: 'Number of Transfer Events per page'},
        startDate:
            {type: 'string', description: 'Start date for filter list of transfer events'},
        endDate: {type: 'string', description: 'End date for filter list of transfer events'}
    })
    @summary('Get user deposits list')
    @tag

    static async allDepositList(ctx, next) {

        let page = ctx.query.page || 1
        let perPage = ctx.query.perPage || 10
        let startDate = new Date(ctx.query.startDate ? ctx.query.startDate : '2001-01-01 09:30:02')
        let endDate = ctx.query.endDate ? new Date(ctx.query.endDate) : new Date()
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
        const details = await UserService.allDepositList(page, perPage, startDate, endDate)

        ctx.status = 200
        ctx.body = {success: true, data: {details: details.rows, page, perPage, totalCount: details.count}}

        await next()

    }

    @request('get', '/admin/wallets/balance/{address}')
    @path({address: {type: 'string', required: true, description: 'wallet address'}})
    @summary("Get balance")
    @tag

    static async getTokenBalances(ctx, next) {
        const address = ctx.params.address

        if (!address.match(regExp.walletAddress)) {
            console.error("address no valid")
        }

        const balances = await AdminWalletsService.getBalancesByAddress(address)

        ctx.status = 200
        ctx.body = {success: true, data: {balances}}

        await next()
    }

    @request('get', '/admin/wallets/withdrawals/{address}')
    @query({
        page: {type: 'number', description: 'page'},
        perPage: {type: 'number', description: 'Number of Transfer Events per page'},
        startDate: {type: 'string', description: 'Start date for filter list of transfer events'},
        endDate: {type: 'string', description: 'End date for filter list of transfer events'},
        status: {type: 'string', description: 'Status value for filter user withdrawals list'}
    })
    @path({address: {type: 'string', required: true, description: 'wallet address'}})
    @summary('Get wallet withdrawals list')
    @tag

    static async userWithdrawalsList(ctx, next) {

        let address = ctx.params.address

        if (!address.match(regExp.walletAddress)) {
            console.error('Invalid address')
            ctx.body = {success: false, message: 'Invalid address.'}
            ctx.status = 400
            return ctx
        }

        let page = ctx.query.page || 1
        let perPage = ctx.query.perPage || 10
        let startDate = ctx.query.startDate ? new Date(ctx.query.startDate): null
        let endDate = ctx.query.endDate ? new Date(ctx.query.endDate) : null
        let status = ctx.query.status
        if(status && status !== Withdrawal.STATUS_BAD_ADDRESS && status !==Withdrawal.STATUS_BAD_TOKEN_CHAIN &&
            status !==Withdrawal.STATUS_CREATED &&  status !==Withdrawal.STATUS_ERROR_SENDING &&
            status !==Withdrawal.STATUS_INSUFFICIENT_FUNDS && status !==Withdrawal.STATUS_SENDING &&
            status !==Withdrawal.STATUS_SENT){
                ctx.body = { success: false, message: "Invalid status" }
                ctx.status = 400
                return ctx
        }
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
        const details = await WithdrawalService.getWithdrawalsByAddress(address, status, page, perPage, startDate, endDate)

        ctx.status = 200
        ctx.body = {success: true, data: {details: details.rows, page, perPage, totalCount: details.count}}

        await next()
    }

    @request('get', '/admin/wallets/mapping')
    @summary('Get object with mapped configs')
    @tag

    static async getMappedObject(ctx, next) {

        let mapObject = await UserService.createMapObject()
        ctx.status = 200
        ctx.body = {success: true, data: mapObject}

        await next()
    }

}
