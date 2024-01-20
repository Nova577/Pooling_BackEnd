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

signUpRouter.post('/researcher', async ( request, response, next ) => {
    const researcherInfo = request.body
    try{
        await userService.createUser(researcherInfo, 1)
        response
            .status(200)
            .send({ code : 0 , message : 'success' })
    } catch (error) {
        next(error)
    }
})

signUpRouter.post('/sendCode', async ( request, response, next ) => {
    const { username } = request.body
    try {
        await userService.sendCode('signUp', username)
        response
            .status(200)
            .send({ code : 0 , message : 'success' })
    } catch (error) {
        next(error)
    }
})

signUpRouter.post('/checkCode', async ( request, response, next ) => {
    const { username, code} = request.body
    try {
        await userService.checkCode(username, code)
        response
            .status(200)
            .send({ code : 0 , message : 'success' })
    } catch (error) {
        next(error)
    }
})

export default signUpRouter