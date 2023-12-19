import express from 'express'
import userService from '../services/userService.js'

const userRouter = express.Router()

userRouter.post('/participant', ( request, response ) => {
    const participantInfo = request.body
    userService.createParticipant(participantInfo)
    response
        .status(200)
        .send({ code : 0 , message : 'success' })
})

userRouter.get('/participant/:id', ( request, response ) => {
    const id = request.params.id
    const user = userService.findUserByID('participant', id)
    response
        .status(200)
        .send({ code : 0 , data : { user } })
})

userRouter.put('/participant/:id', ( request, response ) => {
    const id = request.params.id
    const userInfo = request.body
    const user = userService.updateUserInfoByID('participant', id, userInfo)
    response
        .status(200)
        .send({ code : 0 , data : { user } })
})

userRouter.post('/researcher', ( request, response ) => {
    const { username, password } = request.body
    userService.createResearcher(username, password)
    response
        .status(200)
        .send({ code : 0 , message : 'success' })
})

userRouter.get('/researcher/:id', ( request, response ) => {
    const id = request.params.id
    const user = userService.findUserByID('researcher', id)
    response
        .status(200)
        .send({ code : 0 , data : { user } })
})

userRouter.put('/researcher/:id', ( request, response ) => {
    const id = request.params.id
    const userInfo = request.body
    const user = userService.updateUserInfoByID('researcher', id, userInfo)
    response
        .status(200)
        .send({ code : 0 , data : { user } })
})

export default userRouter