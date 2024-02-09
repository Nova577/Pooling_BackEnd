import _ from 'lodash'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import BaseService from './baseService.js'
import messageService from './messageService.js'
import logger from '../utils/logger.js'
import { HttpError } from '../utils/error.js'
import { User, Participant, Researcher } from '../models/user.js'
import { Research } from '../models/project.js'
import { Tag } from '../models/tag.js'
import { Country, State, Section, Occupation, Institute, Title } from '../models/maps.js'

class UserService extends BaseService {

    constructor() {
        super()
        this._userTokens = []
        this._codeList = []
        this._waitList = []
    }

    /**
     * @description: service class should be singler mode
     * @return {*}
     */
    static getInstance() {
        if(!this._instance){
            this._instance = new UserService()
        }
        return this._instance
    }

    /**
     * @description: check username and password, then create token
     * @param {*} username
     * @param {*} password
     * @return {*}
     */
    async signIn(username, password) {
        if(!username || !password) {
            throw new HttpError('InvalidInputError', 'please enter username and password.', 400)
        }
        const user = await User.findOne({ where: { email: username }})
        const passwordCorrect = (user === null
            ? false
            : await bcrypt.compare(password, user.passwordHash)
        )
        
        if (!(user && passwordCorrect)) {
            throw new HttpError('InvalidInputError', 'invalid username or password.', 401)
        }
    
        const userForToken = {
            id: user.id,
            email : user.email,
            type : user.type
        }
    
        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            {
                expiresIn: '2h'
            }
        )

        const time = new Date().getTime().toString()

        const saltRounds = 10
        const refreshToken = bcrypt.hashSync(time.concat(token), saltRounds)

        this._userTokens.push({userForToken, refreshToken})

        //remove refreshToken from list after 7 days
        setTimeout(() => {
            const index = this._userTokens.findIndex(obj => obj.refreshToken === refreshToken)
            if(index !== -1) {
                this._userTokens.splice(index, 1)
            }
        }, 604800000)

        return { id : user.id, type : user.type, token, refreshToken }
    }

    addToWaitList(email, research_id) {
        if(!email) {
            throw new HttpError('InvalidInputError', 'please enter email.', 400)
        }
        const index = this._waitList.findIndex(obj => obj.email === email)
        if(index !== -1) {
            const waitInfo = {
                email,
                researches: [research_id]
            }
            this._waitList.push(waitInfo)
        } else if(!this._waitList[index].researches.includes(research_id)){
            this._waitList[index].researches.push(research_id)
        }
    }

    async resetPassword(username, password) {
        if(!username || !password) {
            throw new HttpError('InvalidInputError', 'please enter username and password.', 400)
        }

        const index = this._codeList.findIndex(obj => obj.email === username)
        if(index === -1 || this._codeList[index].code !== 'checked') {
            throw new HttpError('InvalidInputError', 'please check code first.', 400)
        }
        
        const user = User.findOne({ where: { email: username }})
        if(!user) {
            throw new HttpError('InvalidInputError', 'invalid username.', 401)
        }

        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)

        await user.setDataValue('passwordHash', passwordHash)
    }

    /**
     * @description: delete the refreshToken from list set it loggout
     * @param {*} token
     * @return {*}
     */
    signOut(token) {
        if(!token) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 401)
        }
        
        const userForToken = jwt.verify(
            token,
            process.env.SECRET
        )

        const index = this._userTokens.findIndex(obj => obj.userForToken === userForToken)
        if(index !== -1) {
            this._userTokens.splice(index, 1)
        }

        return true
    }

    /**
     * @description: refresh token when token expired
     * @param {*} token
     * @param {*} refreshToken
     * @return {*}
     */
    async refreshToken(refreshToken) {
        if(!refreshToken) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 400)
        }

        const index = this._userTokens.findIndex(obj => obj.refreshToken === refreshToken)
        if(index === -1) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 400)
        }

        const newToken = jwt.sign(
            this._userTokens[index].userForToken,
            process.env.SECRET,
            {
                expiresIn: '2h'
            }
        )

        const time = new Date().getTime().toString()
        const saltRounds = 10
        const newRefreshToken = bcrypt.hashSync(time.concat(newToken), saltRounds)

        this._userTokens[index].refreshToken = newRefreshToken

        return newToken
    }

    async sendCode(type, email) {
        if(!type || !email) {
            throw new HttpError('InvalidInputError', 'please enter type and email.', 400)
        }
        const participant =  await Participant.findOne({ where: { email }})
        const researcher = await Researcher.findOne({ where: { email }})
        if(type === 'signUp' && (participant || researcher)) {
            throw new HttpError('InvalidInputError', 'email already exist.', 400)
        } else if (type === 'resetPassword' && (!participant && !researcher)) {
            throw new HttpError('NotFound', 'user not found', 404)
        } else {
            const code = Math.random().toString().slice(-6)
            const sendInfo = messageService.sendEmail('account@pooling.tools', email, 'Confirm Information', 'Your email check code is: ' + code + '. It will expire in 15 minutes.')
            if(!sendInfo.messageId) {
                throw new HttpError('SystemError', 'send email failed.', 500)
            }
            this._codeList.push({email, code})
            //remove code from list after 15 minutes
            setTimeout(() => {
                const index = this._codeList.findIndex(obj => obj.email === email)
                if(index !== -1) {
                    this._codeList.splice(index, 1)
                }
            }, 900000)
            return true
        }
    }

    async checkCode(email, code) {
        if(!email || !code) {
            throw new HttpError('InvalidInputError', 'please enter email and code.', 400)
        }

        const index = this._codeList.findIndex(obj => obj.email === email)
        if(index === -1 || this._codeList[index].code !== code) {
            throw new HttpError('InvalidInputError', 'code expired or invalid code.', 400)
        }
        this.codeList.splice(index, 1, {email, code: 'checked'})
        return true
    }

    /**
     * @description: create user by type
     * @param {*} userInfo
     * @param {*} type 0:participant, 1: researcher
     * @return {*}
     */
    async createUser(userInfo, type) {
        if(!userInfo || !type) {
            throw new HttpError('InvalidInputError', 'please enter user info.', 400)
        }

        const index = this._codeList.findIndex(obj => obj.email === userInfo.email)
        if(index === -1 || this._codeList[index].code !== 'checked') {
            throw new HttpError('InvalidInputError', 'please check code first.', 400)
        }
        
        const { country, state } = userInfo
        const country_obj = await Country.findOne({ where: { name: country }})
        const state_obj = await State.findOne({ where: { name: state }})
        if(!country_obj || !state_obj) {
            throw new HttpError('InvalidInputError', 'invalid country or state.', 500)
        }

        const { email, password, firstName, lastName, sex, birth} = userInfo

        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)

        const user = await User.create({
            email,
            passwordHash,
            firstName,
            lastName,
            sex,
            birth,
            type,
            country_id: country_obj.id,
            state_id: state_obj.id
        })
        if(!user){
            logger.error('create user failed.')
            throw new HttpError('SystemError', 'create user failed.', 500)
        }
        
        if (type === 0) {
            const { section, occupation, tags } = userInfo
            const participant = await this._createParticipant(
                { user, section, occupation, tags }
            )
            if(!participant){
                User.destroy({ where: { id: user.id }, force: true})
                throw new HttpError('SystemError', 'create user failed.', 500)
            }
        } else if (type === 1) {
            const { institute, title, relatedLinks, tags } = userInfo
            const researcher = await this._createResearcher(
                { user, institute, title, relatedLinks, tags }
            )
            if(!researcher){
                User.destroy({ where: { id: user.id }, force: true})
                throw new HttpError('SystemError', 'create user failed.', 500)
            }
        }

        return true
    }

    /**
     * @description: get user info by id
     * @param {*} id
     * @return {*}
     */
    async getUserInfo(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'please enter user id.', 400)
        }
        const user = await User.findByPk(id)
        if(!user) {
            throw new HttpError('NotFound', 'user not found', 404)
        }

        const country_obj = await Country.findByPk(user.country_id)
        const state_obj = await State.findByPk(user.state_id)
        const country = country_obj.name
        const state = state_obj.name
        let userInfo = Object.assign(user.get(), { country, state })

        userInfo = _.omit(userInfo, ['passwordHash', 'type', 'country_id', 'state_id', 'createdAt', 'updatedAt', 'deletedAt'])

        let roleInfo = null
        if(user.type === '0') {
            roleInfo = await this._getParticipant(id)
        } else if (user.type  === '1') {
            roleInfo = await this._getResearcher(id)
        }
        if(!roleInfo) {
            throw new HttpError('NotFound', 'user info lost', 404)
        }


        return Object.assign(userInfo, roleInfo)
    }

    /**
     * @description: update user info by id
     * @param {*} id
     * @param {*} userInfo
     * @return {*}
     */
    async updateUserInfo(id, userInfo, operator) {
        if(!id || !userInfo) {
            throw new HttpError('InvalidInputError', 'please enter user info.', 400)
        }
        if(id !== operator) {
            throw new HttpError('PermissonDenied', 'you have no permission.', 403)
        }

        const user = await User.findByPk(id)
        if(!user) {
            throw new HttpError('NotFound', 'user not found', 404)
        }

        let result = false
        if(user.type === '0') {
            result = this._updateParticipant(id, userInfo)
        } else if (user.type  === '1') {
            result = this._updateResearcher(id, userInfo)
        }

        if(!result){
            throw new HttpError('SystemError', 'update user failed.', 500)
        }

        return true
    }

    /**
     * @description: create participant, private func
     * @param {*} participantInfo
     * @return {*}
     */
    async _createParticipant(participantInfo) {
        if(!participantInfo) {
            return null
        }

        const { user, section, occupation, tags} = participantInfo
        const section_obj = await Section.findOne({where: {name: section}})
        const occupation_obj = await Occupation.findOne({where: {name: occupation}})
        if(!section_obj || !occupation_obj) {
            logger.error('Invalid section and occupation.')
            return null
        }

        const participant = await Participant.create({
            user_id: user.id,
            section_id: section_obj.id,
            occupation_id: occupation_obj.id
        })
        if(!participant){
            return null
        }

        let tags_list = []
        tags.pets.forEach(tag => tags_list.push({name: tag, type: 'pets'}))
        tags.medicalHistory.forEach(tag => tags_list.push({name: tag, type: 'medicalHistory'}))
        tags.other.forEach(tag => tags_list.push({name: tag, type: 'other'}))
        const tags_obj_list = []
        for (let tag of tags_list) {
            const tag_obj = await Tag.findCreateFind({where: tag})
            tags_obj_list.push(tag_obj[0])
        }
        await participant.setTags(tags_obj_list)

        return participant
    }

    /**
     * @description: create researcher, private func
     * @param {*} researcherInfo
     * @return {*}
     */
    async _createResearcher(researcherInfo) {
        if(!researcherInfo) {
            return null
        }

        const { user, institute, title, relatedLinks, tags } = researcherInfo
        const institute_obj = await Institute.findOne({where: {name: institute}})
        const title_obj = await Title.findOne({where: {name: title}})
        if(!institute_obj || !title_obj) {
            logger.error('Invalid institute and title.')
            return null 
        }
        const links_row = relatedLinks.join(',')
        
        const researcher = await Researcher.create({
            user_id: user.id,
            institute_id: institute_obj.id,
            title_id: title_obj.id,
            relatedLinks: links_row
        })
        if(!researcher){
            return null 
        }

        let tags_list = []
        tags.researchFields.forEach(tag => tags_list.push({ name: tag, type: 'researchFields'}))
        tags.other.forEach(tag => tags_list.push({ name: tag, type: 'other'}))
        let tags_obj_list = []
        for (let tag of tags_list) {
            const tag_obj = await Tag.findCreateFind({ where: tag})
            tags_obj_list.push(tag_obj[0])
        }
        await researcher.setTags(tags_obj_list)

        const index = this._waitList.findIndex(obj => obj.email === user.email)
        if(index !== -1) {
            const waitInfo = this._waitList[index]
            for (let research_id of waitInfo.researches) {
                const research = await Research.findByPk(research_id)
                if(research) {
                    await research.addResearcher(researcher)
                }
            }
            this._waitList.splice(index, 1)
        }

        return researcher
    }
    
    /**
     * @description: get participant by id
     * @param {*} id
     * @return {*}
     */
    async _getParticipant(id) {
        if(!id) {
            return null
        }

        const participant = await Participant.findOne({ where: { user_id: id }})
        if(!participant) {
            return null
        }

        const tags_obj = await participant.getTags()
        let pets = []
        let medicalHistory = []
        let other = []
        tags_obj.forEach(tag => {
            if(tag.type === 'pets') {
                pets.push(tag.name)
            } else if(tag.type === 'medicalHistory') {
                medicalHistory.push(tag.name)
            } else if(tag.type === 'other') {
                other.push(tag.name)
            }
        })
        const tags = { pets, medicalHistory, other}

        const section_obj = await Section.findByPk(participant.section_id)
        const occupation_obj = await Occupation.findByPk(participant.occupation_id)
        const section = section_obj.name
        const occupation = occupation_obj.name

        const participantInfo = Object.assign(participant.get(), { tags, section, occupation })

        return _.omit(participantInfo, ['id', 'user_id', 'section_id', 'occupation_id', 'createdAt', 'updatedAt', 'deletedAt'])
    }

    /**
     * @description: get researcher by id
     * @param {*} id
     * @return {*}
     */
    async _getResearcher(id) {
        if(!id) {
            return null
        }

        const researcher = await Researcher.findOne({ where: { user_id: id }})
        if(!researcher) {
            return null
        }

        const tags_obj = await researcher.getTags()
        let fields = []
        let other = []
        tags_obj.forEach(tag => {
            if(tag.type === 'fields') {
                fields.push(tag.name)
            } else if(tag.type === 'other') {
                other.push(tag.name)
            }
        })
        const tags = { fields, other}

        const institute_obj = await Institute.findByPk(researcher.institute_id)
        const title_obj = await Title.findByPk(researcher.title_id)
        const institute = institute_obj.name
        const title = title_obj.name
        const relatedLinks = researcher.relatedLinks.split(',')
        
        const researcherInfo = Object.assign(researcher.get, {tags, institute, title, relatedLinks})

        return _.omit(researcherInfo, ['id','user_id', 'institute_id', 'title_id', 'createdAt', 'updatedAt', 'deletedAt'])
    }

    /**
     * @description: update participant info by id
     * @param {*} id
     * @return {*}
     */
    async _updateParticipant(id, userInfo) {
        if(!id || !userInfo) {
            return false
        }
        
        const participant = await Participant.findOne({ where: { user_id: id }})
        if(!participant) {
            return false
        }
        
        const {section, occupation, tags, description} = userInfo

        const section_obj = await Section.findOne({where: {name: section}})
        const occupation_obj = await Occupation.findOne({where: {name: occupation}})
        if(!section_obj.has(occupation_obj)) {
            return false 
        }
        
        let tags_list = []
        tags.pets.forEach(tag => tags_list.push({name: tag, type: 'pets'}))
        tags.medicalHistory.forEach(tag => tags_list.push({name: tag, type: 'medicalHistory'}))
        tags.other.forEach(tag => tags_list.push({name: tag, type: 'other'}))
        const tags_obj_list = []
        for (let tag of tags_list) {
            const tag_obj = await Tag.findCreateFind({where: tag})
            tags_obj_list.push(tag_obj[0])
        }
        await participant.setTags(tags_obj_list)

        participant.set({ section_id: section_obj.id, occupation_id: occupation_obj.id, description })
        await participant.save()
        
        return true
    }

    /**
     * @description: update researcher info by id
     * @param {*} id
     * @return {*}
     */
    async _updateResearcher(id, userInfo) {
        if(!id || !userInfo) {
            return false
        }

        const researcher = await Researcher.findOne({ where: { user_id: id }})
        if(!researcher) {
            return false
        }

        const {institute, title, relatedLinks, tags, description} = userInfo

        const institute_obj = await Institute.findOne({ where: { name: institute }})
        const title_obj = await Title.findOne({ where: { name: title }})
        if(!institute_obj.has(title_obj)) {
            return false
        }
        
        let tags_list = []
        tags.researchFields.forEach(tag => tags_list.push({ name: tag, type: 'researchFields'}))
        tags.other.forEach(tag => tags_list.push({ name: tag, type: 'other'}))
        let tags_obj_list = []
        for (let tag of tags_list) {
            const tag_obj = await Tag.findCreateFind({ where: tag})
            tags_obj_list.push(tag_obj[0])
        }
        await researcher.setTags(tags_obj_list)

        const links_row = relatedLinks.join(',')
        researcher.set({ institute_id: institute_obj.id, title_id: title_obj.id, relatedLinks: links_row, description })
        await researcher.save()
        
        return true
    }
}



export default UserService.getInstance()