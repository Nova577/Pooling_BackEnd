import express from 'express'
import ProjectService from '../services/projectService.js'

const projectRouter = express.Router()

projectRouter.post('/research', async ( request, response, next ) => {
    const researchInfo = request.body
    try {
        const research_id = await ProjectService.createResearch(request.user.id, researchInfo)
        response
            .status(200)
            .send({ code : 0 , data : { id: research_id }})
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/research/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const researchInfo = await ProjectService.getResearchInfo(id)
        response
            .status(200)
            .send({ code : 0 , data : { researchInfo } })
    } catch (error) {
        next(error)
    }
})

projectRouter.put('/research/:id', async ( request, response, next ) => {
    const id = request.params.id
    const researchInfo = request.body
    try {
        await ProjectService.updateResearchInfo(id, researchInfo)
        response
            .status(200)
            .send({ code : 0 ,  message : 'success' })
    } catch (error) {
        next(error)
    }
})

projectRouter.post('/appointment', async ( request, response, next ) => {
    const appointmentInfo = request.body
    try {
        const appointment_id = await ProjectService.createAppointment(request.user.id, appointmentInfo)
        response
            .status(200)
            .send({ code : 0 , data : { id: appointment_id }})
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/appointment/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const appointmentInfo = await ProjectService.getAppointmentInfo(id)
        response
            .status(200)
            .send({ code : 0 , data : { appointmentInfo } })
    } catch (error) {
        next(error)
    }
})

projectRouter.put('/appointment/:id', async ( request, response, next ) => {
    const id = request.params.id
    const appointmentInfo = request.body
    try {
        await ProjectService.updateAppointmentInfo(id, appointmentInfo)
        response
            .status(200)
            .send({ code : 0 ,  message : 'success' })
    } catch (error) {
        next(error)
    }
})

projectRouter.post('/questionnaire', async ( request, response, next ) => {
    const questionnaireInfo = request.body
    try {
        const questionnaire_id = await ProjectService.createQuestionnaire(request.user.id, questionnaireInfo)
        response
            .status(200)
            .send({ code : 0 , data : { id: questionnaire_id }})
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/questionnaire/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const questionnaireInfo = await ProjectService.getQuestionnaireInfo(id)
        response
            .status(200)
            .send({ code : 0 , data : { questionnaireInfo } })
    } catch (error) {
        next(error)
    }
})

projectRouter.put('/questionnaire/:id', async ( request, response, next ) => {
    const id = request.params.id
    const questionnaireInfo = request.body
    try {
        await ProjectService.updateQuestionnaireInfo(id, questionnaireInfo)
        response
            .status(200)
            .send({ code : 0 ,  message : 'success' })
    } catch (error) {
        next(error)
    } 
})

export default projectRouter