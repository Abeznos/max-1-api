const Router = require('express')
const router = new Router()
const userController = require('../controllers/UserController')

router.get('/:id', userController.findUser)


module.exports = router