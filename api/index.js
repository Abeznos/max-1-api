require('dotenv').config()

const express = require('express')
const cors = require('cors')
const router = require('./routes/index')
const PORT = process.env.PORT || 3000

const bodyParser = require('body-parser')
const path = require('path')

const app = express()
app.use(cors())

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', router)

async function startApp() {
  try {
    app.listen(PORT, () => console.log(`SERVER STARTED ON PORT ${PORT}`))
  } catch(error) {
    console.log(error)
  }
}

startApp()
