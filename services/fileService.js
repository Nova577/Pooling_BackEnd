import BaseService from './baseService.js'
import fs from 'fs'

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

    FileUpload(file) {
        //FIXME: should be async, and split all network operation to another thread, filename should be change by bcrypt
        return new Promise((resolve, reject) => {
            const { name, data } = file
            const fileName = `${Date.now()}-${name}`
            const filePath = `${this._config.uploadPath}/${fileName}`
            fs.writeFile(filePath, data, error => {
                if(error){
                    reject(error)
                } else {
                    resolve(fileName)
                }
            })
        })
    }

}

export default FileService