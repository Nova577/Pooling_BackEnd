import _ from 'lodash'
import jwt from 'jsonwebtoken'
import BaseService from './baseService.js'
import logger from '../utils/logger.js'
import { HttpError } from '../utils/error.js'
import { Research } from '../models/research.js'

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

    /**
     * @description: create a project
     * @param {*} projectInfo
     * @return {*}
     */
    async createProject(projectInfo) {
        if(!projectInfo) {
            throw new HttpError('InvalidInputError', 'projectInfo is required.', 400)
        }
        return true
    }
}

export default ProjectService