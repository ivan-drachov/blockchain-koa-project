import Router from "koa-router"
import AuthController from "./auth.controller"
import { Auth } from "../../middlewares"
const router = new Router({ prefix: "/auth" })

router
    .get ('/getSignaturePhrase', AuthController.getSignaturePhrase)
    .post('/connectWallet', AuthController.connectWallet)
    .get('/me', Auth, AuthController.me)
export default router.routes()
