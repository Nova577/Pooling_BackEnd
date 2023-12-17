import BaseService from './baseService.js'

class ProjectService extends BaseService {

    constructor() {
        super()
    }

    /**
     * @description: service class should be singler mode
     * @return {*}
     */    
    static getInstance() {
        if(!this._instance){
            this._instance = new ProjectService()
        }
        return this._instance
    }

}

export default ProjectService