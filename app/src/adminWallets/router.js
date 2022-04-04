import Router from "koa-router"
import AdminWalletsController from "./adminWallets.controller"
import { ManagerAuth } from "../../middlewares"

const router = new Router({ prefix: "/admin/wallets" })

router
    .get('/', ManagerAuth, AdminWalletsController.listOfUsers)
    .get('/details/:address', ManagerAuth, AdminWalletsController.getUserDetails)
    .get('/allDepositList', ManagerAuth, AdminWalletsController.allDepositList)
    .get('/balance/:address', ManagerAuth, AdminWalletsController.getTokenBalances)
    .get('/withdrawals/:address', ManagerAuth, AdminWalletsController.userWithdrawalsList)
    .get('/mapping', ManagerAuth, AdminWalletsController.getMappedObject)

export default router.routes()
