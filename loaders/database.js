import config from '../utils/config'
import logger from '../utils/logger'
import userInit from '../models/user'
import DataService from '../services/dataService'

export default async () => {
    //init dataService
    const dataService = DataService.getInstance()
    dataService.init(config.DATABASE)

    //init mysql
    const mysql = dataService.getDatabase('mysql')
    userInit(mysql)

    try {
        await mysql.sync()
    }catch(error) {
        logger.error('mysql model sync failed:', error)
    }

    logger.info('Database init success.')
}



