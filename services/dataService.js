import Sequelize from 'sequelize'
import logger from '../utils/logger.js'
import BaseService from './baseService.js'

class DataService extends BaseService {

    constructor() {
        super()
        //singleton pattern
        this._instance = null
        //database points
        this._mysql = null
    }

    /**
     * @description: init databases by using config
     * @param {*} config database config
     * @return {*}
     */
    async init(config) {
        super.init(config)
        //init mysql connect
        
        const sequelize = new Sequelize(config.name, config.username, config.password, config.options)
        try {
            await sequelize.authenticate()
            this._mysql = sequelize
            logger.info(
                `Connection for ${config.name} has been established successfully.`
            )
        } catch (error) {
            logger.error(
                `Unable to connect to ${config.name}:`, error
            )
        }
        //init other type of database...
    }

    /**
     * @description: service class should be singler mode
     * @return {*}
     */
    static getInstance() {
        if(!this._instance){
            this._instance = new DataService()
        }
        return this._instance
    }

    /**
     * @description: get database instance by name
     * @param {*} type: type of database type, can be: mysql | mongo | redis
     * @return {*}
     */
    getDatabase(type) {
        var database = undefined

        switch(type){
        case 'mysql' :
            database = this._mysql
            break
        default :
            break
        }
        
        return database
    }

}

export default DataService

