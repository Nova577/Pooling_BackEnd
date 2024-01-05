import express from 'express'
import userService from '../services/userService.js'

const signInRouter = express.Router()

signInRouter.post('/signIn', async ( request, response, next ) => {
    const { username, password } = request.body
    try {
        const { id, type, token, refreshToken } = await userService.signIn(username, password)
        response
            .status(200)
            .send({ code : 0 , data : { id, type, token, refreshToken }})
    } catch (error) {
        next(error)
    }
})

export default signInRouter