import EventService from "./event.service"
const nodeCron = require("node-cron")

export default class CronService {

    static async raiseCronTasks() {
        nodeCron.schedule('*/10 * * * * *', async function(){
            console.log('Checking latest transfer events of smart contract...')
            await EventService.getLastTransferEvents()
        })
    }
}

