const Router = require('express')
const router = new Router()
const userController = require('../controllers/UserController')

//router.get('/:id', userController.findUser)
router.post('/', userController.createBotUser)
router.post('/login', userController.getUserData)
router.post('/registration', userController.userRegistration)
router.post('/update-user', userController.updateUser)




module.exports = router