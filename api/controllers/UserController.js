const { query } = require('express')
const userService = require('../services/UserService')

class UserController {
    async createBotUser(request, response) {
        try {
            const user = await userService.findBotUser(request.body)
            return response.status(201).json(user)
        } catch(error) {
            response.status(500).json(error.message)
        }
    }

    async getUserData (request, response) {
        try {
            const data = await userService.getUserData(request.body)
            return response.status(200).json(data)
        } catch(error) {
            response.status(500).json(error.message)
        }
    }
}

module.exports = new UserController()