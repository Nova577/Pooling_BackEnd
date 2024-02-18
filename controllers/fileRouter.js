import express from 'express'
import fileService from '../services/fileService.js'

const fileRouter = express.Router()

fileRouter.post('/upload', async ( request, response, next ) => {
    const { file } = request.files.file
    try {
        const { id } = await fileService.uploadFile(file)
        response
            .status(200)
            .send({ code: 0 , data: { id } })
    } catch (error) {
        next(error)
    }
})

fileRouter.get('/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const filePath = await fileService.getFile(id)
        response
            .sendFile(filePath)
    } catch (error) {
        next(error)
    }
})

export default fileRouter

