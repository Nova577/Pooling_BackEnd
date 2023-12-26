import _ from 'lodash'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import BaseService from './baseService.js'
import logger from '../utils/logger.js'
import { HttpError } from '../utils/error.js'
import { User, Participant, Researcher } from '../models/user.js'

class UserService extends BaseService {

    constructor() {
        super()
        this._refreshTokens = []
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
        const user = await User.findOne({ where : { email : username }})
        const passwordCorrect = (user === null
            ? false
            : bcrypt.compare(password, user.passwordHash)
        )
        
        if (!(user && passwordCorrect)) {
            throw new HttpError('InvalidInputError', 'invalid username or password.', 401)
        }
    
        const userForToken = {
            id: user.id,
            email : user.email,
            type : user.type
        }
    
        const shortToken = jwt.sign(
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

        const longToken = jwt.sign(
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
        const refreshToken = bcrypt.hashSync(longToken.concat(shortToken), saltRounds)

        this._refreshTokens.push({userForToken, refreshToken})

        return { id : user.id, type : user.type, shortToken, longToken }
    }

    /**
     * @description: delete the refreshToken from list set it loggout
     * @param {*} shortToken
     * @return {*}
     */
    signOut(shortToken) {
        if(!shortToken) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 400)
        }
        
        const userForToken = jwt.verify(
            shortToken,
            process.env.SECRET
        )

        const index = this._refreshTokens.findIndex(obj => obj.userForToken === userForToken)
        if(index !== -1) {
            this._refreshTokens.splice(index, 1)
        }

        return true
    }

    /**
     * @description: refresh token when shortToken expired
     * @param {*} shortToken
     * @param {*} longToken
     * @return {*}
     */
    async refreshToken(shortToken, longToken) {
        if(!shortToken || !longToken) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 400)
        }

        const userForToken = jwt.verify(
            shortToken,
            process.env.SECRET
        )

        const index = this._refreshTokens.findIndex(obj => obj.userForToken === userForToken)
        if(index === -1) {
            throw new HttpError('JsonWebTokenError', 'user has been logged out.', 401)
        }
        if(!bcrypt.compare(longToken.concat(shortToken), this._refreshTokens[index].refreshToken)) {
            throw new HttpError('JsonWebTokenError', 'invalid token.', 401)
        }

        const newShortToken = jwt.sign(
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
        const refreshToken = bcrypt.hashSync(longToken.concat(newShortToken), saltRounds)

        Object.assign(this._refreshTokens[index], refreshToken)

        return newShortToken
    }

    /**
     * @description: create user by type
     * @param {*} userInfo
     * @param {*} type 0:participant, 1: researcher
     * @return {*}
     */
    async createUser(userInfo, type) {
        if(!userInfo) {
            throw new HttpError('InvalidInputError', 'please enter user information.', 400)
        }

        const { email, password, name, sex, birth, country, state } = userInfo

        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)

        const user = await User.create({
            email,
            passwordHash,
            name,
            sex,
            birth,
            type,
            country,
            state
        })
        if(!user){
            logger.error('create user failed.')
            throw new HttpError('SystemError', 'create user failed.', 500)
        }
        
        if (type === 0) {
            const { industry, position, tags, description } = userInfo
            const participant = await this.createParticipant(
                { userId : user.id, industry, position, tags, description }
            )
            if(!participant){
                await user.destroy()
                throw new HttpError('SystemError', 'create user failed.', 500)
            }
        } else if (type === 1) {
            const { institute, title, tags, description } = userInfo
            const researcher = await this.createParticipant(
                { userId : user.id, institute, title, tags, description }
            )
            if(!researcher){
                await user.destroy()
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
        const userInfo = _.omit(user.get(), ['passwordHash', 'type', 'createdAt', 'updatedAt'])

        let roleInfo = null
        if(user.type === 0) {
            roleInfo = this.getParticipant(id)

        } else if (user.type  === 1) {
            roleInfo = this.getResearcher(id)
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

        let role = null 
        if(user.type === 0) {
            role = Participant.findOne({ where : { userId : id }})
        } else if (user.type === 1) {
            role = Researcher.findOne({ where : { userId : id }})
        }

        role.set()
    }

    /**
     * @description: create participant, private func
     * @param {*} participantInfo
     * @return {*}
     */
    async createParticipant(participantInfo) {
        if(!participantInfo) {
            return null
        }

        const {userId, industry, position, tags, description} = participantInfo
        const pets = tags.pets.join(',')
        const medicalHistory = tags.medicalHistory.join(',')
        const other = tags.other.join(',')

        const participant = await Participant.create({
            userId,
            industry,
            position,
            description,
            pets,
            medicalHistory,
            other
        })
        if(!participant){
            return null
        }

        return participant
    }

    /**
     * @description: create researcher, private func
     * @param {*} participantInfo
     * @return {*}
     */
    async createResearcher(researcherInfo) {
        if(!researcherInfo) {
            return null
        }

        const {userId, institute, title, tags, description} = researcherInfo
        const fields = tags.fields.join(',')
        const links = tags.links.join(',')
        const other = tags.other.join(',')

        const researcher = await Researcher.create({
            userId,
            institute,
            title,
            description,
            fields,
            links,
            other
        })
        if(!researcher){
            return null 
        }

        return researcher
    }
    
    /**
     * @description: get participant by id
     * @param {*} id
     * @return {*}
     */
    async getParticipant(id) {
        if(!id) {
            return null
        }

        const participant = await Participant.findOne({ where : { userId : id }})
        if(!participant) {
            return null
        }
        const pets = participant.pets.split(',')
        const medicalHistory = participant.medicalHistory.split(',')
        const other = participant.other.split(',')
        const tags = {pets, medicalHistory, other}

        const newParticipant = Object.assign(participant.get(), {tags})

        return _.omit(newParticipant, ['pets', 'medicalHistory', 'other', 'userId'])
    }

    /**
     * @description: get researcher by id
     * @param {*} id
     * @return {*}
     */
    async getResearcher(id) {
        if(!id) {
            return null
        }

        const researcher = await Researcher.findOne({ where : { userId : id }})
        if(!researcher) {
            return null
        }

        const fields = researcher.fields.split(',')
        const links = researcher.links.split(',')
        const other = researcher.other.split(',')
        const tags = {fields, links, other}
        
        const newResearcher = Object.assign(researcher.get(), {tags})

        return _.omit(newResearcher, ['fields', 'links', 'other', 'userId'])
    }

    /**
     * @description: update participant info by id
     * @param {*} id
     * @return {*}
     */
    async updateParticipant(id, userInfo) {
        if(!id || !userInfo) {
            return null
        }
        
        const participant = await Participant.findOne({ where : { userId : id }})
        //TODO:处理tags
        const newParticipantInfo = Object.assign(participant.get(), userInfo)
        participant.set(newParticipantInfo)
        await participant.save()
        
        return true
    }

    /**
     * @description: update researcher info by id
     * @param {*} id
     * @return {*}
     */
    async updateResearcher(id, userInfo) {
        if(!id || !userInfo) {
            return null
        }

        const researcher = await Researcher.findOne({ where : { userId : id }})
        //TODO:处理tags
        const newResearcherInfo = Object.assign(researcher.get(), userInfo)
        researcher.set(newResearcherInfo)
        await researcher.save()

        return true
    }
}

export default UserService