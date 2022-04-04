import Router from "koa-router"
import AdminAuthController from "./adminAuth.controller"
import { AdminAuth, ManagerAuth } from "../../middlewares"
import { LoginLimiter, BaseLimiter, ForgotLimiter } from "../../middlewares"

const router = new Router({ prefix: "/admin" })

router
    .post('/register',AdminAuth, AdminAuthController.register)
    .post('/resendVerificationToken',AdminAuth, AdminAuthController.resendVerificationToken)
    .post('/login', LoginLimiter, AdminAuthController.login)
    .post('/forgotPassword', ForgotLimiter, AdminAuthController.forgotPassword)
    .post('/updatePassword', ManagerAuth, AdminAuthController.updatePassword)
    .post('/verifyGoogleAuth', ManagerAuth, AdminAuthController.verifyGoogleAuth)
    .post('/disableGoogleAuth', ManagerAuth, AdminAuthController.disableGoogleAuth)
    .get('/verifyEmail/:token', BaseLimiter, AdminAuthController.verifyEmail)
    .get('/getGoogleAuthCode', ManagerAuth, AdminAuthController.getGoogleAuthCode)
    .get('/me', ManagerAuth, AdminAuthController.adminInfo)
export default router.routes()
