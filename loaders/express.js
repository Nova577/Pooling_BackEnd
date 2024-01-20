import express from 'express'
import cors from 'cors'
import logger from '../utils/logger.js'
import middleware from '../utils/middleware.js'
import signInRouter from '../controllers/signInRouter.js'
import signUpRouter from '../controllers/signUpRouter.js'
import authRouter from '../controllers/authRouter.js'
import projectRouter from '../controllers/projectRouter.js'
import userRouter from '../controllers/userRouter.js'


export default (app) => {
    //init basic module
    app.use(cors())
    app.use(express.static('build'))
    app.use(express.json())

    //routers
    app.use('/api', userRouter)
    app.use('/api/signUp', signUpRouter)
    app.use('/api/signIn', signInRouter)
    app.use('/api/auth', middleware.tokenExtractor, authRouter)
    app.use('/api/project', middleware.tokenExtractor, middleware.userExtractor, projectRouter)
    
    

    //error handle
    app.use(middleware.errorHandler)
    app.use(middleware.unknownEndpoint)

    logger.info('init app success.')
    
    return app
}

