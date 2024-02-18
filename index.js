import express from 'express'
import http from 'http'
import config from './utils/config.js'
import logger from './utils/logger.js'
import expressLoader from './loaders/express.js'
import databaseLoader from './loaders/database.js'
import messagerLoader from './loaders/messager.js'

async function startService() {
    const app = express()
    try {
        await expressLoader(app)
    }catch(error) {
        logger.error('init app failed:', error)
        return
    }
    try {
        await databaseLoader()
    }catch(error) {
        logger.error('init database failed:', error)
        return
    }
    try {
        await messagerLoader()
    }catch(error) {
        logger.error('init messager failed:', error)
        return
    }
    
    const server = http.createServer(app)

    server.listen(config.PORT, error => {
        if(error) {
            logger.error('service listen port failed:',error)
            return
        }
        logger.info(`Server running on port ${config.PORT}`)
    })

}

startService()
