import express from 'express'
import userService from '../services/userService.js'

const signUpRouter = express.Router()

signUpRouter.post('/participant', ( request, response ) => {
    const participantInfo = request.body
    userService.createUser(participantInfo, 0)
    response
        .status(200)
        .send({ code : 0 , message : 'success' })
})

signUpRouter.post('/researcher', ( request, response ) => {
    const researcherInfo = request.body
    userService.createUser(researcherInfo, 1)
    response
        .status(200)
        .send({ code : 0 , message : 'success' })
})

export default signUpRouter