const express = require('express')
const Router = require('express')
const router = new Router()
const headerMiddleware = require('../middlewares/headerMiddleware')


const userRouter = require('./UserRouter')
const appRouter = require('./AppRouter')

router.use(headerMiddleware)
router.use('/user', userRouter)
router.use('/app', appRouter)
//router.use(express.static(path.join(__dirname, 'public')))

module.exports = router