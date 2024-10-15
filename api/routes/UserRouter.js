const Router = require('express')
const router = new Router()
const userController = require('../controllers/UserController')

//router.get('/:id', userController.findUser)
router.post('/', userController.createBotUser)
router.get('/', userController.getUserData)


module.exports = router