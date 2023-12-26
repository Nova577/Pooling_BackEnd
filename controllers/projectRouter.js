import express from 'express'
import ProjectService from '../services/projectService.js'

const projectRouter = express.Router()

projectRouter.post('/research', ( request, response ) => {
    const researchInfo = request.body
    ProjectService.createProject(researchInfo)
    response
        .status(200)
        .send({ code : 0 , message : 'success' })
})


