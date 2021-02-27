const Passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const JWT = require('jsonwebtoken')

const User = require('../models/user.model')

const { 
    SERVER_URL_PROD, SERVER_URL_DEV, 
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 
    GOOGLE_CALLBACK_URL
} = process.env

const isProduction = process.env.NODE_ENV === "production"
const serverUrl = isProduction ? SERVER_URL_PROD : SERVER_URL_DEV

const googleLogin = new GoogleStrategy(
    {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${serverUrl}${GOOGLE_CALLBACK_URL}`,
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const oldUser = await User.findOne({ email: profile.email })

            if (oldUser) {

                const token = JWT.sign(
                    {
                        id: oldUser._id,
                        email: oldUser.email
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '7d'
                    }
    
                )

                return done(null, token)
            }
            
        } catch (err) {
            console.log(err)
        }

        let password = process.env.JWT_SECRET + profile.email

        try {
            const newUser = await new User({
                email: profile.email,
                password,
                avatar: profile.picture
            }).save()

            const token = JWT.sign(
                {
                    id: newUser._id,
                    email: newUser.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '7d'
                }

            )

            done(null, token)
        } catch (err) {
            console.log(err)
        }
    }
)

Passport.use(googleLogin)
