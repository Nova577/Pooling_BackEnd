import express from 'express'
import userService from '../services/userService.js'

const signUpRouter = express.Router()

signUpRouter.post('/participant', async ( request, response, next ) => {
    const participantInfo = request.body
    try { 
        await userService.createUser(participantInfo, 0)
        response
            .status(200)
            .send({ code : 0 , message : 'success' })
    } catch (error) {
        next(error)
    }
})

signUpRouter.post('/researcher', ( request, response, next ) => {
    const researcherInfo = request.body
    try{
        userService.createUser(researcherInfo, 1)
        response
            .status(200)
            .send({ code : 0 , message : 'success' })
    } catch (error) {
        next(error)
    }
})

export default signUpRouter