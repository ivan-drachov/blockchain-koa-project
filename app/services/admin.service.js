import db from "../../models"
import { PasswordUtil, TokenUtil } from "../utils"

export default class AdminService {

    static async getAdminById(id) {
        return db.Admin.findOne({
            where: { id }
        })
    }

    static async createAdmin(userData) {
        return db.Admin.create(userData)
    }

    static async getAdminByEmail(email) {
        return db.Admin.scope('login').findOne({ where: { email } })
    }

    static async checkToken(ctx, token) {
        const decoded = TokenUtil.decode(token)
        if (!decoded || !decoded.userId) {
            ctx.status = 401
            ctx.body = { success: false, message: 'TOKEN_NOT_VALID.' }
            return ctx
        }
        const user = await AdminService.getAdminById(decoded.userId)
        if (!user) {
            ctx.status = 401
            ctx.body = { success: false, message: 'TOKEN_NOT_VALID.' }
            return ctx
        }
        return user
    }


    static async compareAndSave(ctx, password, confirmPassword, user){
        if(password !== confirmPassword) {
            ctx.status = 405
            ctx.body = { success: false, message: 'Passwords are not same, try again.' }
            return ctx
        }
        user.password = PasswordUtil.saltHashPassword(password)
        await user.save()
    }

    static async createMessageForRegister(email, url, createPassword) {
     return `Hello, this is your password : ${createPassword}<br> Please Click on the link to verify your email.<br><button><a href=${url}>Click here to verify</a></button> <br>Here's link if button not displayed - <a href=${url}>here</a> `
    }

    static async getAdmins(page, perPage) {
        return await db.Admin.findAndCountAll({
          order: [['id', 'DESC']],
          offset: (page-1)*perPage ,
          limit: perPage })
    }

    static async deleteAdmin(id){
        return await db.Admin.destroy({ where: { id } })
      }
}
