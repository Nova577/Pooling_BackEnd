import express from 'express'
import cors from 'cors'
import config from '../utils/config.js'
import logger from '../utils/logger.js'
import middleware from '../utils/middleware.js'
import authRouter from '../controllers/authRouter.js'

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

