const db = require('../db')
const { v4: uuidv4 } = require('uuid')
const QRCode = require('qrcode')

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
        console.log(body)

        const token = headers.authorization

        if(!token || token !== process.env.BOT_TOKEN) {
            throw Error('Доступ запрещен')
        }

        const { phone, chatId, botId, isPhoneVerified } = body

        const candidate = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
        [botId, chatId])

        if (candidate.rows[0]) {
            return candidate.rows[0].is_pb_user
        }

        const userId = uuidv4()
        const date = new Date()

        const pb_api_token = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
        console.log(pb_api_token.rows[0])

        if (!pb_api_token.rows[0].pb_token) {
            throw Error('Ошибка')
        }

        const pbResponse = await pbService.checkUser(pb_api_token.rows[0].pb_token, phone)

        const newUser = await db.query('INSERT INTO bot_users (user_id, phone, chat_id, is_phone_verified, is_pb_user, bot_id, created_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userId, phone, chatId, isPhoneVerified, pbResponse, botId, date])

        return newUser.rows[0].is_pb_user
    }

    async getUserData(body, headers) {
        const token = headers.authorization.split(' ')[1]
        if(!token || token !== process.env.APP_TOKEN) {
            throw Error('Доступ запрещен')
        }
        const { botId, chatId } = body

        const candidate = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
        [botId, chatId])

        if(!candidate.rows[0] || !candidate.rows[0].phone) {
            return { isBotUser: false }
        }

        if(!candidate.rows[0].is_pb_user) {
            return { isPbUser: false }
        }

        const pb_api_token = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
        const buyerInfo = await pbService.buyerInfo(pb_api_token.rows[0].pb_token, candidate.rows[0].phone)

        const buyerOrderCode = await pbService.buyerOrderCode(pb_api_token.rows[0].pb_token, candidate.rows[0].phone)
        const qr = await this.generateOrderCodeQr(buyerOrderCode.order_code)

        return { ...buyerInfo, ...buyerOrderCode, qr: qr }
    }

    async generateOrderCodeQr(code) {
        return await QRCode.toString(code,{type:'svg'})
    }

    async userRegistration(body, headers) {
        const token = headers.authorization.split(' ')[1]

        if(!token || token!== process.env.APP_TOKEN) {
            throw Error('Доступ запрещен')
        }

        const { botId, chatId } = body

        const candidate = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
        [botId, chatId])
        const phone = candidate.rows[0].phone

        const userData = {...body.formData, phone}

        const bot = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
        console.log('bot')
        console.log(bot.rows[0])

        const pbNewBuyer = await pbService.buyerRegister(bot.rows[0].pb_token, userData)
        console.log('pbNewBuyer')
        console.log(pbNewBuyer)

        if(pbNewBuyer.is_registered) {
            const is_pb_user = await db.query('UPDATE bot_users SET is_pb_user = $1 WHERE bot_id = $2 AND chat_id = $3 RETURNING *',
            [true, botId, chatId])
            console.log('is_pb_user')
            console.log(is_pb_user.rows[0])
        }

        console.log('bot.registrations_trigger')
        console.log(bot.rows[0].registrations_trigger)
        if(bot.rows[0].registrations_trigger) {
            const trigger = await pbService.sendTrigger(bot.rows[0].pb_token, candidate.rows[0].phone, bot.rows[0].registrations_trigger)
            console.log('trigger')
            console.log(trigger)
        }
        

        return pbNewBuyer
    }

    async updateUserIportantDates(body, headers) {
        console.log(body)
        const token = headers.authorization.split(' ')[1]

        if(!token || token!== process.env.APP_TOKEN) {
            throw Error('Доступ запрещен')
        }

        const { botId, chatId } = body

        const candidate = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
        [botId, chatId])
        const phone = candidate.rows[0].phone
        console.log(phone)

        const userData = {...body.formData, phone}
        console.log(userData)

        const pb_api_token = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
        const updatedBuyer = await pbService.updateBuyer(pb_api_token.rows[0].pb_token, userData)

        return updatedBuyer
    }
}

module.exports = new UserService()