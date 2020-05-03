const express = require('express')
const morgan = require('morgan')
const path = require('path')
const routes = require('./routes/index')
const bodyParser = require('body-parser')

const app = express()

//Settings
app.set('port', process.env.PORT || 4000)

//Middlewares
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Routes
app.use(routes)

//Static files
app.use(express.static(path.join(__dirname,'public')))

module.exports = app