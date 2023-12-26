import express from 'express'
import userService from '../services/userService.js'

const authRouter = express.Router()

authRouter.post('/refreshToken', ( request, response ) => {
    const { shortToken, longToken } = request.body
    const token  = userService.refreshToken(shortToken, longToken)
    response
        .status(200)
        .send({ code : 0 , data : { token } })
})

authRouter.post('/signOut', ( request, response ) => {
    const { shortToken } = request.body
    userService.signOut(shortToken)
    response
        .status(200)
        .send({ code : 0 , message : 'logout success.' })
})

export default authRouter



