import config from '../utils/config.js'
import logger from '../utils/logger.js'
import { userInit } from '../models/user.js'
import { projectInit } from '../models/project.js'
import { mapInit } from '../models/maps.js'
import { tagInit } from '../models/tag.js'
import { fileInit } from '../models/file.js'
import { joinInit } from '../models/join.js'
import dataService from '../services/dataService.js'

export default async () => {
    //init dataService
    await dataService.init(config.DATABASE)
    //init mysql
    const mysql = dataService.getDatabase('mysql')
    mapInit(mysql)
    tagInit(mysql)
    userInit(mysql)
    projectInit(mysql)
    fileInit(mysql)
    joinInit(mysql)

    try {
        await mysql.sync()
    }catch(error) {
        logger.error('mysql model sync failed:', error)
    }

    logger.info('Database init success.')
}



