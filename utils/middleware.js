import jwt from 'jsonwebtoken'
import logger from './logger.js'
import userService from '../services/userService.js'

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

    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'malformatted id' 
        })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ 
            error: error.message 
        })
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return response.status(401).json({
            code : 0,
            error: error.message 
        })
    } else if (error.name === 'PermissonDenied') {
        return response.status(404).json({
            code : 0,
            error: error.message 
        })
    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        Object.assign(request, {token: authorization.substring(7)})
        next()
    } else {
        next({
            name : 'JsonWebTokenError',
            message : 'token missing or invalid'
        })
    }
}

const userExtractor = async (request, response, next) => {
    //check if this token valid or expired
    const decoded = jwt.verify(
        request.token,
        process.env.SECRET, 
        error => {
            if(error) {
                next(error)
            }
        }
    )
    //check if this user still logged in
    if(!userService.verifyUserAuth(decoded)) {
        next({
            name : 'PermissionDenied',
            message : 'invalid user.'
        })
    } else {
        next()
    }
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