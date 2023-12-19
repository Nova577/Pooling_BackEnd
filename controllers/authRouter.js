import express from 'express'
import userService from '../services/userService.js'

const authRouter = express.Router()

authRouter.post('/login', ( request, response ) => {
    const { username, password } = request.body

    const { id, type, token } = userService.login(username, password)

    response
        .status(200)
        .send({ code : 0 , data : { id, type, token } })
})


authRouter.post('/refreshToken', ( request, response ) => {
    const { longToken } = request.body
    const token  = userService.refreshToken(request.shortToken, longToken)
    response
        .status(200)
        .send({ code : 0 , data : { token } })
})

authRouter.post('/logout', ( request, response ) => {
    userService.logout(request.shortToken)
    response
        .status(200)
        .send({ code : 0 , message : 'logout success.' })
})

export default authRouter



