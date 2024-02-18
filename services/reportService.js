import BaseService from './baseService.js'
import { HttpError } from '../utils/error.js'
import { Research, Questionnaire, EassyQuestion, ChoiceQuestion } from '../models/project.js'
import Participant from '../models/participant.js'

class ReportService extends BaseService {
    constructor() {
        super()
    }

    /**
     * @description: service class should be singler mode
     * @return {*}
     */
    static getInstance() {
        if(!this._instance){
            this._instance = new ReportService()
        }
        return this._instance
    }

    async getQuestionnaireResult(id, user, operator) {
        if(!id || !user || !operator) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }
        if(user !== operator) {
            throw new HttpError('PermissionDenied', 'You have no permission to get this report.', 403)
        }
        return await this._resultOfQuestionnaire(id, user)
    }

    async getQuestionnaireReport(id, operator) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'id is required.', 400)
        }

        const research_obj = await Research.findOne({where: {questionnarie_id: id}})
        if(!research_obj) {
            throw new HttpError('NotFound', 'research not found.', 404)
        }
        const cooperators = research_obj.getUsers({through: {where: {role: '1'}}})
        const ids = cooperators.map(cooperator => cooperator.id)
        if(!ids.includes(operator)) {
            throw new HttpError('PermissionDenied', 'You have no permission to get this report.', 403)
        }

        return await this._reportOfQuestionnaire(id)
    }

    async _resultOfQuestionnaire(id, user) {
        if(!id) {
            throw new Error('id is required.')
        }
        const participant_obj = await Participant.findOne({where: {user_id: user}})
        if(!participant_obj) {
            throw new Error('participant not found.')
        }
        const eassayAnswers_obj = await participant_obj.getEassyQuestions()
        const eassayAnswers = eassayAnswers_obj.map(async eassayAnswer => {
            const eassayQuestion = await EassyQuestion.findByPk(eassayAnswer.eassayQuestionId)
            if(eassayQuestion.questionnaire_id === id) {
                return {
                    id: eassayQuestion.id,
                    answer: eassayAnswer.answer
                }
            }
        })
        const choiceAnswers_obj = await participant_obj.getChoiceQuestions()
        const choiceAnswers = choiceAnswers_obj.map(async choiceAnswer => {
            const choiceQuestion = await ChoiceQuestion.findByPk(choiceAnswer.choiceQuestionId)
            if(choiceQuestion.questionnaire_id === id) {
                return {
                    id: choiceQuestion.id,
                    answer: choiceAnswer.answer.split(',')
                }
            }
        })

        return {
            user_id: user,
            eassayAnswers,
            choiceAnswers
        }
    }
        

    async _reportOfQuestionnaire(id) {
        if(!id) {
            throw new Error('id is required.')
        }

        const questionnaire_obj = await Questionnaire.findByPk(id)
        if(!questionnaire_obj) {
            throw new Error('questionnaire not found.')
        }

        const research_obj = await Research.findOne({where: {questionnarie_id: id}})
        const users_obj = await research_obj.getUsers({through: {where: {role: '2'}}})
        const results = users_obj.map(async user => this._resultOfQuestionnaire(id, user.id))
        const eassayQuestions_obj = await EassyQuestion.findAll({ where: { questionnaire_id: id }})
        const eassayQuestions = eassayQuestions_obj.map(eassayQuestion => {
            const answers = results.map(result => {
                if(result.eassayAnswers.id === eassayQuestion.id) {
                    return result.eassayAnswers.answer
                }
            })
            return {
                number: eassayQuestion.number,
                question: eassayQuestion.question,
                answers
            }
        })
        const choiceQuestions_obj = await ChoiceQuestion.findAll({ where: { questionnaire_id: id }})
        const choiceQuestions = choiceQuestions_obj.map(choiceQuestion => {
            let answers = []
            for(let i = 0; i < choiceQuestion.options.length; i++) {
                let count = 0
                let total = 0
                results.map(result => {
                    if(result.choiceAnswers.id === choiceQuestion.id){
                        total++
                        if(result.choiceAnswers.answer.includes(choiceQuestion.options[i])) {
                            count++
                        }
                    }
                })
                answers[i] = {
                    option: choiceQuestion.options[i],
                    ratio: count / total,
                    count
                }
            }
            return {
                number: choiceQuestion.number,
                question: choiceQuestion.question,
                answers
            }
        })
        return {
            id: questionnaire_obj.id,
            name: questionnaire_obj.name,
            eassayQuestions,
            choiceQuestions,
            description: questionnaire_obj.description
        }
    }
}

export default ReportService.getInstance()