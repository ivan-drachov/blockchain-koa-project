import Router from "koa-router"
import AdminManagmentController from "./adminManagment.controller"
import { ManagerAuth } from "../../middlewares"

const router = new Router({ prefix: "/admin/users" })

router
    .get('/', ManagerAuth, AdminManagmentController.listOfAdmins)
    .delete('/:id', ManagerAuth, AdminManagmentController.deleteAdmin)

export default router.routes()