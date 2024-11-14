const Router = require('express')
const router = new Router()
const appController = require('../controllers/AppController')

router.get('/:id', appController.getAppData)

module.exports = router