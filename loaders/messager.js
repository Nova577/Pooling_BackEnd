import config from '../utils/config.js'
import logger from '../utils/logger.js'
import messageService from '../services/messageService.js'


export default async () => {
    //init dataService
    messageService.init(config)
    
    logger.info('message service init success.')
}