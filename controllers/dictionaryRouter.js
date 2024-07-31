import express from 'express'
import userService from '../services/userService.js'

const dictionaryRouter = express.Router()

dictionaryRouter.get('/:name', async ( request, response, next ) => {
    const dicName = request.params.name
    try {
        const results = await userService.searchDictionary(dicName)
        response
            .status(200)
            .send({ code: 0 , data: { [dicName]: results} })
    } catch (error) {
        next(error)
    }
})

export default dictionaryRouter



