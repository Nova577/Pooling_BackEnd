import express from 'express'
import userService from '../services/userService.js'

const authRouter = express.Router()

authRouter.post('/refreshToken', async ( request, response, next ) => {
    const { refreshToken } = request.body
    try {
        const newToken  = await userService.refreshToken( refreshToken )
        response
            .status(200)
            .send({ code: 0 , data: { token: newToken } })
    } catch (error) {
        next(error)
    }
})

authRouter.post('/signOut', async ( request, response, next ) => {
    const { token } = request.body
    try {
        await userService.signOut(token)
        response
            .status(200)
            .send({ code: 0 , message: 'logout success.' })
    } catch (error) {
        next(error)
    }
})

export default authRouter



