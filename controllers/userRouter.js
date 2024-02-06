import express from 'express'
import userService from '../services/userService.js'

const userRouter = express.Router()

userRouter.get('/participant/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const userInfo = await userService.getUserInfo(id)
        response
            .status(200)
            .send({ code: 0 , data: userInfo })
    } catch (error) {
        next(error)
    }
})

userRouter.put('/participant/:id', async ( request, response, next ) => {
    const id = request.params.id
    const userInfo = request.body
    try {
        await userService.updateUserInfo(id, userInfo, request.user.id)
        response
            .status(200)
            .send({ code: 0 ,  message: 'success' })
    } catch (error) {
        next(error)
    }
})

userRouter.get('/researcher/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const userInfo = await userService.getUserInfo(id)
        response
            .status(200)
            .send({ code: 0 , data: userInfo })
    } catch (error) {
        next(error)
    }
})

userRouter.put('/researcher/:id', async ( request, response, next ) => {
    const id = request.params.id
    const userInfo = request.body
    try {
        userService.updateUserInfo(id, userInfo, request.user.id)
        response
            .status(200)
            .send({ code: 0 ,  message: 'success' })
    } catch (error) {
        next(error)
    }
})

export default userRouter