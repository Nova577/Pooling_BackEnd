import express from 'express'
import ProjectService from '../services/projectService.js'

const projectRouter = express.Router()

projectRouter.post('/research', ( request, response ) => {
    const researchInfo = request.body

    const research_id = ProjectService.createResearch(request.user.id, researchInfo)
    response
        .status(200)
        .send({ code : 0 , data : { id: research_id }})
})

projectRouter.get('/research/:id', ( request, response ) => {
    const id = request.params.id
    const researchInfo = ProjectService.getResearchInfo(id)
    response
        .status(200)
        .send({ code : 0 , data : { researchInfo } })
})

projectRouter.put('/research/:id', ( request, response ) => {
    const id = request.params.id
    const researchInfo = request.body
    ProjectService.updateResearchInfo(id, researchInfo)
    response
        .status(200)
        .send({ code : 0 ,  message : 'success' })
})

projectRouter.post('/appointment', ( request, response ) => {
    const appointmentInfo = request.body

    const appointment_id = ProjectService.createAppointment(request.user.id, appointmentInfo)
    response
        .status(200)
        .send({ code : 0 , data : { id: appointment_id }})
})

projectRouter.get('/appointment/:id', ( request, response ) => {
    const id = request.params.id
    const appointmentInfo = ProjectService.getAppointmentInfo(id)
    response
        .status(200)
        .send({ code : 0 , data : { appointmentInfo } })
})

projectRouter.put('/appointment/:id', ( request, response ) => {
    const id = request.params.id
    const appointmentInfo = request.body
    ProjectService.updateAppointmentInfo(id, appointmentInfo)
    response
        .status(200)
        .send({ code : 0 ,  message : 'success' })
})

projectRouter.post('/questionnaire', ( request, response ) => {
    const questionnaireInfo = request.body

    const questionnaire_id = ProjectService.createQuestionnaire(request.user.id, questionnaireInfo)
    response
        .status(200)
        .send({ code : 0 , data : { id: questionnaire_id }})
})

projectRouter.get('/questionnaire/:id', ( request, response ) => {
    const id = request.params.id
    const questionnaireInfo = ProjectService.getQuestionnaireInfo(id)
    response
        .status(200)
        .send({ code : 0 , data : { questionnaireInfo } })
})

projectRouter.put('/questionnaire/:id', ( request, response ) => {
    const id = request.params.id
    const questionnaireInfo = request.body
    ProjectService.updateQuestionnaireInfo(id, questionnaireInfo)
    response
        .status(200)
        .send({ code : 0 ,  message : 'success' })
})
