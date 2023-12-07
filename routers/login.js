import express from 'express'
import authController from '../controllers/authController'

const loginRouter = express.Router()

loginRouter.post('/', authController.login)

