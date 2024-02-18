import logger from '../utils/logger.js'
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
                logger.error(error)
            } else {
                logger.info('Server is ready to take our messages:', success)
            }
        })
        //TODO: init websocket service
    }

    async sendEmail(from, to, subject, text) {
        if(!from || !to || !subject || !text) {
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

    async sendMessage(from, to, type, message) {
        if(!from || !to || !type || !message){
            throw new Error('InvalidInputError')
        }
        // TODO:send message by websocket service
    }
} 
export default MessageService.getInstance()