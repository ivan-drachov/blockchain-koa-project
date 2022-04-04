const nodemailer = require("nodemailer")

export default class mailUtil {

    static async sendEmail(email, type, data) {
        const mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASSWORD,
            },
        })

        const mailDetails = {
            from: process.env.MAIL_ID,
            to: email,
            subject: mailUtil.getSubject(type, data),
            html: mailUtil.getMessagePayload(type, data),
        }

        await mailTransporter.sendMail(mailDetails, function (err, info) {
            if (err) {
                console.log("Error while sending email: ", err)
            } else {
                console.log("Email was sent with the response: ", info.response)
            }
        })
    }

    static getSubject(type, data) {
        switch (type) {
            case 'verification':
                return "AlphaCarbon Verification"
            case 'forgotPassword':
                return "AlphaCarbon Password Restoring"
        }
        return 'Empty Subject'
    }

    static getMessagePayload(type, data) {
        switch (type) {
            case 'verification':
                return `Hi, you was invited as admin on ${process.env.APP_NAME} <br>
                         this is your password : ${data.password}<br> 
                         Please Click on the button to verify your email.<br>
                         <a href=${data.url}><button>Click here to verify</button></a><br>
                         Here's the link if the button is not displayed - <a href=${data.url}>Verify</a>`
            case 'forgotPassword':
                return `Hello, this is your new password : ${data.password}<br>
                         Use it to login in ${process.env.APP_NAME}<br>
                         <a href=${process.env.FRONTEND_URL}><button>Go to site</button></a><br>
                         Here's the link if the the button is not displayed - <a href=${process.env.FRONTEND_URL}>Go to site</a>`
        }
        return 'Empty message'
    }
}
