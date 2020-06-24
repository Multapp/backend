import express from 'express'
import morgan from 'morgan'
import path from 'path'
import routes from './routes/index.js'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

const app = express()

//Settings
app.set('port', process.env.PORT || 4000)

//Middlewares
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser())

//Routes
app.use(routes)

//Static files
app.use(express.static(path.join(__dirname,'public')))

export const ap = app