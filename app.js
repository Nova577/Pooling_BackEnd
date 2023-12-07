import express from 'express'
import cors from 'cors'
import config from'./utils/config'
import logger from './utils/logger'
import middleware from './utils/middleware'
import DataFactory from './dataFactory/dataFactory'

const app = express()
const dataFactory = DataFactory.getInstance()

//init database
dataFactory.init(config.DATABASE)
logger.debug('init dataFactory')

//init basic module
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

//TODO:routers

//error handle
app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)

module.exports = app

