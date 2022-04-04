import 'dotenv/config'
import http from 'http'
import db from "../models"
import { app } from "./app"
import { SERVER } from "../config/app.config"
import CronService from './services/cron.service'

async function bootstrap() {
    await db.sequelize.authenticate()

    const server = http.createServer(app.callback())
    server.listen(SERVER.port)

    return { server, app }
}

bootstrap()
    .then(async (object) => {
        console.log(`🚀 Server listening on port ${object.server.address().port}!`)
        return object
    })
    .then(
        async (object) => {
            CronService.raiseCronTasks()
        }
    )
    .catch((err) => {
        setImmediate(() => {
            console.error("Unable to run the server because of the following error:")
            console.error(err)
            process.exit()
        })
    })

