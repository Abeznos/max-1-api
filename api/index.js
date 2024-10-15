require('dotenv').config()

const express = require('express')
const cors = require('cors')
const router = require('./routes/index')
const PORT = process.env.PORT || 3000

const bodyParser = require('body-parser')
const path = require('path')

const app = express()
app.use(cors(
  {
      credentials: true,
      origin: [process.env.CLIENT_URL],
      sameSite: 'none'
  }
))
app.use(express.json())
app.use(express.static('public'))

app.use('/', router)

async function startApp() {
  try {
    app.listen(PORT, () => console.log(`SERVER STARTED ON PORT ${PORT}`))
  } catch(error) {
    console.log(error)
  }
}

startApp()
