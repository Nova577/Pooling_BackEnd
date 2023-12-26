import express from 'express'
import userService from '../services/userService.js'

const signInRouter = express.Router()

signInRouter.post('/signIn', ( request, response ) => {
    const { username, password } = request.body

    const { id, type, shortToken, longToken } = userService.signIn(username, password)

    response
        .status(200)
        .send({ code : 0 , data : { id, type, shortToken, longToken } })
})

export default signInRouter