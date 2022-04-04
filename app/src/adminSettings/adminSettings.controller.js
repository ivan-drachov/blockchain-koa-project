import { request, body, tags, summary } from "koa-swagger-decorator"

const tag = tags(["settings"])
const fs = require('fs')

export default class AdminSettingsController {

    @request('post', '/admin/setDefaultLimits')
    @body({
        limit: { type: 'number', example: 100, required: true }
    })
    @summary('Edit default settings')
    @tag

    static async setDefaultLimits(ctx, next){

        const { request: { body: { limit } } } = ctx

        const content = {
            dailyLimit: limit
        };

        const data = JSON.stringify(content, null, 2);

        fs.writeFile('./config/settings.json', data, 'utf8',(err) => {
            if (err) {
                console.log(err)
                ctx.status = 500
                ctx.body = { success: false, message: "dailyLimit was NOT edited."}
            }
            console.log('Daily limit was updated.');
        });

        ctx.status = 200
        ctx.body = { success: true, message: "dailyLimit was rewritten successfully."}

        await next()
    }


}
