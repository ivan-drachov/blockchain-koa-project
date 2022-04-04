import { TokenUtil } from "../utils"
import { AdminService } from "../services"

export default async (ctx, next) => {
    const token = ctx.headers.authorization

    if (!token) {
        ctx.status = 401
        ctx.body = { success: false, message: "TOKEN_NOT_PROVIDED." }
        return ctx
    }

    const decoded = TokenUtil.decode(token)

    if (!decoded) {
        ctx.status = 401
        ctx.body = { success: false, message: "TOKEN_NOT_VALID." }
        return ctx
    }

    if (!decoded.userId) {
        ctx.status = 401
        ctx.body = { success: false, message: "PERMISSION_DENIED." }
        return ctx
    }

    const user = await AdminService.getAdminById(decoded.userId)

    if (!user || !user.verified) {
        ctx.status = 401
        ctx.body = { success: false, message: "TOKEN_NOT_VALID." }
        return ctx
    }

    ctx.state.user = user
    await next()
}
