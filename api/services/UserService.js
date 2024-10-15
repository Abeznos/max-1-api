const db = require('../db')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')

const pbService = require('./PbService')

class UserService {
    async findBotUser(data) {
        const { phone, chatId, botId } = data

        const user = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND phone = $2 AND chat_id = $3',
        [botId, phone, chatId])

        if(!user.rows[0]) {
            return await this.createBotUser(data)
        } else {
            return user.rows[0].is_pb_user
        }
    }

    async createBotUser(data) {
        const { phone, chatId, botId, isPhoneVerified } = data
        const userId = uuidv4()
        const date = new Date()

        const user_hash = await bcrypt.hash(`${botId}:${chatId}:${process.env.SECRET_KEY}`, 3);

        const isPbUser = await pbService.buyerInfo(botId, phone)

        const newUser = await db.query('INSERT INTO bot_users (user_id, phone, chat_id, is_phone_verified, user_hash, is_pb_user, bot_id, created_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, phone, chatId, isPhoneVerified, user_hash, isPbUser, botId, date])

        return newUser.rows[0].is_pb_user
    }
}

module.exports = new UserService()