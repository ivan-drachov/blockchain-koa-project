import Router from "koa-router"
import AGMController from "./AGMController"
import { ManagerAuth } from "../../middlewares"

const router = new Router({ prefix: "/agm" })

router
    .post('/createAirGappedAction', ManagerAuth, AGMController.createAirGappedAction)
    .delete('/deleteAction/:id', ManagerAuth, AGMController.deleteAga)
    .get('/airGappedActionList', ManagerAuth, AGMController.airGappedActionList)
    .post('/export', ManagerAuth, AGMController.exportAGAtoJSON)
    .post('/signUnsignedTxList', ManagerAuth, AGMController.importJsonToAGM)
    .post('/sendSignedTxList', ManagerAuth, AGMController.sendSignedAGM)

export default router.routes()
