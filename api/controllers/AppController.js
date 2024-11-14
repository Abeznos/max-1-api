const { query } = require('express')
const appService = require('../services/AppService')

class AppController {
    async getAppData(request, response) {
        try {
            const appData = await appService.getAppData(request.params.id)
            return response.status(200).json(appData)
        } catch(error) {
            response.status(500).json(error.message)
        }
    }
}

module.exports = new AppController()