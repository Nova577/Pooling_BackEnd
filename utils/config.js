import 'dotenv/config'

const ENV = process.env.NODE_ENV

const PORT = process.env.PORT

const DATABASE = {
    name: 'mysql',
    username: 'root',
    password: 'poolingtest',
    options: {
        host : 'localhost',
        dialect : 'mysql',
        logging: true,
        timezone: '+08:00'
    }
}

const MAIL = {
    host: 'mail.pooling.tools',
    port: 8888,
    secure: true,
    auth: {
        user: 'Authenticator',
        pass: '123456'
    }
}

export default {
    ENV,
    PORT,
    DATABASE,
    MAIL
}