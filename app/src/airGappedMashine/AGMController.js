import { request, body, tags, summary, path, params, query, formData } from "koa-swagger-decorator"
import AgmService from '../../services/agm.service'
import AirGappedAction from "../../../models/AirGappedAction"
import { v4 as uuidv4 } from 'uuid'
import globalTokenConfig from "../../../config/tokenConfig"

const fs = require('fs')
const pathObj = require('path')
const tag = tags(["agm"])

export default class AGMController {

    @request('post', '/agm/createAirGappedAction')
    @body({
        action: { type: 'string', example: 'native_transfer', required: true },
        sender: { type: 'string', example: '0xE399C86c2370cCe714841e4d869e61450CD9f9de', required: true},
        receiver: { type: 'string', example: '0xAA595A36b94D3230961E645733CA6fFc73A6123F', required: true},
        tokenCode: { type: 'string', example: 'USDT' },
        chainId: {type: 'string', example: '3', required: true},
        value: { type: 'number', example: 10.75, required: true},
        data: { type: 'object', example: {}}
    })
    @summary('Create new Air Gapped Action')
    @tag

    static async createAirGappedAction(ctx, next) {
        try {
            const {request: {body: {action, sender, receiver, tokenCode, value, transactionHash, data, chainId}}} = ctx
            const newAGAContent = {
                uuid: uuidv4(),
                action,
                sender,
                receiver,
                status: AirGappedAction.STATUS_CREATED,
                tokenCode,
                value,
                transactionHash,
                data,
                chainId
            }

            if (!chainId) {
                ctx.body = {success: false, message: "invalid chain"}
                ctx.status = 400
                return ctx
            }
            if (tokenCode) {
                const tokenConfig = globalTokenConfig[tokenCode][chainId]
                if (tokenCode !== tokenConfig.tokenCode) {
                    ctx.body = {success: false, message: "invalid token"}
                    ctx.status = 400
                    return ctx
                }
            }
            if (!receiver) {
                ctx.body = {success: false, message: "invalid receiver"}
                ctx.status = 400
                return ctx
            }

            let result = await AgmService.createNewAGA(newAGAContent)
            ctx.status = 200
            ctx.body = {success: true, data: {result}}
        } catch (e) {
            console.error(e)
        }
        await next()
    }

    @request('delete', '/agm/deleteAction/{id}')
    @path({ id: { type: 'number', required: true, description: 'Air Gapped Action ID' } } )
    @summary('Delete Air Gapped Action by ID')
    @tag

    static async deleteAga(ctx, next){

        const id = ctx.params.id
        const action = await AgmService.getAgaById(id)
        if(!action) {
            ctx.body = { success: false, message: 'ERROR!!! No action with such ID.' }
            ctx.status = 404
            return ctx
        }
        const isDeleted = await AgmService.deleteAction(action.id)

        ctx.status = 200
        ctx.body = { success: true, data: {details: (isDeleted === 1)? `Action with ID = ${action.id} was deleted.` : `Deleting was failed` }}

        await next()

    }

    @request('get', '/agm/airGappedActionList')
    @query({page: {type: 'number', description: 'page'}, perPage: {type: 'number', description: 'Number of Air Gapped Actions per page'}, startDate:
    { type: 'string', description: 'Start date for filter list of air gapped actions'}, endDate: { type: 'string', description: 'End date for filter list of air grapped actions'},
    tokenCode: {type: 'string', description: 'Token code for filter'}})
    @summary('Get airgapped actions list')
    @tag
    static async airGappedActionList(ctx,next){

        let page = ctx.query.page
        let perPage = ctx.query.perPage
        let startDate = ctx.query.startDate ? new Date(ctx.query.startDate) : null
        let endDate = ctx.query.endDate ? new Date(ctx.query.endDate) : null
        let tokenCode = ctx.query.tokenCode || null
        if(page < 1) {
            ctx.body = { success: false, message: 'Page must be > 0.' }
            ctx.status = 400
            return ctx
        }
        if(perPage < 1) {
            ctx.body = { success: false, message: 'Value of perPage must be > 0.' }
            ctx.status = 400
            return ctx
        }

        const details = await AgmService.airGappedactionList(page, perPage, startDate, endDate, tokenCode)

        ctx.status = 200
        ctx.body = { success: true, data: { details: details.rows, page, perPage, totalCount: details.count} }

        await next()

    }

    @request('post', '/agm/export')
    @query({response_view: {type: 'string', required: false, example: 'json_string', description: 'What view of response required?'}})
    @body({
        listOfAGA: { type: 'array', example: [1,2,3], required: true }
    })
    @summary('Export selected AGA to JSON')
    @tag

    static async exportAGAtoJSON(ctx, next){
        const { request: {query: {response_view}, body: {listOfAGA}}} = ctx
        const details = await AgmService.getAgaListByIds(listOfAGA)

        const transactions = await AgmService.makeTransactionList(details, ctx)
        let response = JSON.stringify(transactions, null, 2)
        if(response_view === 'json_string') {response = JSON.stringify(response)}
        const filenameExt = AgmService.getDateString()
        let path = "./data/export_" +filenameExt +".json";

        await fs.writeFile(path, response, 'utf8',(err) => {
            if (err) {
                console.log(err)
                ctx.status = 500
                ctx.body = { success: false, message: "ERROR. Failed writing selected AGA into export file."}
                return ctx
            } else {
                console.log('Selected AGA were writted into export file.');
            }

        })
        const src = await (fs.createReadStream(path)).on('end', function() {
            fs.unlink(path, function() {
                console.log("Downloaded export file was deleted")
            });
        });
            ctx.response.set("content-type", 'application/json');
            ctx.response.set("content-disposition", "attachment; filename=export_"+filenameExt+".json");
            ctx.body = src;

        await next()
    }

    @request('post', '/agm/signUnsignedTxList')
    @formData({import_file: {type: 'file', required: true, description: 'JSON import file with unsigned transactions'}})
    @summary('Import selected AGA to JSON')
    @tag

    static async importJsonToAGM(ctx, next){

        const {path, type, name} = ctx.request.files.import_file
        if(pathObj.extname(name) !== '.json'){
            ctx.status = 400
            ctx.body = { success: false, message: "ERROR. Valid JSON file can be used only."}
            return ctx
        }
        const data = fs.readFileSync(path, 'utf8',(err) => {
            if (err) {
                console.log(err)
                ctx.status = 500
                ctx.body = { success: false, message: "ERROR. Failed reading selected AGA import file."}
                return ctx
            } else {
                console.log('Content of import file was read!!!');
            }

        })
        const cont = JSON.parse(data)
        const signedTxUuidArray = []
        const unsignedTxUuidArray = []
        const signedTransactionsArray = []
        for (let item of cont){
            try{
                const signT = await AgmService.makeSignTransaction(item)
                if(signedTransactionsArray.push(signT)){
                    signedTxUuidArray.push(signT["uuid"])
                }
            }catch(error){
                unsignedTxUuidArray.push(item["uuid"])
            }

        }
        await AgmService.updateStatusOfSignedAGAs(signedTxUuidArray, AirGappedAction.STATUS_SIGNED)
        await AgmService.updateStatusOfSignedAGAs(unsignedTxUuidArray, AirGappedAction.STATUS_SIGNED_ERROR)
        const filenameExt = AgmService.getDateString()
                let import_path = "./data/import_" +filenameExt +".json";

        fs.writeFile(import_path, JSON.stringify(signedTransactionsArray, null, 2), 'utf8',(err) => {
            if (err) {
                console.log(err)
                ctx.status = 500
                ctx.body = { success: false, message: "ERROR. Failed writing signed AGAs into import file."}
                return ctx
            } else {
                console.log('Signed AGAs were writted into import file.');
            }

        })
            const src = fs.createReadStream(import_path);
            ctx.response.set("content-type", 'application/json');
            ctx.response.set("content-disposition", "attachment; filename=import_"+filenameExt+".json");
            ctx.body = src

            await next()
    }

    @request('post', '/agm/sendSignedTxList')
    @formData({import_file: {type: 'file', required: true, description: 'JSON file with signed transactions'}})
    @summary('Send signed AGA list to blockchain')
    @tag

    static async sendSignedAGM(ctx, next){
        ctx.req.setTimeout(0);
        const {path, type, name} = ctx.request.files.import_file
        if(pathObj.extname(name) !== '.json'){
            ctx.status = 400
            ctx.body = { success: false, message: "ERROR. Valid JSON file can be used only."}
            return ctx
        }
        const data = fs.readFileSync(path, 'utf8',(err) => {
            if (err) {
                console.log(err)
                ctx.status = 500
                ctx.body = { success: false, message: "ERROR. Failed reading selected AGAs import list file."}
                return ctx
            } else {
                console.log('Content of signed AGAs import file list was read!!!');
            }

        })
        const cont = JSON.parse(data)

        const sentTransactionHashArray = []
        for (let item of cont){
            try{
                const signT = await AgmService.sendSignTransaction(item)
                sentTransactionHashArray.push(signT)
                AgmService.setAGAStatus(item["uuid"], AirGappedAction.STATUS_SENT)
            }catch(err){
                AgmService.setAGAStatus(item["uuid"], AirGappedAction.STATUS_SENT_ERROR)
                console.log(err)
            }

        }
        ctx.status = 200
        ctx.body = { success: true, data: {details: sentTransactionHashArray}, message: "Transactions with hash from these array were sent successfully"}

        await next()
    }
}
