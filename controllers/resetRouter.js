import express from 'express'
import userService from '../services/userService.js'

const resetRouter = express.Router()

resetRouter.post('/', async ( request, response, next ) => {
    const { username, password } = request.body
    try {
        await userService.resetPassword(username, password)
        response
            .status(200)
            .send({ code: 0 , message: 'success' })
    } catch (error) {
        next(error)
    }
})

resetRouter.post('/sendCode', async ( request, response, next ) => {
    const { username } = request.body
    try {
        await userService.sendCode('resetPassword', username)
        response
            .status(200)
            .send({ code: 0 , message: 'success' })
    } catch (error) {
        next(error)
    }
})

resetRouter.post('/checkCode', async ( request, response, next ) => {
    const { username, code} = request.body
    try {
        await userService.checkCode(username, code)
        response
            .status(200)
            .send({ code: 0 , message: 'success' })
    } catch (error) {
        next(error)
    }
})

export default resetRouter