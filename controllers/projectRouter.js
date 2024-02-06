import express from 'express'
import projectService from '../services/projectService.js'

const projectRouter = express.Router()

projectRouter.post('/research', async ( request, response, next ) => {
    const researchInfo = request.body
    researchInfo.creator = request.user.id
    try {
        const research_id = await projectService.createResearch(request.user.id, researchInfo)
        response
            .status(200)
            .send({ code: 0 , data: { id: research_id }})
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/research/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const researchInfo = await projectService.getResearchInfo(id)
        response
            .status(200)
            .send({ code: 0 , data: researchInfo })
    } catch (error) {
        next(error)
    }
})

projectRouter.put('/research/:id', async ( request, response, next ) => {
    const id = request.params.id
    const researchInfo = request.body
    researchInfo.operator = request.user.id
    try {
        await projectService.updateResearchInfo(id, researchInfo, request.user.id)
        response
            .status(200)
            .send({ code: 0 ,  message: 'success' })
    } catch (error) {
        next(error)
    }
})

projectRouter.post('/appointment', async ( request, response, next ) => {
    const appointmentInfo = request.body
    try {
        const appointment_id = await projectService.createAppointment(appointmentInfo)
        response
            .status(200)
            .send({ code: 0 , data: { id: appointment_id }})
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/appointment/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const appointmentInfo = await projectService.getAppointmentInfo(id)
        response
            .status(200)
            .send({ code: 0 , data: appointmentInfo })
    } catch (error) {
        next(error)
    }
})

projectRouter.put('/appointment/:id', async ( request, response, next ) => {
    const id = request.params.id
    const appointmentInfo = request.body
    try {
        await projectService.updateAppointmentInfo(id, appointmentInfo, request.user.id)
        response
            .status(200)
            .send({ code: 0 ,  message: 'success' })
    } catch (error) {
        next(error)
    }
})

projectRouter.post('/questionnaire', async ( request, response, next ) => {
    const questionnaireInfo = request.body
    try {
        const questionnaire_id = await projectService.createQuestionnaire(questionnaireInfo)
        response
            .status(200)
            .send({ code: 0 , data: { id: questionnaire_id }})
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/questionnaire/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const questionnaireInfo = await projectService.getQuestionnaireInfo(id)
        response
            .status(200)
            .send({ code: 0 , data: questionnaireInfo })
    } catch (error) {
        next(error)
    }
})

projectRouter.put('/questionnaire/:id', async ( request, response, next ) => {
    const id = request.params.id
    const questionnaireInfo = request.body
    try {
        await projectService.updateQuestionnaireInfo(id, questionnaireInfo, request.user.id)
        response
            .status(200)
            .send({ code: 0 ,  message: 'success' })
    } catch (error) {
        next(error)
    }
})

projectRouter.post('/questionnaire/answer/:id', async ( request, response, next ) => {
    const id = request.params.id
    const answer = request.body
    try {
        await projectService.uploadQuestionnaireAnswer(id, answer, request.user.id)
        response
            .status(200)
            .send({ code: 0 , message: 'success'})
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/questionnaire/report/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        const result = await projectService.getQuestionnaireReport(id, request.user.id)
        response
            .status(200)
            .send({ code: 0 , data: result })
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/feed', async ( request, response, next ) => {
    try {
        const result = await projectService.getFeed(request.user.id)
        response
            .status(200)
            .send({ code: 0 , data: { researchList : result } })
    } catch (error) {
        next(error)
    }
})

projectRouter.post('/join/:id', async ( request, response, next ) => {
    const id = request.params.id
    try {
        await projectService.joinResearch(id, request.user.id)
        response
            .status(200)
            .send({ code: 0 , message: 'success' })
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/history', async ( request, response, next ) => {
    try {
        const result = await projectService.getHistory(request.user.id)
        response
            .status(200)
            .send({ code: 0 , data: { researchList : result} })
    } catch (error) {
        next(error)
    }
})

projectRouter.get('/schedule', async ( request, response, next ) => {
    try {
        const result = await projectService.getSchedule(request.user.id)
        response
            .status(200)
            .send({ code: 0 , data: result })
    } catch (error) {
        next(error)
    }
})

export default projectRouter