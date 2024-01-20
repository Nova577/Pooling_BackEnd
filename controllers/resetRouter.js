import express from 'express'
import userService from '../services/userService.js'

const resetRouter = express.Router()

resetRouter.post('/sendCode', async ( request, response, next ) => {
    const { username } = request.body
    try {
        await userService.sendCode('resetPassword', username)
        response
            .status(200)
            .send({ code : 0 , message : 'success' })
    } catch (error) {
        next(error)
    }
})

resetRouter.post('/checkCode', async ( request, response, next ) => {
    const { username, code} = request.body.email
    try {
        await userService.checkCode(username, code)
        response
            .status(200)
            .send({ code : 0 , message : 'success' })
    } catch (error) {
        next(error)
    }
})

export default resetRouter