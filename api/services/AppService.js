const db = require('../db')

class AppService {
    async getAppData(id) {
        const appData = await db.query('SELECT app_data FROM bots WHERE bot_id = $1', [id])
        console.log(appData)
        return appData.rows[0]
    }
}

module.exports = new AppService()