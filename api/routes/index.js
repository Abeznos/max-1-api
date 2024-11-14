const Router = require('express')
const router = new Router()

const userRouter = require('./UserRouter')
const appRouter = require('./AppRouter')

router.use('/user', userRouter)
router.use('/app', appRouter)

module.exports = router