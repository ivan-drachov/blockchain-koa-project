import { request, body, tags, summary, path, params, query } from "koa-swagger-decorator"
import AdminService from '../../services/admin.service'


const tag = tags(["users"])

export default class AdminManagmentController {

    @request('get', '/admin/users')
    @query({page: {type: 'number', description: 'page'}, perPage: {type: 'number', description: 'Number of admins per page'} })
    @summary('Get list of admins')
    @tag

    static async listOfAdmins(ctx, next){
        
        let page = ctx.query.page || 1
        let perPage = ctx.query.perPage || 10
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

        let result = await AdminService.getAdmins(page, perPage)
        ctx.status = 200
        ctx.body = { success: true, data: { admins: result.rows, page, perPage, totalCount: result.count } }
        
        await next()
    }

    @request('delete', '/admin/users/{id}')
    @path({ id: { type: 'number', required: true, description: 'admin ID' } } )
    @summary('Delete Admin by ID')
    @tag

    static async deleteAdmin(ctx, next){

        const id = ctx.params.id
        const admin = await AdminService.getAdminById(id)
        if(!admin) {
            ctx.body = { success: false, message: 'ERROR!!! No admin with such ID.' }
            ctx.status = 404
            return ctx
        }
        const isDeleted = await AdminService.deleteAdmin(admin.id)

        ctx.status = 200
        ctx.body = { success: true, data: {details: (isDeleted === 1)? `Admin with ID = ${admin.id} was deleted.` : `Deleting was failed` }}
        
        await next()



    }
}