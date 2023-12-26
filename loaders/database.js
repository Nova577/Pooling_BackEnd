import config from '../utils/config.js'
import logger from '../utils/logger.js'
import { userInit } from '../models/user.js'
import { researchInit } from '../models/research.js'
import { joinInit } from '../models/join.js'
import DataService from '../services/dataService.js'

const dataService = DataService.getInstance()

export default async () => {
    //init dataService
    await dataService.init(config.DATABASE)
    //init mysql
    const mysql = dataService.getDatabase('mysql')
    userInit(mysql)
    researchInit(mysql)
    joinInit(mysql)

    try {
        await mysql.sync()
    }catch(error) {
        logger.error('mysql model sync failed:', error)
    }

    logger.info('Database init success.')
}



