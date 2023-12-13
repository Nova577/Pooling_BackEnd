import express from 'express'
import cors from 'cors'
import config from '../utils/config'
import logger from '../utils/logger'
import middleware from '../utils/middleware'
import { authRouter } from '../controllers/login'

export default (app) => {
    //init basic module
    app.use(cors())
    app.use(express.static('build'))
    app.use(express.json())

    if(config.ENV !== 'production') {
        app.use(middleware.requestLogger)
    }

    //routers
    app.use('/api/auth', authRouter)

    //error handle
    app.use(middleware.errorHandler)
    app.use(middleware.unknownEndpoint)

    logger.info('init app success.')
    
    return app
}

