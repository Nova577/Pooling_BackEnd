import express from 'express'
import userService from '../services/userService.js'

const signInRouter = express.Router()

signInRouter.post('/', async ( request, response, next ) => {
    const { userName, password } = request.body
    try {
        const { id, type, token, refreshToken } = await userService.signIn(userName, password)
        response
            .status(200)
            .send({ code: 0 , data: { id, type, token, refreshToken }})
    } catch (error) {
        next(error)
    }
})


export default signInRouter