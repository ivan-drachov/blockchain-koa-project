import Router from "koa-router"
import UserBalanceController from "./user.balance.controller"
import { Auth } from "../../middlewares"
const router = new Router({ prefix: "/user" })

router
    .get('/balance', Auth, UserBalanceController.GetUserBalance)
export default router.routes()
