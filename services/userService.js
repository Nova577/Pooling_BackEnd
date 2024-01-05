import _ from 'lodash'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import BaseService from './baseService.js'
import logger from '../utils/logger.js'
import { HttpError } from '../utils/error.js'
import { User, Participant, Researcher } from '../models/user.js'
import { Tag } from '../models/tag.js'
import { Country, State, Industry, Position, Institute, Title } from '../models/maps.js'

class UserService extends BaseService {

    constructor() {
        super()
        this._userTokens = []
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
            return new HttpError('InvalidInputError', 'please enter username and password.', 400)
        }
        const user = await User.findOne({ where: { email: username }})
        const passwordCorrect = (user === null
            ? false
            : bcrypt.compare(password, user.passwordHash)
        )
        
        if (!(user && passwordCorrect)) {
            return new HttpError('InvalidInputError', 'invalid username or password.', 401)
        }
    
        const userForToken = {
            id: user.id,
            email : user.email,
            type : user.type
        }
    
        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            '2h',
            error => {
                if(error) {
                    logger.error(`JWT sign failed: ${error.name} ${error.message}.`)
                    throw(error)
                }
            }
        )

        const refreshToken = jwt.sign(
            userForToken,
            process.env.SECRET,
            '7d',
            error => {
                if(error) {
                    logger.error(`JWT sign failed: ${error.name} ${error.message}.`)
                    throw(error)
                }
            }
        )

        const saltRounds = 10
        const refreshTokenHash = bcrypt.hashSync(refreshToken.concat(token), saltRounds)

        this._userTokens.push({userForToken, refreshTokenHash})

        return { id : user.id, type : user.type, token, refreshToken }
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
    async refreshToken(token, refreshToken) {
        if(!token || !refreshToken) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 400)
        }

        const userForToken = jwt.verify(
            token,
            process.env.SECRET
        )

        const index = this._userTokens.findIndex(obj => obj.userForToken === userForToken)
        if(index === -1) {
            throw new HttpError('JsonWebTokenError', 'user has been logged out.', 401)
        }
        if(!bcrypt.compare(refreshToken.concat(token), this._userTokens[index].refreshTokenHash)) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 401)
        }

        const newToken = jwt.sign(
            userForToken,
            process.env.SECRET,
            '2h',
            error => {
                if(error) {
                    logger.error(`JWT sign failed: ${error.name} ${error.message}.`)
                    throw(error)
                }
            }
        )

        const saltRounds = 10
        const refreshTokenHash = bcrypt.hashSync(refreshToken.concat(newToken), saltRounds)

        Object.assign(this._userTokens[index], refreshTokenHash)

        return newToken
    }

    /**
     * @description: create user by type
     * @param {*} userInfo
     * @param {*} type 0:participant, 1: researcher
     * @return {*}
     */
    async createUser(userInfo, type) {
        if(!userInfo) {
            throw new HttpError('InvalidInputError', 'please enter user info.', 400)
        }

        const {country, state} = userInfo
        const country_obj = await Country.findOne({ where: { name: country }})
        const state_obj = await State.findOne({ where: { name: state }})
        if(!country_obj || !state_obj) {
            throw new HttpError('InvalidInputError', 'invalid country or state.', 500)
        }

        const { email, password, name, sex, birth} = userInfo

        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)

        const user = User.build({
            email,
            passwordHash,
            name,
            sex,
            birth,
            type
        })
        if(!user){
            logger.error('create user failed.')
            throw new HttpError('SystemError', 'create user failed.', 500)
        }
        
        if (type === 0) {
            const { industry, position, tags, description } = userInfo
            const participant = await this._createParticipant(
                { industry, position, tags, description }
            )
            if(!participant){
                throw new HttpError('SystemError', 'create user failed.', 500)
            }
            await user.save()
            user.setParticipant(participant)

        } else if (type === 1) {
            const { institute, title, links, tags, description } = userInfo
            const researcher = await this._createResearcher(
                { institute, title, links, tags, description }
            )
            if(!researcher){
                throw new HttpError('SystemError', 'create user failed.', 500)
            }
            await user.save()
            user.setResearcher(researcher)
        }

        await user.setCountry(country_obj)
        await user.setState(state_obj)

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
        const userInfo = _.omit(user.get(), ['passwordHash', 'type', 'country_id', 'state_id', 'createdAt', 'updatedAt', 'deletedAt'])

        let roleInfo = null
        if(user.type === 0) {
            roleInfo = this._getParticipant(id)
        } else if (user.type  === 1) {
            roleInfo = this._getResearcher(id)
        }
        if(!roleInfo) {
            throw new HttpError('NotFound', 'user info lost', 404)
        }

        return Object.assign(userInfo, roleInfo).toJSON()
    }

    /**
     * @description: update user info by id
     * @param {*} id
     * @param {*} userInfo
     * @return {*}
     */
    async updateUserInfo(id, userInfo) {
        if(!id || !userInfo) {
            throw new HttpError('InvalidInputError', 'please enter user info.', 400)
        }
        
        const user = await User.findByPk(id)
        if(!user) {
            throw new HttpError('NotFound', 'user not found', 404)
        }

        let result = false
        switch(user.type) {
        case 0:
            result = this._updateParticipant(id, userInfo)
            break
        case 1:
            result = this._updateResearcher(id, userInfo)
            break
        default:
            break
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

        const { industry, position, tags, description} = participantInfo
        const industry_obj = await Industry.findOne({where: {name: industry}})
        const position_obj = await Position.findOne({where: {name: position}})
        if(!industry_obj.has(position_obj)) {
            logger.error('Invalid industry and position.')
            return null
        }
        const tags_pets = tags.pets.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'pets'}}))
        const tags_medicalHistory = tags.medicalHistory.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'medicalHistory'}}))
        const tags_other = tags.other.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'other'}}))
        const tags_obj = tags_pets.concat(tags_medicalHistory).concat(tags_other)

        const participant = await Participant.create({
            description
        })
        if(!participant){
            return null
        }

        await participant.setIndustry(industry_obj)
        await participant.setPosition(position_obj)
        await participant.addTags(tags_obj)

        return participant
    }

    /**
     * @description: create researcher, private func
     * @param {*} participantInfo
     * @return {*}
     */
    async _createResearcher(researcherInfo) {
        if(!researcherInfo) {
            return null
        }

        const { institute, title, relatedLinks, tags, description } = researcherInfo
        const institute_obj = await Institute.findOne({where: {name: institute}})
        const title_obj = await Title.findOne({where: {name: title}})
        if(!institute_obj.has(title_obj)) {
            logger.error('Invalid institute and title.')
            return null 
        }
        const links_row = relatedLinks.join(',')
        const tags_fields = tags.pets.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'fields'}}))
        const tags_other = tags.other.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'other'}}))
        const tags_obj = tags_fields.concat(tags_other)
        
        const researcher = await Researcher.create({
            relatedLinks: links_row,
            description
        })
        if(!researcher){
            return null 
        }

        await researcher.setInstitute(institute_obj)
        await researcher.setTitle(title_obj)
        await researcher.setTags(tags_obj)

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

        const participant = await Participant.findOne({ where : { user_id : id }})
        if(!participant) {
            return null
        }

        const tags_obj = participant.getTags()
        const pets = tags_obj.map(tag => {
            if(tag.type === 'pets') {
                return tag.name
            }
        })
        const medicalHistory = tags_obj.map(tag => {
            if(tag.type === 'medicalHistory') {
                return tag.name
            }
        })
        const other = tags_obj.map(tag => {
            if(tag.type === 'other') {
                return tag.name
            }
        })
        const tags = { pets: pets, medicalHistory: medicalHistory, other: other}

        const industry = participant.getIndustry().name
        const position = participant.getPosition().name

        const newParticipant = Object.assign(participant.get(), {tags, industry, position})

        return _.omit(newParticipant, ['id', 'user_id', 'industry_id', 'position_id', 'createdAt', 'updatedAt', 'deletedAt'])
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

        const tags_obj = researcher.getTags()
        const fields = tags_obj.map(tag => {
            if(tag.type === 'fields') {
                return tag.name
            }
        })
        const other = tags_obj.map(tag => {
            if(tag.type === 'other') {
                return tag.name
            }
        })
        const tags = { fields: fields, other: other}

        const institute = researcher.getInstitute().name
        const title = researcher.getTitle().name
        const relatedLinks = researcher.relatedLinks.split(',')
        
        const newResearcher = Object.assign(researcher.get(), {tags, institute, title, relatedLinks})

        return _.omit(newResearcher, ['id','user_id', 'institute_id', 'title_id', 'createdAt', 'updatedAt', 'deletedAt'])
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
            logger.error('Invalid participant id.')
            return false
        }
        
        const {industry, position, tags, description} = userInfo

        const industry_obj = await Industry.findOne({where: {name: industry}})
        const position_obj = await Position.findOne({where: {name: position}})
        if(!industry_obj.has(position_obj)) {
            logger.error('Invalid industry and position.')
            return false 
        }
        
        const tags_pets = tags.pets.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'pets'}}))
        const tags_medicalHistory = tags.medicalHistory.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'medicalHistory'}}))
        const tags_other = tags.other.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'other'}}))
        const tags_obj = tags_pets.concat(tags_medicalHistory).concat(tags_other)

        await participant.setIndustry(industry_obj)
        await participant.setPosition(position_obj)
        await participant.setTags(tags_obj)

        participant.set({ description })
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
            logger.error('Invalid researcher id.')
            return false
        }

        const {institute, title, relatedLinks, tags, description} = userInfo

        const institute_obj = await Institute.findOne({where: {name: institute}})
        const title_obj = await Title.findOne({where: {name: title}})
        if(!institute_obj.has(title_obj)) {
            logger.error('Invalid institute and title.')
            return false 
        }
        
        const tags_fields = tags.fields.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'fields'}}))
        const tags_other = tags.other.map(async tag => await Tag.findCreateFind({where: {name: tag, type: 'other'}}))
        const tags_obj = tags_fields.concat(tags_other)

        await researcher.setInstitute(institute_obj)
        await researcher.setTitle(title_obj)
        await researcher.setTags(tags_obj)

        const links_row = relatedLinks.join(',')
        researcher.set({ description, relatedLinks: links_row })
        await researcher.save()
        
        return true
    }
}



export default UserService.getInstance()