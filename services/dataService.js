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

    // async createData(databaseName, modelName, info) {
    //     if(!databaseName || !modelName || !info) {
    //         logger.error('invalid input:', databaseName, modelName, info)
    //         return null
    //     }
    //     try {
    //         const result = await this.getDatabase(databaseName).model(modelName).create(info)
    //         return result.get().JSON()
    //     }catch(error) {
    //         logger.error('create data failed:', error)
    //         return null
    //     }
    // }

    // async getDataByOne(databaseName, modelName, query) {
    //     if(!databaseName || !modelName || !query) {
    //         logger.error('invalid input:', databaseName, modelName, query)
    //         return null
    //     }
    //     try {
    //         const result = await this.getDatabase(databaseName).model(modelName).findOne(query)
    //         return result.get().JSON()
    //     } catch(error) {
    //         logger.error('get data failed:', error)
    //         return null
    //     }
    // }

    // async getDataByAll(databaseName, modelName, query) {
    //     if(!databaseName || !modelName || !query) {
    //         logger.error('invalid input:', databaseName, modelName, query)
    //         return null
    //     }
    //     try {
    //         const results = await this.getDatabase(databaseName).model(modelName).findAll(query)
    //         return results.map(result => result.get().JSON())
    //     } catch(error) {
    //         logger.error('get data failed:', error)
    //         return null
    //     }
    // }

    // async getDataByPage(databaseName, modelName, query, page, pageSize) {
    //     if(!databaseName || !modelName || !query) {
    //         logger.error('invalid input:', databaseName, modelName, query)
    //         return null
    //     }
    //     Object.assign(query, { limit: pageSize, offset: page * pageSize })
    //     try {
    //         const results = await this.getDatabase(databaseName).model(modelName).findAll(query)
            
    //         return results.map(result => result.get().JSON())
    //     } catch(error) {
    //         logger.error('get data failed:', error)
    //         return null
    //     }
    // }

    // //FIXME: cant expose model object to outside
    // async setAssociatedById(databaseName, mainModel, subModel) {
    //     if(!databaseName || !mainModel || !subModel) {
    //         logger.error('invalid input:', databaseName, mainModel, subModel)
    //         return null
    //     }
    //     try {
    //         const result = await mainModel.set(subModel)
    //         return result.get().JSON()
    //     } catch(error) {
    //         logger.error('append data failed:', error)
    //         return null
    //     }
    // }

    // //FIXME: cant expose model object to outside
    // async getAssociatedById(databaseName, mainModel, subModel) {
    //     if(!databaseName || !mainModel || !subModel) {
    //         logger.error('invalid input:', databaseName, mainModel, subModel)
    //         return null
    //     }
    //     try {
    //         const result = await mainModel.get(subModel)
    //         return result.get().JSON()
    //     } catch(error) {
    //         logger.error('get data failed:', error)
    //         return null
    //     }
    // }
}

export default DataService

