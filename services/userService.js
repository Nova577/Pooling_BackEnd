import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import BaseService from './baseService'
import logger from '../utils/logger'
import { User } from '../models/user'

class UserService extends BaseService {

    constructor() {
        super()
        this._loginUsers = []
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
        const user = await User.findOne({ where : { username, password }})
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
     * @description: refresh token while userlist includes the id
     * @param {*} id user id
     * @return {*}
     */
    async refreshToken(id) {
        if(!id) {
            return null
        }

        const userForToken = this._loginUsers.find(userinfo => userinfo.id === id)
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
    async verifyUser(userForToken) {
        if(!userForToken) {
            return false
        }
        if (this._loginUsers.find(userinfo => userinfo === userForToken)) {
            return true
        }
        return false
    }
}

export default UserService.getInstance()