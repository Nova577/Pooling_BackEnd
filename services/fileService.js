import BaseService from './baseService.js'
import bcrypt from 'bcrypt'
import { HttpError } from '../utils/error.js'
import { Picture, Document } from '../models/file.js'

class FileService extends BaseService {

    constructor() {
        super()
    }

    /**
     * @description: service class should be singler mode
     * @return {*}
     */    
    static getInstance() {
        if(!this._instance){
            this._instance = new FileService()
        }
        return this._instance
    }

    async uploadFile(file) {
        if(!file){
            throw new HttpError('InvalidInputError', 'No file upload', 400)
        }
        
        const name = file.name.split('.')[0]
        const type = file.name.split('.')[1]
        const saltRounds = 10
        const hashName = bcrypt.hashSync(name, saltRounds)

        let filePath = ''
        if(['jpg', 'png'].includes(type)){
            const picture = await Picture.create({
                name: hashName,
                format: type,
                user_id: this._user.id
            })
            filePath = picture.url
        }
        else if(['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'].includes(type)){
            const document = await Document.create({
                name: hashName,
                format: type,
                user_id: this._user.id
            })
            filePath = document.url
        }
        file.mv(filePath)

        return true
    }

    async getFile(id) {
        const picture = await Picture.findOne({
            where: {
                id
            }
        })
        if(picture){
            return picture.url
        }
        const document = await Document.findOne({
            where: {
                id
            }
        })
        if(document){
            return document.url
        }
        throw new HttpError('InvalidInputError', 'No file found', 400)
    }

}

export default FileService.getInstance()