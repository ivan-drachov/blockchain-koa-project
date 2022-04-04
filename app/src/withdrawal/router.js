import Router from "koa-router"
import WithdrawalController from "./withdrawal.controller"
import { Auth } from "../../middlewares"
const router = new Router({ prefix: "/withdrawal" })
import {  WithdrawalLimiter } from "../../middlewares"
import { ManagerAuth } from "../../middlewares"

router
    .post('/toAddress', WithdrawalLimiter, Auth, WithdrawalController.withdrawal)
    .get('/withdrawalList', ManagerAuth, WithdrawalController.getWithdrawalsList)

export default router.routes()
