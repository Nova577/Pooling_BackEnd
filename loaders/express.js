import express from 'express'
import cors from 'cors'
import logger from '../utils/logger.js'
import middleware from '../utils/middleware.js'
import signInRouter from '../controllers/signInRouter.js'
import signUpRouter from '../controllers/signUpRouter.js'
import authRouter from '../controllers/authRouter.js'
import projectRouter from '../controllers/projectRouter.js'
import userRouter from '../controllers/userRouter.js'
import fileRouter from '../controllers/fileRouter.js'
import resetRouter from '../controllers/resetRouter.js'
import dictionaryRouter from '../controllers/dictionaryRouter.js'
import fileUpload from 'express-fileupload'


export default (app) => {
    //init basic module
    app.use(cors())
    app.use(express.static('build'))
    app.use(express.json())
    app.use(fileUpload())

    //routers
    app.use('/api', userRouter)
    app.use('/api/signUp', signUpRouter)
    app.use('/api/signIn', signInRouter)
    app.use('/api/reset', resetRouter)
    app.use('/api/auth', middleware.tokenExtractor, authRouter)
    app.use('/api/project', middleware.tokenExtractor, middleware.userExtractor, projectRouter)
    app.use('/api/file', middleware.tokenExtractor, middleware.userExtractor, fileRouter)
    app.use('/api/dictionary', dictionaryRouter)

    //error handle
    app.use(middleware.errorHandler)
    app.use(middleware.unknownEndpoint)

    logger.info('init app success.')
    
    return app
}

