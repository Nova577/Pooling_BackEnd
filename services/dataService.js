import Sequelize from 'sequelize'
import logger from '../utils/logger'
import BaseService from './baseService'

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
        const {name, user, password, options} = config.mysql
        const sequelize = new Sequelize(name, user, password, options)
        try {
            await sequelize.authenticate()
            this._mysql = sequelize
            logger.info(
                `Connection for ${name} has been established successfully.`
            )
        } catch (error) {
            logger.error(
                `Unable to connect to ${name}:`, error
            )
        }
        //init other type of database...
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
            database = this.mysql
            break
        default :
            break
        }
        
        return database
    }
}

export default DataService.getInstance()

