import Sequelize from 'sequelize'
import logger from '../utils/logger'

class DataFactory {

    constructor() {
        //singleton pattern
        this._instance = null
        //database list
        this._mysql = null
    }

    /**
     * @description: init databases by using config
     * @param {*} database
     * @return {*}
     */
    async init(database) {
        //init all mysql connect
        const {name, user, password, options} = database.mysql
        const sequelize = new Sequelize(name, user, password, options)
        try {
            await sequelize.authenticate()
            this._mysql = sequelize
            logger.info(`Connection for ${name} has been established successfully.`)
        }catch (error) {
            logger.error(`Unable to connect to ${name}:`, error)
        }
        try{
            await sequelize.sync()
            logger.info(`Success to sync database ${name}.`)
        }catch(error){
            logger.error(`Fail to sync database ${name}.`)
        }
        //init other type of database...
    }

    static getInstance() {
        if(!this._instance){
            this._instance = new DataFactory()
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
            database = this.mysql
            break
        default :
            break
        }
        return database
    }
}

export default DataFactory

