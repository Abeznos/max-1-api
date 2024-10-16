const db = require('../db')
const axios = require('axios').default

const pb_api = axios.create({
    withCredentials: true,
    baseURL: process.env.PB_API
})

pb_api.interceptors.request.use((config) => {
    config.headers["Content-Type"] = 'application/json'
    return config
})

class PbService {
    async checkUser(token, phone) {

        //if(!token) {
        //    throw new Error('Нет токена для компании')
        //}

        try {
            const response = await pb_api.post(`/buyer-info`,
                {
                    identificator: phone
                },
                {
                    headers: {Authorization: token }//api_token.rows[0].pb_token}
                }
            )
            return response.data.is_registered
        } catch(error) {
            console.log(error);
            throw new Error('Ошибка при получении информации о покупателе')
        }
    }

    async buyerInfo(token, phone) {

        //if(!token) {
        //    throw new Error('Нет токена для компании')
        //}

        try {
            const response = await pb_api.post(`/buyer-info`,
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
}

module.exports = new PbService()