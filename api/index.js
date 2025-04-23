require('dotenv').config()

const express = require('express')
const cors = require('cors')
const router = require('./routes/index')
const PORT = process.env.PORT || 3000

const bodyParser = require('body-parser')
const path = require('path')

const app = express()
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.DEV_URL,
  process.env.PRE_PROD,
  process.env.FLUTTER,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

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
