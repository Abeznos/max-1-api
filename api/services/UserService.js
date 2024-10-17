const db = require('../db')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')

const pbService = require('./PbService')

class UserService {
    //async findBotUser(data) {
    //    const { chatId, botId } = data
//
    //    const user = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
    //    [botId, chatId])
//
    //    if(!user.rows[0]) {
    //        return await this.createBotUser(data)
    //    } else {
    //        return user.rows[0]
    //    }
    //}

    async createBotUser(body, headers) {
        const token = headers.authorization

        if(!token || token !== process.env.BOT_TOKEN) {
            throw Error('Доступ запрещен')
        }
        
        const { phone, chatId, botId, isPhoneVerified } = body

        const candidate = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
        [botId, chatId])

        if(candidate.rows[0]) {
            return candidate.rows[0].is_pb_user
        }

        const userId = uuidv4()
        const date = new Date()

        const user_hash = await bcrypt.hash(`${botId}:${chatId}:${process.env.SECRET_KEY}`, 3)

        const pb_api_token = await db.query('SELECT * FROM tokens WHERE bot_id = $1', [botId])
        const isPbUser = await pbService.checkUser(api_token.rows[0].token, phone)

        const newUser = await db.query('INSERT INTO bot_users (user_id, phone, chat_id, is_phone_verified, user_hash, is_pb_user, bot_id, created_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, phone, chatId, isPhoneVerified, user_hash, isPbUser, botId, date])

        return newUser.rows[0].is_pb_user
    }

    async getUserData(body, headers) {
        const token = headers.authorization

        if(!token || token !== process.env.APP_TOKEN) {
            throw Error('Доступ запрещен')
        }        
        const { botId, chatId } = body

        const candidate = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
        [botId, chatId])

        if(!candidate.rows[0]) {
            throw new Error('Пользователь не найден')
        }

        const access = await bcrypt.compare(`${botId}:${chatId}:${process.env.SECRET_KEY}`, candidate.rows[0].user_hash)

        if(!access) {
            throw new Error('Доступ запрещён')
        }

        const pb_api_token = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])

        return await pbService.buyerInfo(pb_api_token.rows[0].pb_token, candidate.rows[0].phone)
    }
}

module.exports = new UserService()