import BaseService from './baseService.js'
import nodemailer from 'nodemailer'

class MessageService extends BaseService {
    constructor() {
        super()
        this._transporter = null
    }
    
    static getInstance() {
        if(!this._instance){
            this._instance = new MessageService()
        }
        return this._instance
    }

    init(config) {
        super.init(config)
        this._transporter = nodemailer.createTransport({
            host: this._config.host,
            port: this._config.port,
            secure: true,
            auth: {
                user: this._config.user,
                pass: this._config.pass
            }
        })
        this._transporter.verify(function (error, success) {
            if (error) {
                console.log(error)
            } else {
                console.log('Server is ready to take our messages:', success)
            }
        })
    }

    async sendEmail(from, to, subject, text) {
        if(!to || !subject || !text) {
            throw new Error('InvalidInputError')
        }

        const info = await this._transporter.sendMail({
            from,
            to,
            subject,
            text
        })
        return info
    }
} 
export default MessageService