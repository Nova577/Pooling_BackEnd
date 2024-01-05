class BaseService {
    
    constructor() {}

    /**
     * @description: init class instance by using config
     * @param {*} config config
     * @return {*}
     */
    async init(config) {
        this._config = config
    }

    /**
     * @description: service class should be singler mode
     * @return {*}
     */    
    static getInstance() {
        if(!this._instance){
            this._instance = new BaseService()
        }
        return this._instance
    }

}

export default BaseService
