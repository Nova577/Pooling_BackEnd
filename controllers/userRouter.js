import express from 'express'
import userService from '../services/userService.js'

const userRouter = express.Router()

userRouter.get('/participant/:id', ( request, response ) => {
    const id = request.params.id
    const userInfo = userService.getUserInfo(id)
    response
        .status(200)
        .send({ code : 0 , data : { userInfo } })
})

userRouter.put('/participant/:id', ( request, response ) => {
    const id = request.params.id
    const userInfo = request.body
    userService.updateUserInfo(id, userInfo)
    response
        .status(200)
        .send({ code : 0 ,  message : 'success' })
})

userRouter.get('/researcher/:id', ( request, response ) => {
    const id = request.params.id
    const userInfo = userService.getUserInfo(id)
    response
        .status(200)
        .send({ code : 0 , data : { userInfo } })
})

userRouter.put('/researcher/:id', ( request, response ) => {
    const id = request.params.id
    const userInfo = request.body
    userService.updateUserInfo(id, userInfo)
    response
        .status(200)
        .send({ code : 0 ,  message : 'success' })
})

export default userRouter