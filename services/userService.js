import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import BaseService from './baseService.js'
import logger from '../utils/logger.js'
import { User, Participant, Researcher } from '../models/user.js'

class UserService extends BaseService {

    constructor() {
        super()
        this._loginUsers = []
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
            return null
        }
        const user = await User.findOne({ where : { email : username, password }})
        const passwordCorrect = (user === null
            ? false
            : bcrypt.compare(password, user.passwordHash)
        )
        
        if (!(user && passwordCorrect)) {
            return null
        }
    
        const userForToken = {
            id: user.id,
            email : user.email,
            type : user.type
        }
    
        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            process.env.EXPIRE,
            error => {
                if(error) {
                    logger.error(`JWT sign failed: ${error.name} ${error.message}.`)
                } else {
                    logger.info('JWT sign success.')
                }
            }
        )
        if(!token){
            return null
        }

        this._loginUsers.push(userForToken)
        return token
    }

    /**
     * @description: delete the user from list
     * @param {*} id user id
     * @return {*}
     */
    logout(id) {
        if(!id) {
            return null
        }

        const newUsers = this._loginUsers.filter(userinfo => userinfo.id !== id)
        this._loginUsers = newUsers
    }

    /**
     * @description: refresh token while userlist includes the id
     * @param {*} id user id
     * @return {*}
     */
    async refreshToken(id) {
        if(!id) {
            return null
        }

        const userForToken = this._loginUsers.findOne(userinfo => userinfo.id === id)
        if(!userForToken) {
            return null
        }

        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            process.env.EXPIRE,
            error => {
                if(error) {
                    logger.error(`JWT sign failed: ${error.name} ${error.message}.`)
                } else {
                    logger.info('JWT sign success.')
                }
            }
        )
        return token
    }

    /**
     * @description: check if the userForToken logged in.
     * @param {*} userForToken userForToken from client
     * @return {*}
     */
    async verifyUserAuth(userForToken) {
        if(!userForToken) {
            return false
        }
        if (this._loginUsers.findOne(userinfo => userinfo === userForToken)) {
            return true
        }
        return false
    }

    createUser(userInfo) {
        if(!userInfo) {
            return false
        }
        const { email, password, name, sex, birth} = userInfo

        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)

        const user = User.create({
            email,
            passwordHash,
            name,
            sex,
            birth,
            type : 0
        })
        return user
    }

    getUser(id) {
        if(!id) {
            return null
        }
        const user = User.findByPk(id)
        return user
    }

    createParticipant(participantInfo) {
        if(!participantInfo) {
            return false
        }
        const { email, password, name, sex, birth } = participantInfo

        const user = this.createUser({ email, password, name, sex, birth })
        if(!user){
            return false
        }

        const {country, state, industry, position, description} = participantInfo
        const pets = participantInfo.pets.join(',')
        const medicalHistory = participantInfo.medicalHistory.join(',')
        const other = participantInfo.other.join(',')

        const participant = Participant.create({
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
            return false
        }

        return true
    }

    getParticipant(id) {
        if(!id) {
            return null
        }
        const user = User.findByPk(id)
        if(!user) {
            return null
        }
        const participant = Participant.findOne({ where : { userId : id }})
        if(!participant) {
            return null
        }

        const newParticipant = Object.assign(user.get(), participant.get())
        const newFields = newParticipant.fields.split(',')
        const newLinks = newParticipant.links.split(',')
        const newOther = newParticipant.other.split(',')
        Object.assign(newParticipant, {fields : newFields, links : newLinks, other : newOther})

        return newParticipant.toJSON()
    }

    createResearcher(researcherInfo) {
        if(!researcherInfo) {
            return null
        }
        const { email, password, name, sex, birth} = researcherInfo

        const user = this.createUser({ email, password, name, sex, birth })
        if(!user){
            return null
        }

        const {country, state, institute, title, description} = researcherInfo
        const fields = researcherInfo.fields.join(',')
        const links = researcherInfo.links.join(',')
        const other = researcherInfo.other.join(',')

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
            return null
        }

        return true
    }

    getResearcher(id) {
        if(!id) {
            return null
        }
        const user = User.findByPk(id)
        if(!user) {
            return null
        }
        const researcher = Researcher.findOne({ where : { userId : id }})
        if(!researcher) {
            return null
        }

        const newResercher = Object.assign(user.get(), researcher.get())
        const fields = newResercher.fields.split(',')
        const links = newResercher.links.split(',')
        const other = newResercher.other.split(',')
        Object.assign(newResercher, {fields, links, other})

        return newResercher.toJSON()
    }
}

export default UserService