//import _ from 'lodash'
import BaseService from './baseService.js'
import messageService from './messageService.js'
import userService from './userService.js'
//import logger from '../utils/logger.js'
import { HttpError } from '../utils/error.js'
import { User, Participant } from '../models/user.js'
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
    async createResearch(researchInfo) {
        if(!researchInfo) {
            throw new HttpError('InvalidInputError', 'researchInfo is required.', 400)
        }

        const { name, reward, headCount, description, status, appointment_id, questionnarie_id } = researchInfo
        const research_obj = await Research.create({
            name,
            reward,
            headCount,
            description,
            status,
            appointment_id,
            questionnarie_id
        })
        if(!research_obj) {
            throw new HttpError('SystemError', 'Create research failed.', 500)
        }

        const {picture_id, documents, cooperators, creator, preference} = researchInfo
        await research_obj.setPicture(picture_id)
        const documents_id = documents.map(document => document.id)
        await research_obj.setDocuments(documents_id)

        cooperators.map(async cooperator => {
            const user = await User.findOne({where: {email: cooperator}})
            if(!user) {
                //send invitation email and add it to wait list
                const sendInfo = messageService.sendEmail('account@pooling.tools', cooperator, 'Invitation Information', 'You have been invited to join the research:', name, ', please sign up and join us: www.pooling.tools')
                if(!sendInfo.messageId) {
                    //TODO: log error and send message
                }
                userService.addToWaitList(cooperator, research_obj.id)
            } else {
                //TODO:send message through websocket message service
                await research_obj.addUser(user, {through: {role: '1'}})
            }
        })
        await research_obj.addUser(creator, {through: {role: '0'}})

        const tags = preference.map(async tag => await Tag.findCreateFind({where: {name: tag}}))
        research_obj.setTags(tags)

        return research_obj.id
    }

    async getResearchInfo(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const research_obj = await Research.findByPk(id)
        if(!research_obj) {
            throw new HttpError('NotFound', 'research not found.', 404)
        }

        const { name, reward, headCount, description, status } = research_obj
        const picture_obj = await research_obj.getPicture()
        const picture_id = picture_obj.id
        const appointment_id = research_obj.appointment_id
        const questionnarie_id = research_obj.questionnaire_id
        const documents_obj = await research_obj.getDocuments()
        const documents = documents_obj.map(document => {
            return {id: document.id, name: document.name}
        })
        const cooperators_obj = await research_obj.getUsers({through: {where: {role: '1'}}})
        const cooperators= cooperators_obj.map(user => user.email)
        const preference_obj = await research_obj.getTags()
        const preference = preference_obj.map(tag => tag.name)

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

    async updateResearchInfo(id, researchInfo, operator) {
        if(!id || !researchInfo || !operator) {
            throw new HttpError('InvalidInputError', 'id and researchInfo are required.', 400)
        }

        if(id !== operator) {
            throw new HttpError('PermissionDenied', 'You have no permission to update this research.', 403)
        }

        const research_obj = await Research.findByPk(id)
        if(!research_obj) {
            throw new HttpError('NotFound', 'research not found.', 404)
        }

        const { name, reward, headCount, description, status, appointment_id, questionnarie_id } = researchInfo
        research_obj.name = name
        research_obj.reward = reward
        research_obj.headCount = headCount
        research_obj.description = description
        research_obj.status = status
        research_obj.appointment_id = appointment_id
        research_obj.questionnarie_id = questionnarie_id

        const {picture_id, documents, cooperators, preference} = researchInfo
        await research_obj.setPicture(picture_id)
        const documents_id = documents.map(document => document.id)
        await research_obj.setDocuments(documents_id)

        const old_cooperators_obj = research_obj.getUsers({through: {where: {role: '1'}}})
        old_cooperators_obj.map(async cooperator => {
            if(!cooperators.includes(cooperator.email)) {
                await research_obj.removeUser(cooperator)
            } else {
                cooperators.splice(cooperators.indexOf(cooperator.email), 1)
            }
        })
        cooperators.map(async cooperator => {
            const user = await User.findOne({where: {email: cooperator}})
            if(!user) {
                //send invitation email and add it to wait list
                const sendInfo = messageService.sendEmail('account@pooling.tools', cooperator, 'Invitation Information', 'You have been invited to join the research:', name, ', please sign up and join us: www.pooling.tools')
                if(!sendInfo.messageId) {
                    //TODO: log error and send message
                }
                userService.addToWaitList(cooperator, research_obj.id)
            } else {
                //TODO:send message through websocket message service
                await research_obj.addUser(user, {through: {role: '1'}})
            }
        })

        const tags = preference.map(async tag => await Tag.findCreateFind({where: {name: tag}}))
        await research_obj.setTags(tags)

        return await research_obj.save()
    }

    async createAppointment(appointmentInfo) {
        if(!appointmentInfo) {
            throw new HttpError('InvalidInputError', 'appointmentInfo is required.', 400)
        }

        const { name, timeInfo, meetingInfo, description } = appointmentInfo
        const { date, startTime, endTime } = timeInfo
        const appointment_obj = await Appointment.create({
            name,
            date,
            startTime,
            endTime,
            meetingInfo,
            description
        })
        if(!appointment_obj) {
            throw new HttpError('SystemError', 'Create appointment failed.', 500)
        }

        return appointment_obj.id
    }

    async getAppointmentInfo(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const appointment_obj = await Appointment.findByPk(id)
        if(!appointment_obj) {
            throw new HttpError('NotFound', 'appointment not found.', 404)
        }

        const { name, date, startTime, endTime, meetingInfo, description } = appointment_obj

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

    async updateAppointmentInfo(id, appointmentInfo, operator) {
        if(!id || !appointmentInfo || !operator) {
            throw new HttpError('InvalidInputError', 'id and appointmentInfo are required.', 400)
        }
        if(id !== operator) {
            throw new HttpError('PermissionDenied', 'You have no permission to update this appointment.', 403)
        }

        const appointment_obj = await Appointment.findByPk(id)
        if(!appointment_obj) {
            throw new HttpError('NotFound', 'appointment not found.', 404)
        }

        const { name, timeInfo, meetingInfo, description } = appointmentInfo
        const { date, startTime, endTime } = timeInfo
        appointment_obj.name = name
        appointment_obj.date = date
        appointment_obj.startTime = startTime
        appointment_obj.endTime = endTime
        appointment_obj.meetingInfo = meetingInfo
        appointment_obj.description = description

        return await appointment_obj.save()
    }

    async createQuestionnaire(questionnaireInfo) {
        if(!questionnaireInfo) {
            throw new HttpError('InvalidInputError', 'questionnaireInfo is required.', 400)
        }

        const { name, timeInfo, description, eassayQuestions, choiceQuestions } = questionnaireInfo
        const { dueDate, dueTime, timeLimit } = timeInfo
        const questionnaire_obj = await Questionnaire.create({
            name,
            dueDate, 
            dueTime, 
            timeLimit,
            description,
            essayNumber: eassayQuestions.length,
            choiceNumber: choiceQuestions.length
        })
        if(!questionnaire_obj) {
            throw new HttpError('SystemError', 'Create questionnaire failed.', 500)
        }
        
        eassayQuestions.map(async eassayQuestion => {
            await EassyQuestion.create({
                question: eassayQuestion.question,
                number: eassayQuestion.number,
                questionnaire_id: questionnaire_obj.id
            })
        })
        choiceQuestions.map(async choiceQuestion => {
            await  ChoiceQuestion.create({
                question: choiceQuestion.question,
                number: choiceQuestion.number,
                options: choiceQuestion.options.join(','),
                choice: choiceQuestion.choice,
                questionnaire_id: questionnaire_obj.id
            })
        })

        return questionnaire_obj.id
    }

    async getQuestionnaireInfo(id) { 
        if(!id) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const questionnaire_obj = await Questionnaire.findByPk(id)
        if(!questionnaire_obj) {
            throw new HttpError('NotFound', 'questionnaire not found.', 404)
        }

        const eassayQuestions_obj = await EassyQuestion.findAll({where: {questionnaire_id: id}})
        const eassayQuestions = eassayQuestions_obj.map(eassayQuestion => {
            return {
                question: eassayQuestion.question,
                number: eassayQuestion.number
            }
        })
        const choiceQuestions_obj = await ChoiceQuestion.findAll({where: {questionnaire_id: id}})
        const choiceQuestions = choiceQuestions_obj.map(choiceQuestion => {
            return {
                question: choiceQuestion.question,
                number: choiceQuestion.number,
                options: choiceQuestion.options.split(','),
                choice: choiceQuestion.choice
            }
        })

        const { name, dueDate, dueTime, timeLimit, description } = questionnaire_obj

        return {
            name,
            timeInfo: {
                dueDate,
                dueTime,
                timeLimit
            },
            description,
            eassayQuestions,
            choiceQuestions
        }
    }

    async updateQuestionnaireInfo(id, questionnaireInfo, operator) {
        if(!id || !questionnaireInfo || !operator) {
            throw new HttpError('InvalidInputError', 'id and questionnaireInfo are required.', 400)
        }
        if(id !== operator) {
            throw new HttpError('PermissionDenied', 'You have no permission to update this questionnaire.', 403)
        }

        const questionnaire_obj = await Questionnaire.findByPk(id)
        if(!questionnaire_obj) {
            throw new HttpError('NotFound', 'questionnaire not found.', 404)
        }

        const { name, timeInfo, description } = questionnaireInfo
        const { dueDate, dueTime, timeLimit } = timeInfo
        questionnaire_obj.name = name
        questionnaire_obj.dueDate = dueDate
        questionnaire_obj.dueTime = dueTime
        questionnaire_obj.timeLimit = timeLimit
        questionnaire_obj.description = description

        const eassayQuestions_obj = await EassyQuestion.findAll({where: {questionnaire_id: id}})
        eassayQuestions_obj.map(async eassayQuestion => await eassayQuestion.destroy())
        const choiceQuestions_obj = await ChoiceQuestion.findAll({where: {questionnaire_id: id}})
        choiceQuestions_obj.map(async choiceQuestion => await choiceQuestion.destroy())

        const { eassayQuestions, choiceQuestions } = questionnaireInfo
        eassayQuestions.map(async eassayQuestion => {
            await EassyQuestion.findCreateFind(
                {where: {
                    question: eassayQuestion.question,
                    number: eassayQuestion.number,
                    questionnaire_id: questionnaire_obj.id
                }}
            )
        })
        choiceQuestions.map(async choiceQuestion => {
            await  ChoiceQuestion.findCreateFind(
                {where: {
                    question: choiceQuestion.question,
                    number: choiceQuestion.number,
                    options: choiceQuestion.options.join(','),
                    choice: choiceQuestion.choice,
                    questionnaire_id: questionnaire_obj.id
                }}
            )
        })

        return questionnaire_obj.save()
    }

    async uploadQuestionnaireAnswer(id, answer, operator) {
        if(!id || !answer || !operator) {
            throw new HttpError('InvalidInputError', 'id and answer are required.', 400)
        }

        const participant_obj = await Participant.findOne({where: {user_id: operator}})
        if(!participant_obj) {
            throw new HttpError('NotFound', 'participant not found.', 404)
        }

        const research_obj = await Research.findOne({where: {questionnarie_id: id}})
        if(!research_obj) {
            throw new HttpError('NotFound', 'research not found.', 404)
        }
        if(!participant_obj.hasResearch(research_obj)) {
            throw new HttpError('PermissionDenied', 'You have no permission to upload answer to this questionnaire.', 403)
        }

        const { eassayAnswers, choiceAnswers } = answer
        const eassayQuestions_obj = await EassyQuestion.findAll({ where: { questionnaire_id: id }})
        const choiceQuestions_obj = await ChoiceQuestion.findAll({ where: { questionnaire_id: id }})
        eassayAnswers.map(async eassayAnswer => {
            const eassayQuestion = eassayQuestions_obj.find(eassayQuestion => eassayQuestion.number === eassayAnswer.number)
            participant_obj.setEassyQuestion(eassayQuestion, { through: { answer: eassayAnswer.answer }})
        })
        choiceAnswers.map(async choiceAnswer => {
            const choiceQuestion = choiceQuestions_obj.find(choiceQuestion => choiceQuestion.number === choiceAnswer.number)
            const answer = choiceAnswer.answer.join(',')
            participant_obj.setChoiceQuestion(choiceQuestion, { through: { answer }})
        })

        return true
    }

    async getFeed(operator) {
        if(!operator) {
            throw new HttpError('InvalidInputError', 'operator is required.', 400)
        }
        const researches_obj = await Research.findAndCountAll({where: {status: 'in progress'}})
        const user = await User.findByPk(operator)
        //should be optimized
        const researches_feed = researches_obj.rows.filter(research => !user.hasResearch(research))

        return researches_feed
    }

    async joinResearch(id, user) {
        if(!id || !user) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const research_obj = await Research.findByPk(id)
        if(!research_obj) {
            throw new HttpError('NotFound', 'research not found.', 404)
        }
        if(research_obj.status !== 'in progress') {
            throw new HttpError('PermissionDenied', 'You have no permission to join this research.', 403)
        }
        if(research_obj.headCount <= research_obj.getParticipants().length) {
            throw new HttpError('PermissionDenied', 'The research is full.', 403)
        }
        research_obj.addUser(user, {through: {role: '2'}})

        return true
    }

    async getSchedule(user) {
        if(!user) {
            throw new HttpError('InvalidInputError', 'user is required.', 400)
        }

        const participant_obj = await Participant.findByPk(user)
        const researches_obj = await participant_obj.getResearches()
        const appointments = researches_obj.map(async research => {
            const appointment_obj = await Appointment.findByPk(research.appointment_id)
            return {
                id: appointment_obj.id,
                name: appointment_obj.name,
                timeInfo: {
                    date: appointment_obj.date,
                    startTime: appointment_obj.startTime,
                    endTime: appointment_obj.endTime
                },
                meetingInfo: appointment_obj.meetingInfo,
                description: appointment_obj.description
            }
        })
        const questionnaires = researches_obj.map(async research => {
            const questionnaire_obj = await Questionnaire.findByPk(research.questionnarie_id)
            const eassayQuestions_obj = await EassyQuestion.findAll({where: {questionnaire_id: questionnaire_obj.id}})
            const choiceQuestions_obj = await ChoiceQuestion.findAll({where: {questionnaire_id: questionnaire_obj.id}})
            const eassayQuestions = eassayQuestions_obj.map(eassayQuestion => {
                return {
                    question: eassayQuestion.question,
                    number: eassayQuestion.number
                }
            })
            const choiceQuestions = choiceQuestions_obj.map(choiceQuestion => {
                return {
                    question: choiceQuestion.question,
                    number: choiceQuestion.number,
                    options: choiceQuestion.options.split(','),
                    choice: choiceQuestion.choice
                }
            })
            return {
                id: questionnaire_obj.id,
                name: questionnaire_obj.name,
                timeInfo: {
                    dueDate: questionnaire_obj.dueDate,
                    dueTime: questionnaire_obj.dueTime,
                    timeLimit: questionnaire_obj.timeLimit
                },
                eassayQuestions,
                choiceQuestions,
                description: questionnaire_obj.description
            }
        })
        return {
            appointments,
            questionnaires
        }
    }

    async getHistory(user) {
        if(!user) {
            throw new HttpError('InvalidInputError', 'user is required.', 400)
        }

        const participant_obj = await Participant.findByPk(user)
        const researches_obj = await participant_obj.getResearches()
        const researches = researches_obj.map(async research => {
            return this.getResearchInfo(research.id)
        })
        return researches
    }
}

export default ProjectService.getInstance()