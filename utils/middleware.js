import jwt from 'jsonwebtoken'
import { HttpError } from './error.js'
import logger from './logger.js'

const requestLogger = (request, response, next) => {
    logger.info('---')
    logger.info('Method:', request.method)
    logger.info('Status:', request.status)
    logger.info('Path:', request.path)
    logger.info('Body:', request.body)
    logger.info('---')
    next()
}

const errorHandler = (error, request, response, next) => {
    if (error.name === 'ValidationError') {
        return response.status(400).send({
            code : '0',
            message: 'Invalid input' 
        })
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return response.status(401).json({
            code : 0,
            message: error.message 
        })
    } else if (error.name === 'PermissonDenied') {
        return response.status(404).json({
            code : 0,
            message: error.message 
        })
    } else if (error instanceof HttpError) {
        return response.status(error.status).json({
            code : 0,
            message: error.message 
        })
    }
    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        Object.assign(request.body, {token: authorization.substring(7)})
        next()
    } else {
        const error = new HttpError('JsonWebTokenError', 'invalid token.', 401)
        next(error)
    }
}

const userExtractor = async (request, response, next) => {
    //check if this token valid or expired
    const decoded = jwt.verify(
        request.token,
        process.env.SECRET
    )
    Object.assign(request.body, {operator: decoded})
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ 
        code : '0',
        error: 'unknown endpoint' 
    })
}


export default {
    requestLogger,
    errorHandler,
    tokenExtractor,
    userExtractor,
    unknownEndpoint
}