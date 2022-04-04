import { request, body, tags, summary, path } from "koa-swagger-decorator"
import { AdminService } from "../../services"
import { TokenUtil, PasswordUtil } from "../../utils"
import { regExp } from '../../utils/regexps'
import mailUtil from "../../utils/mailUtil"
import speakeasy from "speakeasy"
import QRCode from 'qrcode'

import {
    swaggerPasswordSchema,
    swaggerLoginSchema,
    swaggerRegisterSchema,
    swaggerCheckEmailSchema
} from './schemas'

const tag = tags(["admin"])

export default class AuthController {

    @request('post', '/admin/login')
    @summary('Login into AlphaCarbon')
    @body(swaggerLoginSchema)
    @tag

    static async login(ctx, next) {

        const { request: { body: { password, email, code } } } = ctx

        const user = await AdminService.getAdminByEmail(email)

        if (!user) {
            ctx.body = { success: false, message: 'You are not registered' }
            ctx.status = 404
            return ctx
        }
        if (!PasswordUtil.comparePassword(user.password, password)) {
            ctx.body = { success: false, message: 'Invalid password' }
            ctx.status = 404
            return ctx
        }
        if (!user.verified) {
            ctx.body = { success: false, message: 'Email is not verified' }
            ctx.status = 404
            return ctx
        }

        if (user.googleAuthVerified) {
            let verify = false
            if (code) {
                verify = speakeasy.totp.verify({
                    secret: user.googleAuthCode,
                    encoding: 'base32',
                    token: code
                })
            }

            if(!verify) {
                ctx.body = { success: false, message: 'Incorrect code' }
                ctx.status = 400
                return ctx
            }
        }

        
        const token = TokenUtil.generate({ userId: user.id })
        delete user.dataValues.password
        
        ctx.body = { success: true, message: '', data: { token, user } }

        await next()
    }

    @request('post', '/admin/register')
    @summary('Register new user and send a password on your email')
    @body(swaggerRegisterSchema)
    @tag

    static async register(ctx, next) {

        const { request: { body: {  name, email } } } = ctx

        if (!email.match(regExp.email)) {
            ctx.body = { success: false, message: 'Validation error. Check email value' }
                ctx.status = 405
                return ctx
        }
        if (!name.match(regExp.name)) {
            ctx.body = { success: false, message: 'Validation error. Check name value' }
            ctx.status = 405
            return ctx
        }

        const emailExists = await AdminService.getAdminByEmail(email)
        if (emailExists) {
            ctx.body = { success: false, message: 'Admin with this email already exists.' }
                ctx.status = 400
                return ctx
        }

        const randomPassword = PasswordUtil.getRandomString()

        const userData = { name, email, password: PasswordUtil.saltHashPassword(randomPassword) }

        const user = await AdminService.createAdmin(userData)

        const token = TokenUtil.createVerifyToken({ userId: user.id })

        let url = process.env.HOST + '/admin/verifyEmail/' + token

        await mailUtil.sendEmail(email, 'verification', {email, password: randomPassword, url})

        ctx.status = 201
        const message = 'User created. Message with password and confirmation url is sent'
        ctx.body = { success: true, message, data: { user } }

        await next()
    }

    @request('get', '/admin/verifyEmail/{token}')
    @path({ token: { type: 'string', required: true, description: 'token' } } )
    @summary('Verify your email')
    @tag

    static async verifyEmail( ctx, next ) {

        const token = ctx.params.token
        const user = await AdminService.checkToken(ctx,token)

        user.verified = true
        await user.save()
        
        ctx.status = 200
        ctx.body = { success: true, message: 'string' }

        ctx.redirect(process.env.FRONTEND_URL + '/login')

        await next()
    }

    @request('post', '/admin/resendVerificationToken')
    @summary('Resend verification token')
    @body({ adminId: { type: 'number', required: true, description: 'admin Id' } })
    @tag
    static async resendVerificationToken(ctx, next) {

        const { request: { body: { adminId } } } = ctx

        const admin = await AdminService.getAdminById(adminId)
        if (!admin) {
            ctx.body = { success: false, message: 'You are not registered.' }
            ctx.status = 404
            return ctx
        }
        const token = TokenUtil.createVerifyToken({userId: admin.id})
        const randomPassword = PasswordUtil.getRandomString()
        await admin.update({password: PasswordUtil.saltHashPassword(randomPassword)})
        let url = process.env.HOST + '/admin/verifyEmail/' + token
        await mailUtil.sendEmail(admin.email,'verification', {email: admin.email, password: randomPassword, url})

        ctx.status = 201
        ctx.body = { success: true, message: 'Admin password updated and sended to the email', data: {} }

        await next()
    }

    @request('post', '/admin/updatePassword')
    @body(swaggerPasswordSchema)
    @summary('Update your password which should be 8-16 characters long')
    @tag

    static async updatePassword( ctx, next ) {

        const { request: { body: { oldPassword, password, confirmPassword } } } = ctx

        const token = ctx.headers.authorization
        const decoded = TokenUtil.decode(token)
        if(!decoded.userId) {
            ctx.body = { success: false, message: 'You are not registered.' }
            ctx.status = 404
            return ctx
        }

        const user = await AdminService.getAdminById(decoded.userId)

        if (!PasswordUtil.comparePassword(user.password, oldPassword)) {
            ctx.body = { success: false, message: 'Wrong old password.' }
            ctx.status = 404
            return ctx
        }
        if (password !== confirmPassword) {
            ctx.body = { success: false, message: 'Invalid password' }
            ctx.status = 404
            return ctx
        }
        if (!password.match(regExp.password)) {
            ctx.body = { success: false, message: 'Validation error. Incorrect email.' }
            ctx.status = 405
            return ctx
        }

        await AdminService.compareAndSave(ctx, password, confirmPassword, user)

        ctx.status = 200
        ctx.body = { success: true, message: 'Your password has been updated', data: { frontendLink: process.env.FRONTLINK } }

        await next()
    }

    @request('post', '/admin/forgotPassword')
    @summary('Create new password')
    @body(swaggerCheckEmailSchema)
    @tag

    static async forgotPassword(ctx, next) {
        const { request: { body: { email } } } = ctx

        const admin = await AdminService.getAdminByEmail(email)
        if(!admin) {
            ctx.body = { success: false, message: 'No admin with this email.' }
            ctx.status = 404
            return ctx
        }
        const randomPassword = PasswordUtil.getRandomString()
        await admin.update({password: PasswordUtil.saltHashPassword(randomPassword)})
        await mailUtil.sendEmail(admin.email,'forgotPassword', {email: admin.email, password: randomPassword})
        ctx.status = 201
        ctx.body = { success: true, message: "" }

        await next()
    }

    @request('get', '/admin/getGoogleAuthCode')
    @summary('Generate secret and save it in database')
    @tag

    static async getGoogleAuthCode(ctx, next) {

        const { state: { user } } = ctx

        if (user.googleAuthVerified) {
            ctx.body = { success: false, message: 'Two-factor Authentication already activated.' }
            ctx.status = 401
            return ctx
        }

        const secret = speakeasy.generateSecret()
        const otpauth_url = `otpauth://totp/${ process.env.APP_NAME }(${ user.email })?secret=${ secret.base32 }`

        user.googleAuthCode = secret.base32
        await user.save()

        const QR = await QRCode.toDataURL(otpauth_url)

        ctx.status = 201
        ctx.body = { success: true, message: "", data: { authCode: user.googleAuthCode, QRCode: QR } }

        await next()
    }

    @request('post', '/admin/verifyGoogleAuth')
    @summary('Verify code from google authenticator')
    @body({ authCode: { type: 'string', required: true } })
    @tag

    static async verifyGoogleAuth(ctx, next) {

        const { request: { body: { authCode } }, state: { user } } = ctx

        const verified = speakeasy.totp.verify({
            secret: user.googleAuthCode,
            encoding: 'base32',
            token: authCode
        })
        if (!verified) {
            ctx.body = { success: false, message: 'Invalid code.' }
            ctx.status = 401
            return ctx
        }

        user.googleAuthVerified = true
        await user.save()

        ctx.status = 201
        ctx.body = { success: true, message: "string", data: { userGoogleAuthVerified: user.googleAuthVerified } }

        await next()
    }

    @request('post', '/admin/disableGoogleAuth')
    @summary('Disable Google authenticator')
    @body({ authCode: { type: 'string', required: true } })
    @tag

    static async disableGoogleAuth(ctx, next) {

        const { request: { body: { authCode } }, state: { user } } = ctx

        const verified = speakeasy.totp.verify({
            secret: user.googleAuthCode,
            encoding: 'base32',
            token: authCode
        })

        if (!verified) {
            ctx.body = { success: false, message: 'Invalid code.' }
            ctx.status = 401
            return ctx
        }

        user.googleAuthVerified = false
        await user.save()

        ctx.status = 201
        ctx.body = { success: true, message: "", data: { userGoogleAuthVerified: user.googleAuthVerified } }

        await next()
    }

    @request('get', '/admin/me')
    @summary("Get admin")
    @tag
    static async adminInfo(ctx, next) {
        const { user } = ctx.state

        ctx.body = { success: true, data: { user } }

        await next()
    }
}
