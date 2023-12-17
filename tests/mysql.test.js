/* eslint-disable no-undef */
import config from '../utils/config.js'
import DataService from '../services/dataService.js'

const dataservice = new DataService

var assert = require('assert')

beforeEach(async () => {
    dataservice.init(config.DATABASE)
})

describe('check all tables', () => {
    
    it('should get right database', () => {
        const mysql = dataservice.getDatabase('mysql')
        assert.ifError(mysql)
    })

})