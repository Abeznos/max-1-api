const db = require('../db')
const axios = require('axios').default
const https = require('node:https')

const pb_api = axios.create({
    httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
    withCredentials: true,
    baseURL: process.env.PB_API,
})

pb_api.interceptors.request.use((config) => {
    config.headers["Content-Type"] = 'application/json'
    return config
})

const sender_api = axios.create({
    
    withCredentials: true,
    baseURL: process.env.SENDER_API,
})

sender_api.interceptors.request.use((config) => {
    config.headers.Authorization = `Basic ${process.env.SENDER_API_TOKEN}`
    config.headers["Content-Type"] = 'application/json'
    return config
})

class PbService {
    //async checkUser(token, phone) {
    //    try {
    //        const response = await pb_api.post(`/buyer-info`,
    //            {
    //                identificator: phone
    //            },
    //            {
    //                headers: {Authorization: token }
    //            }
    //        )
    //        return response.data.is_registered
    //    } catch(error) {
    //        console.log(error);
    //        throw new Error('Ошибка при получении информации о покупателе')
    //    }
    //}

    async checkUser(botId, chatId) {
        try {
            const response = await sender_api.get(`/client/app?chat_id=${chatId}&bot_id=${botId}`)
            return response.data
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка при получении информации о покупателе')
        }
    }    

    async buyerInfo(token, phone) {
        try {
            const response = await pb_api.post(`/buyer-info-detail`,
                {
                    identificator: phone
                },
                {
                    headers: {Authorization: token }
                }
            )
            return response.data
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка при получении информации о покупателе')
        }
    }

    async buyerOrderCode(token, phone) {
        try {
            const response = await pb_api.post(`/generate-order-code`,
                {
                    phone: phone
                },
                {
                    headers: {Authorization: token }
                }
            )
            return response.data
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка при получении информации о покупателе')
        }
    }

    async getMlmCOde(token, phone) {
        try {
            const response = await pb_api.post(`/buyer-invite-code`,
                {
                    identificator: phone
                },
                {
                    headers: {Authorization: token }
                }
            )
            return response.data
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка при получении информации о покупателе')
        }
    }

    async buyerRegister(token, user) {
        //console.log(user)
        try {
            const response = await pb_api.post(`/buyer-register`, user,
                {
                    headers: {Authorization: token }
                }
            )
            return response.data
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка при регистрации покупателя')
        }
    }

    async updateBuyer(token, user) {
        try {
            const response = await pb_api.post(`/buyer-edit`, user,
                {
                    headers: {Authorization: token }
                }
            )
            console.log(response.data)
            return response.data
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка при обновлении покупателя')
        }
    }
    async sendTrigger(token, user, trigger) {
        try {
            const response = await pb_api.post(`/trigger`, {
                    phone: user, 
                    event_name: trigger
                },
                {
                    headers: {Authorization: token }
                }
            )
            return response.data
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка отпраки триггера')
        }
    }
}

module.exports = new PbService()