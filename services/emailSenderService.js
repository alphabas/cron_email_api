const nodemailer = require('nodemailer')
const juice = require('juice')
const fs = require('fs')
const ejs = require('ejs')
const { convert } = require('html-to-text')

require("dotenv").config();

const devTransport = {
    host: 'localhost',
    port: 4001,
    ignoreTLS: true
}

const prodTransport = {
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
    ignoreTLS: true,
    tls: {
        rejectUnauthorized: false
    }
}



const emailSenderService = async (mailOptions, templateName, data) => {
    try {
        const transporter = nodemailer.createTransport(process.env.NODE_ENV === 'local' ? devTransport : prodTransport)
        const templatePath = `views/emails/${templateName}.ejs`
        // console.log(templateName, fs.existsSync(templatePath))
        if (templateName && fs.existsSync(templatePath)) {
            const template = fs.readFileSync(templatePath, "utf-8")
            let html = ejs.render(template, data)
            const text = convert(html)
            const withInlineStyle = juice(html)
            
            // console.log("++",mailOptions)
              return await transporter.sendMail({
                from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM}>`,
                html: withInlineStyle,
                text,
                ...mailOptions
            })

        } else {

            return await transporter.sendMail({
                from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM}>`,
                ...mailOptions
            })


        }
    } catch (error) {
        console.log("___THROW ---<>>",error,"<<<>><>")
        throw error
    }
}


module.exports = emailSenderService