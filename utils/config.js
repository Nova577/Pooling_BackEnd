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

const DATABASE_MYSQL_NAME = 'mysql'
const DATABASE_MYSQL_USERNAME = 'root'
const DATABASE_MYSQL_PASSWORD = 'poolingtest'
const DATABASE_MYSQL_OPTIONS = {
    host : 'localhost',
    dialect : 'mysql',
    logging: true,
    timezone: '+08:00'
}

export default {
    ENV,
    PORT,
    DATABASE,
    DATABASE_MYSQL_NAME,
    DATABASE_MYSQL_USERNAME,
    DATABASE_MYSQL_PASSWORD,
    DATABASE_MYSQL_OPTIONS
}