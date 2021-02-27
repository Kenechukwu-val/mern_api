const express = require('express')
const passport = require('passport')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./utils/db')


const app = express()
dotenv.config({ path: './utils/config.env'})

//cors
app.use(cors())

//bodyParser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//Passport initialization
app.use(passport.initialize())
require('./controllers/login.controller')
require('./controllers/googleStrategy')
require('./controllers/facebookStrategy')

//Database connection
connectDB()

const port = process.env.PORT || 5000

//Checking if it's on development or production
if (process.env.NODE_ENV === 'development') {
    //Getting information about each request
    app.use(morgan('dev'))
}

//Load all routes
const authRoutes = require('./routes/auth.route')

//Use routes
app.use('/', authRoutes)



app.listen(port, () => {
    console.log(`Server running on ${process.env.NODE_ENV} on port ${port}`)

})












