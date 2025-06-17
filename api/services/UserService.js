const db = require('../db')
const { v4: uuidv4 } = require('uuid')
const QRCode = require('qrcode')

const pbService = require('./PbService')
const appService = require('./AppService')

class UserService {
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
            console.log(candidate.rows[0])
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

        const appData = await appService.getAppData(botId)

        const candidate = await pbService.checkUser(botId, chatId)

        if (!candidate) {
            return { pbUserData: { isBotUser: false }, appData: {...appData} }
        }

        const pb_api_token = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
        const buyerInfo = await pbService.buyerInfo(pb_api_token.rows[0].pb_token, candidate.phone)

        if (!buyerInfo.is_registered || !buyerInfo.success) {
            return { pbUserData: { isPbUser: false }, appData: {...appData} }
        }
        
        const buyerOrderCode = await pbService.buyerOrderCode(pb_api_token.rows[0].pb_token, candidate.phone)
        const referalCode = await pbService.getMlmCOde(pb_api_token.rows[0].pb_token, candidate.phone)

        return { pbUserData: { ...buyerInfo, ...buyerOrderCode, referral_code: referalCode.referral_code }, appData: {...appData}}

        //const candidate = await db.query('SELECT * FROM bot_users WHERE bot_id = $1 AND chat_id = $2',
        //[botId, chatId])
//
        //const appData = await appService.getAppData(botId)
        //
        //if(!candidate.rows[0] || !candidate.rows[0].phone) {
        //    return { pbUserData: { isBotUser: false }, appData: {...appData} }
        //}
//
        //if(!candidate.rows[0].is_pb_user) {
        //    return { pbUserData: { isPbUser: false }, appData: {...appData} }
        //}
        //const pb_api_token = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
        //const buyerInfo = await pbService.buyerInfo(pb_api_token.rows[0].pb_token, candidate.rows[0].phone)
//
//
        //const buyerOrderCode = await pbService.buyerOrderCode(pb_api_token.rows[0].pb_token, candidate.rows[0].phone)
        ////const qr = await this.generateOrderCodeQr(buyerOrderCode.order_code)
//
        //const referalCode = await pbService.getMlmCOde(pb_api_token.rows[0].pb_token, candidate.rows[0].phone)
//
        //return { pbUserData: { ...buyerInfo, ...buyerOrderCode, referral_code: referalCode.referral_code }, appData: {...appData}}
        
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

        const candidate = await pbService.checkUser(botId, chatId)

        const { phone, registration_point } = candidate
        const userData = { ...body.userData, phone }

        if (registration_point) {
            userData.registration_point = registration_point
        }

        const bot = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
    
        const pbNewBuyer = await pbService.buyerRegister(bot.rows[0].pb_token, userData)
        console.log(pbNewBuyer)

        //if(pbNewBuyer.is_registered) {
        //    const is_pb_user = await db.query('UPDATE bot_users SET is_pb_user = $1 WHERE bot_id = $2 AND chat_id = $3 RETURNING *',
        //    [true, botId, chatId])
        //    console.log('is_pb_user')
        //    console.log(is_pb_user.rows[0])
        //}

        if(bot.rows[0].registrations_trigger) {
            const trigger = await pbService.sendTrigger(bot.rows[0].pb_token, candidate.phone, bot.rows[0].registrations_trigger)
            console.log('trigger', trigger)
        }
        
        return pbNewBuyer
    }

    async updateUser(body, headers) {
        console.log(body)
        const token = headers.authorization.split(' ')[1]

        if(!token || token!== process.env.APP_TOKEN) {
            throw Error('Доступ запрещен')
        }

        const { botId, chatId } = body

        const candidate = await pbService.checkUser(botId, chatId)
        const phone = candidate.phone

        const userData = {...body.userData, phone}

        const bot = await db.query('SELECT * FROM bots WHERE bot_id = $1', [botId])
        const updatedBuyer = await pbService.updateBuyer(bot.rows[0].pb_token, userData)

        if (body.formName === 'importantDates') {
            if (bot.rows[0].triggers.includes(body.formName)) {
                const sendTrigger = await pbService.sendTrigger(bot.rows[0].pb_token, phone, body.formName)
                console.log('sendTrigger', sendTrigger)
            }
        }
        
        return updatedBuyer
    }
}

module.exports = new UserService()
