import Router from "koa-router"
import AdminWithdrawalController from "./adminWithdrowal.controller"
import { AdminAuth, ManagerAuth } from "../../middlewares"

const router = new Router({ prefix: "/adminwithdrawal" })

router
    .post('/createAdminWithdrawal', ManagerAuth, AdminWithdrawalController.createAdminWithdrawal)
    .post('/manual', ManagerAuth, AdminWithdrawalController.withdrawalManual)
    .get('/adminWithdrawalList', ManagerAuth, AdminWithdrawalController.adminWithdrawalsList)
    
export default router.routes()
