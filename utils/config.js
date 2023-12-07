import 'dotenv/config'

const PORT = process.env.PORT

const DATABASE = {
    mysql : {
        name : 'devDB',
        username : 'username',
        password : 'password'
    }
}

export default {
    PORT,
    DATABASE
}