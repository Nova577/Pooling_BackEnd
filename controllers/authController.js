import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {User} from '../dataFactory/model/user'

async function login(request, response) {
    const { username, password } = request.body

    const user = await User.findOne({ where: { username : username, password : password } })
    const passwordCorrect = user === null
        ? false
        : bcrypt.compare(password, user.passwordHash)
    
    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        id: user.id,
        email : user.email,
        type : user.type
    }

    const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: '7d' }
    )

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
}

export default {
    login
}