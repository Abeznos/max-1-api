const db = require('../db')
const { v4: uuidv4 } = require('uuid')

class UserService {
    async findBotUser(data) {
        const { phone, chatId, botId } = data

        const user = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND user_phone = $2 AND chat_id = $3',
        [botId, phone, chatId])

        if(user.rows[0].length > 0) {
            return 'exist'
        }

        await this.createBotUser(data)
    }

    async createBotUser(data) {
        const { phone, chatId, botId } = data
        const userId = uuidv4()
        const date = new Date()

        const secret = await this.createUserSecret(data)

        const newUser = await db.query('INSERT INTO bot_users (user_id, phone, chat_id, user_secret, bot_id, created_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, phone, chatId, secret, botId, date])
    }

    async createUserSecret(data) {
        return secret
    }
}

module.exports = new UserService()