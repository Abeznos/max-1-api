const { query } = require('express')
const userService = require('../services/UserService')

class UserController {
    async createBotUser(request, response) {
        try {
            const user = await userService.createUser(request.body)
            return response.status(201).json(user)
        } catch(error) {
            response.status(500).json(error.message)
        }
    }
}

module.exports = new UserController()