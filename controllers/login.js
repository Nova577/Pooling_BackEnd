import express from 'express'
import userService from '../services/userService'

const authRouter = express.Router()

authRouter.post('/login', ( request, response, next ) => {
    const { username, password } = request.body

    const token = userService.login(username, password)
    if(!token) {
        next({
            name : 'JsonWebTokenError',
            message : 'invalid username or password'
        })
    } else {
        response
            .status(200)
            .send({ code : 0 , data : { token } })
    }
})

authRouter.post('/refreshToken', ( request, response, next ) => {
    const { id } = request.body
    const token  = userService.refreshToken(id)
    if(!token){
        next({
            name : 'JsonWebTokenError',
            message : 'user has been logged out.'
        })
    } else {
        response
            .status(200)
            .send({ code : 0 , data : { token } })
    }
},)


export default {
    authRouter
}



