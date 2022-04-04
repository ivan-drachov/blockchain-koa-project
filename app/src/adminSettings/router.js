import Router from "koa-router"
import AdminSettingsController from "./adminSettings.controller"
import { ManagerAuth } from "../../middlewares"

const router = new Router({ prefix: "/admin" })

router
    .post('/setDefaultLimits', ManagerAuth, AdminSettingsController.setDefaultLimits)

export default router.routes()