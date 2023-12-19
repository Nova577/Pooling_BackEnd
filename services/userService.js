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
    async login(username, password) {
        if(!username || !password) {
            throw new HttpError('InvalidInputError', 'please enter username and password.', 400)
        }
        const user = await User.findOne({ where : { email : username, password }})
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
     * @param {*} longToken  long term token
     * @return {*}
     */
    logout(shortToken) {
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

    async createUser(userInfo, type) {
        if(!userInfo) {
            return null
        }
        const { email, password, name, sex, birth} = userInfo

        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)

        const user = await User.create({
            email,
            passwordHash,
            name,
            sex,
            birth,
            type
        })

        return user
    }

    async getUser(id) {
        if(!id) {
            return null
        }
        const user = await User.findByPk(id)
        return user
    }

    async createParticipant(participantInfo) {
        if(!participantInfo) {
            throw new HttpError('InvalidInputError', 'please enter user information.', 400)
        }
        const { email, password, name, sex, birth } = participantInfo

        const user = this.createUser({ email, password, name, sex, birth }, 0)
        if(!user){
            logger.error('create user failed.')
            throw new HttpError('SystemError', 'create user failed.', 500)
        }

        const {country, state, industry, position, tags, description} = participantInfo
        const pets = tags.pets.join(',')
        const medicalHistory = tags.medicalHistory.join(',')
        const other = tags.other.join(',')

        const participant = await Participant.create({
            userId : user.id,
            country,
            state,
            industry,
            position,
            description,
            pets,
            medicalHistory,
            other
        })
        if(!participant){
            await user.destroy()
            throw new HttpError('SystemError', 'create user failed.', 500)
        }

        return true
    }

    async getParticipant(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'please enter user id.', 400)
        }
        const user = await User.findByPk(id)
        if(!user) {
            throw new HttpError('NotFound', 'user not found', 404)
        }
        const participant = await Participant.findOne({ where : { userId : id }})
        if(!participant) {
            throw new HttpError('SystemError', 'user info lost', 404)
        }

        const pets = participant.fields.split(',')
        const medicalHistory = participant.links.split(',')
        const other = participant.other.split(',')
        const tags = {pets, medicalHistory, other}

        const newParticipant = Object.assign(user.get(), participant.get(), {tags})

        return _.omit(newParticipant, ['passwordHash', 'createdAt', 'updatedAt', 'fields', 'links', 'other', 'userId']).toJSON()
    }

    async createResearcher(researcherInfo) {
        if(!researcherInfo) {
            throw new HttpError('InvalidInputError', 'please enter user information.', 400)
        }
        const { email, password, name, sex, birth} = researcherInfo

        const user = this.createUser({ email, password, name, sex, birth }, 1)
        if(!user){
            logger.error('create user failed.')
            throw new HttpError('SystemError', 'create user failed.', 500)
        }

        const {country, state, institute, title, tags, description} = researcherInfo
        const fields = tags.fields.join(',')
        const links = tags.links.join(',')
        const other = tags.other.join(',')

        const researcher = Researcher.create({
            userId : user.id,
            country,
            state,
            institute,
            title,
            description,
            fields,
            links,
            other
        })
        if(!researcher){
            await user.destroy()
            throw new HttpError('SystemError', 'create user failed.', 500)
        }

        return true
    }

    async getResearcher(id) {
        if(!id) {
            throw new HttpError('InvalidInputError', 'please enter user id.', 400)
        }
        const user = await User.findByPk(id)
        if(!user) {
            throw new HttpError('NotFound', 'user not found', 404)
        }
        const researcher = await Researcher.findOne({ where : { userId : id }})
        if(!researcher) {
            throw new HttpError('SystemError', 'user info lost', 404)
        }

        const fields = researcher.fields.split(',')
        const links = researcher.links.split(',')
        const other = researcher.other.split(',')
        const tags = {fields, links, other}
        
        const newResearcher = Object.assign(user.get(), researcher.get(), {tags})

        return _.omit(newResearcher, ['passwordHash', 'createdAt', 'updatedAt', 'fields', 'links', 'other', 'userId']).toJSON()
    }
}

export default UserService