import 'dotenv/config'

const ENV = process.env.NODE_ENV

const PORT = process.env.PORT

const DATABASE = {
    mysql : {
        name : 'devDB',
        username : 'username',
        password : 'password'
    }
}

export default {
    ENV,
    PORT,
    DATABASE
}