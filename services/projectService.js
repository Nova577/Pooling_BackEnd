//import _ from 'lodash'
import BaseService from './baseService.js'
//import logger from '../utils/logger.js'
import { HttpError } from '../utils/error.js'
import { User } from '../models/user.js'
import { Tag } from '../models/tag.js'
import { Research, Appointment, Questionnaire, EassyQuestion, ChoiceQuestion } from '../models/project.js'

class ProjectService extends BaseService {

    constructor() {
        super()
    }

    /**
     * @description: service class should be singler mode
     * @return {*}
     */    
    static getInstance() {
        if(!this._instance){
            this._instance = new ProjectService()
        }
        return this._instance
    }

    /**
     * @description: create a research
     * @param {*} researchInfo
     * @return {*}
     */
    async createResearch(creator, researchInfo) {
        if(!researchInfo) {
            throw new HttpError('InvalidInputError', 'researchInfo is required.', 400)
        }

        const { name, reward, headCount, description, status } = researchInfo
        const research = await Research.create({
            name,
            reward,
            headCount,
            description,
            status
        })
        if(!research) {
            throw new HttpError('SystemError', 'Create research failed.', 500)
        }

        const { picture_id, appointment_id, questionnarie_id } = researchInfo
        research.setCover(picture_id)
        research.setAppointment(appointment_id)
        research.setQuestionnarie(questionnarie_id)

        const {documents, cooperators, preference} = researchInfo
        documents.map(document => research.addDocument(document.id))
        cooperators.map(async cooperator => {
            const user = await User.findOne({where: {email: cooperator}})
            if(!user) {
                //TODO: send invitation email
            }
            research.addUser(user)
        })
        const tags = preference.map(async tag => await Tag.findCreateFind({where: {name: tag}}))
        research.setTags(tags)


        const user = await User.findByPk(creator)
        user.addResearch(research)

        return research.id
    }

    async getResearchInfo(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const research = await Research.findByPk(id)
        if(!research) {
            throw new HttpError('NotFound', 'research not found.', 404)
        }

        const { name, reward, headCount, description, status } = research
        const picture_id = research.getCover()
        const appointment_id = research.getAppointment()
        const questionnarie_id = research.getQuestionnarie()
        const documents = research.getDocuments().map(document => {
            return {id: document.id, name: document.name}
        })
        const cooperators = research.getUsers().map(user => user.email)
        const preference = research.getTags().map(tag => tag.name)

        return {
            name,
            reward,
            headCount,
            description,
            status,
            picture_id,
            appointment_id,
            questionnarie_id,
            documents,
            cooperators,
            preference
        }
    }

    async updateResearchInfo(id, researchInfo) {
        if(!id || !researchInfo) {
            throw new HttpError('InvalidInputError', 'id and researchInfo are required.', 400)
        }

        const research = await Research.findByPk(id)
        if(!research) {
            throw new HttpError('NotFound', 'research not found.', 404)
        }

        const { name, reward, headCount, description, status } = researchInfo
        research.name = name
        research.reward = reward
        research.headCount = headCount
        research.description = description
        research.status = status

        const { picture_id, appointment_id, questionnarie_id } = researchInfo
        research.setCover(picture_id)
        research.setAppointment(appointment_id)
        research.setQuestionnarie(questionnarie_id)

        const {documents, cooperators, preference} = researchInfo
        documents.map(document => research.addDocument(document.id))
        cooperators.map(async cooperator => {
            const user = await User.findOne({where: {email: cooperator}})
            if(!user) {
                //TODO: send invitation email
            }
            research.addUser(user)
        })
        const tags = preference.map(async tag => await Tag.findCreateFind({where: {name: tag}}))
        research.setTags(tags)

        return research.save()
    }

    async createAppointment(appointmentInfo) {
        if(!appointmentInfo) {
            throw new HttpError('InvalidInputError', 'appointmentInfo is required.', 400)
        }

        const { name, timeInfo, meetingInfo, description } = appointmentInfo
        const { date, startTime, endTime } = timeInfo
        const appointment = await Appointment.create({
            name,
            date,
            startTime,
            endTime,
            meetingInfo,
            description
        })
        if(!appointment) {
            throw new HttpError('SystemError', 'Create appointment failed.', 500)
        }

        return appointment.id
    }

    async getAppointmentInfo(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const appointment = await Appointment.findByPk(id)
        if(!appointment) {
            throw new HttpError('NotFound', 'appointment not found.', 404)
        }

        const { name, date, startTime, endTime, meetingInfo, description } = appointment

        return {
            name,
            timeInfo: {
                date,
                startTime,
                endTime
            },
            meetingInfo,
            description
        }
    }

    async updateAppointmentInfo(id, appointmentInfo) {
        if(!id || !appointmentInfo) {
            throw new HttpError('InvalidInputError', 'id and appointmentInfo are required.', 400)
        }

        const appointment = await Appointment.findByPk(id)
        if(!appointment) {
            throw new HttpError('NotFound', 'appointment not found.', 404)
        }

        const { name, timeInfo, meetingInfo, description } = appointmentInfo
        const { date, startTime, endTime } = timeInfo
        appointment.name = name
        appointment.date = date
        appointment.startTime = startTime
        appointment.endTime = endTime
        appointment.meetingInfo = meetingInfo
        appointment.description = description

        return appointment.save()
    }

    async createQuestionnaire(questionnaireInfo) {
        if(!questionnaireInfo) {
            throw new HttpError('InvalidInputError', 'questionnaireInfo is required.', 400)
        }

        const { name, timeInfo, status } = questionnaireInfo
        const { dueDate, dueTime, timeLimit } = timeInfo
        const questionnaire = await Questionnaire.create({
            name,
            dueDate, 
            dueTime, 
            timeLimit,
            status
        })
        if(!questionnaire) {
            throw new HttpError('SystemError', 'Create questionnaire failed.', 500)
        }
        
        const { eassayQuestions, choiceQuestions } = questionnaireInfo
        eassayQuestions.map(eassayQuestion => {
            const eassyQuestion_obj = EassyQuestion.create({
                question: eassayQuestion.question,
                number: eassayQuestion.number,
            })
            questionnaire.addEassyQuestion(eassyQuestion_obj)
        })
        choiceQuestions.map(choiceQuestion => {
            const choiceQuestion_obj = ChoiceQuestion.create({
                question: choiceQuestion.question,
                number: choiceQuestion.number,
                options: choiceQuestion.options.join(','),
                choice: choiceQuestion.choice
            })
            questionnaire.addChoiceQuestion(choiceQuestion_obj)
        })

        return questionnaire.id
    }

    async getQuestionnaireInfo(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const questionnaire = await Questionnaire.findByPk(id)
        if(!questionnaire) {
            throw new HttpError('NotFound', 'questionnaire not found.', 404)
        }

        const { name, dueDate, dueTime, timeLimit, status } = questionnaire
        const eassayQuestions = questionnaire.getEassyQuestions().map(eassayQuestion => {
            return {
                question: eassayQuestion.question,
                number: eassayQuestion.number
            }
        })
        const choiceQuestions = questionnaire.getChoiceQuestions().map(choiceQuestion => {
            return {
                question: choiceQuestion.question,
                number: choiceQuestion.number,
                options: choiceQuestion.options.split(','),
                choice: choiceQuestion.choice
            }
        })

        return {
            name,
            timeInfo: {
                dueDate,
                dueTime,
                timeLimit
            },
            status,
            eassayQuestions,
            choiceQuestions
        }
    }

    async updateQuestionnaireInfo(id, questionnaireInfo) {
        if(!id || !questionnaireInfo) {
            throw new HttpError('InvalidInputError', 'id and questionnaireInfo are required.', 400)
        }

        const questionnaire = await Questionnaire.findByPk(id)
        if(!questionnaire) {
            throw new HttpError('NotFound', 'questionnaire not found.', 404)
        }

        const { name, timeInfo, status } = questionnaireInfo
        const { dueDate, dueTime, timeLimit } = timeInfo
        questionnaire.name = name
        questionnaire.dueDate = dueDate
        questionnaire.dueTime = dueTime
        questionnaire.timeLimit = timeLimit
        questionnaire.status = status

        const { eassayQuestions, choiceQuestions } = questionnaireInfo
        eassayQuestions.map(eassayQuestion => {
            const eassyQuestion_obj = EassyQuestion.findCreateFind(
                {where: {
                    question: eassayQuestion.question,
                    number: eassayQuestion.number
                }}
            )
            questionnaire.addEassyQuestion(eassyQuestion_obj)
        })
        choiceQuestions.map(choiceQuestion => {
            const choiceQuestion_obj = ChoiceQuestion.findCreateFind(
                {where: {
                    question: choiceQuestion.question,
                    number: choiceQuestion.number,
                    options: choiceQuestion.options.join(','),
                    choice: choiceQuestion.choice
                }}
            )
            questionnaire.addChoiceQuestion(choiceQuestion_obj)
        })

        return questionnaire.save()
    }
}

export default ProjectService.getInstance()